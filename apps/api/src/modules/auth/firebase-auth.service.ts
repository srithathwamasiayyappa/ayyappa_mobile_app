import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const FIREBASE_PROJECT_ID = 'srithathwamasiayyappa-6a56f';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyDWLl90R09PLwdgk9gT6TfsdTPRqaQFAec';

export interface VerifiedFirebaseIdentity {
  uid: string;
  phoneNumber: string;
  cleanPhone: string;
}

@Injectable()
export class FirebaseAuthService {
  private firebaseApp: App;

  constructor(private readonly prisma: PrismaService) {
    if (getApps().length === 0) {
      this.firebaseApp = initializeApp({
        projectId: FIREBASE_PROJECT_ID,
      });
    } else {
      this.firebaseApp = getApps()[0];
    }
  }

  /**
   * Cryptographically verify Firebase Phone Auth ID Token
   * 1. Requires valid, signed Firebase ID token
   * 2. Checks issuer: https://securetoken.google.com/srithathwamasiayyappa-6a56f
   * 3. Checks audience: srithathwamasiayyappa-6a56f
   * 4. Enforces verified phone_number claim
   * 5. Fallback verification via Google Identity Toolkit REST API
   */
  async verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseIdentity> {
    if (!idToken || typeof idToken !== 'string' || !idToken.trim()) {
      throw new BadRequestException('Firebase ID token is required for authentication.');
    }

    const cleanToken = idToken.trim();

    // 1. Primary: Verify via Firebase Admin SDK (Strict Production Cryptographic Verification)
    try {
      const auth = getAuth(this.firebaseApp);
      const decoded = await auth.verifyIdToken(cleanToken);

      if (!decoded.phone_number) {
        throw new UnauthorizedException('Firebase identity does not contain a verified phone number.');
      }

      const cleanPhone = decoded.phone_number.replace(/[^0-9]/g, '').slice(-10);
      return {
        uid: decoded.uid,
        phoneNumber: decoded.phone_number,
        cleanPhone,
      };
    } catch (adminErr: any) {
      if (adminErr instanceof UnauthorizedException || adminErr instanceof BadRequestException) {
        throw adminErr;
      }

      // 2. Secondary: Fallback to Google Identity Toolkit accounts:lookup REST API
      try {
        const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;
        const res = await fetch(lookupUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: cleanToken }),
        });

        if (!res.ok) {
          throw new UnauthorizedException('Invalid, revoked, or expired Firebase identity token.');
        }

        const data = await res.json();
        const user = data.users?.[0];

        if (!user || !user.localId) {
          throw new UnauthorizedException('No valid Firebase devotee identity returned.');
        }

        if (!user.phoneNumber) {
          throw new UnauthorizedException('Firebase identity does not contain a verified phone number.');
        }

        const cleanPhone = user.phoneNumber.replace(/[^0-9]/g, '').slice(-10);
        return {
          uid: user.localId,
          phoneNumber: user.phoneNumber,
          cleanPhone,
        };
      } catch (restErr: any) {
        if (restErr instanceof UnauthorizedException) throw restErr;
        throw new ServiceUnavailableException('Firebase identity verification service is unreachable.');
      }
    }
  }

  /**
   * Process authenticated Firebase Phone sign-in or registration
   * - Enforces strict LOGIN vs REGISTER policies
   * - Enforces account suspension checks
   * - Persists verified identity to MariaDB
   */
  async authenticateWithFirebasePhone(params: {
    idToken: string;
    intent: 'LOGIN' | 'REGISTER';
    fullName?: string;
    preferredLang?: string;
    role?: 'CUSTOMER' | 'DHARMA_KARTHA';
    templeName?: string;
    templeTrustName?: string;
    templeCity?: string;
  }) {
    const { idToken, intent, fullName, preferredLang, role = 'CUSTOMER', templeName, templeTrustName, templeCity } = params;

    // 1. Verify token & extract cryptographically signed identity
    const verified = await this.verifyFirebaseIdToken(idToken);
    const { uid, cleanPhone } = verified;

    // 2. Query MariaDB for existing user
    const existingUser = await this.prisma.appUser.findFirst({
      where: {
        OR: [
          { phoneNumber: cleanPhone },
          { phoneNumber: `+91${cleanPhone}` },
          { phoneNumber: `91${cleanPhone}` },
          { deviceUuid: `firebase:${uid}` },
        ],
      },
    });

    // Check existing Dharma Kartha status
    let hasDkAccount = false;
    if (existingUser) {
      if (existingUser.addressLine?.startsWith('DK_META:')) {
        try {
          const parsed = JSON.parse(existingUser.addressLine.replace('DK_META:', ''));
          if (parsed.role === 'DHARMA_KARTHA' || parsed.templeName) hasDkAccount = true;
        } catch {}
      }
      if (!hasDkAccount) {
        try {
          const memCount = await (this.prisma as any).templeMembership.count({
            where: { userId: existingUser.id },
          });
          if (memCount > 0) hasDkAccount = true;
        } catch {}
      }
    }

    // 3. Apply REGISTER Intent Policy based on chosen Role
    if (intent === 'REGISTER') {
      if (role === 'DHARMA_KARTHA') {
        if (hasDkAccount) {
          throw new BadRequestException('This mobile number is already registered as a Dharma Kartha. Please login.');
        }

        // If user already exists as Customer, upgrade/add Dharma Kartha profile seamlessly!
        if (existingUser) {
          const dkMeta = {
            role: 'DHARMA_KARTHA',
            templeName: templeName || '',
            templeTrustName: templeTrustName || '',
            templeCity: templeCity || '',
            registeredAt: new Date().toISOString(),
          };
          const updated = await this.prisma.appUser.update({
            where: { id: existingUser.id },
            data: {
              fullName: fullName?.trim() || existingUser.fullName,
              addressLine: `DK_META:${JSON.stringify(dkMeta)}`,
              city: templeCity || existingUser.city,
              district: templeTrustName || existingUser.district,
              lastActiveAt: new Date(),
            },
          });

          return {
            success: true,
            message: 'Dharma Kartha (Temple Founder) profile registered successfully!',
            user: {
              id: updated.id,
              phoneNumber: updated.phoneNumber,
              fullName: updated.fullName,
              email: updated.email,
              role: 'DHARMA_KARTHA',
              templeName,
              templeTrustName,
              templeCity,
            },
          };
        }

        // Fresh brand new Dharma Kartha registration
        const dkMeta = {
          role: 'DHARMA_KARTHA',
          templeName: templeName || '',
          templeTrustName: templeTrustName || '',
          templeCity: templeCity || '',
          registeredAt: new Date().toISOString(),
        };

        const newUser = await this.prisma.appUser.create({
          data: {
            phoneNumber: cleanPhone,
            fullName: fullName?.trim() || 'Dharma Kartha',
            deviceUuid: `firebase:${uid}`,
            preferredLang: preferredLang || 'en',
            addressLine: `DK_META:${JSON.stringify(dkMeta)}`,
            city: templeCity || null,
            district: templeTrustName || null,
            lastActiveAt: new Date(),
          },
        });

        return {
          success: true,
          message: 'Dharma Kartha account registered successfully! Welcome to Saranam Ayyappa.',
          user: {
            id: newUser.id,
            phoneNumber: newUser.phoneNumber,
            fullName: newUser.fullName,
            role: 'DHARMA_KARTHA',
            templeName,
            templeTrustName,
            templeCity,
          },
        };
      } else {
        // Customer Registration
        if (existingUser) {
          throw new BadRequestException('This mobile number is already registered as a Customer. Please login.');
        }

        const nameToStore = (fullName && fullName.trim()) ? fullName.trim() : 'Devotee';
        const newUser = await this.prisma.appUser.create({
          data: {
            phoneNumber: cleanPhone,
            fullName: nameToStore,
            deviceUuid: `firebase:${uid}`,
            preferredLang: preferredLang || 'en',
            lastActiveAt: new Date(),
          },
        });

        return {
          success: true,
          message: 'Account registered successfully! Welcome to Saranam Ayyappa.',
          user: {
            id: newUser.id,
            phoneNumber: newUser.phoneNumber,
            fullName: newUser.fullName,
            email: newUser.email,
            role: 'CUSTOMER',
          },
        };
      }
    }

    // 4. Apply LOGIN Intent Policy based on chosen Role
    if (!existingUser) {
      throw new UnauthorizedException(
        role === 'DHARMA_KARTHA'
          ? 'No Dharma Kartha account found with this mobile number. Please register your temple founder profile first.'
          : 'This mobile number is not registered as a Customer. Please create your account first.'
      );
    }

    if (existingUser.isDeleted) {
      throw new UnauthorizedException('This devotee account has been deactivated. Please contact temple administration.');
    }

    if (existingUser.isSuspended) {
      throw new UnauthorizedException('Your devotee account is currently suspended. Please contact temple administration.');
    }

    if (role === 'DHARMA_KARTHA' && !hasDkAccount) {
      throw new UnauthorizedException(
        'This mobile number is registered as a Customer, but not yet registered as a Dharma Kartha. Please register your temple founder account.'
      );
    }

    // Update active timestamp and link Firebase UID if needed
    const updatedUser = await this.prisma.appUser.update({
      where: { id: existingUser.id },
      data: {
        lastActiveAt: new Date(),
        deviceUuid: existingUser.deviceUuid || `firebase:${uid}`,
      },
    });

    let currentRole = role;
    let currentTempleName = templeName;
    let currentTempleTrust = templeTrustName;
    let currentTempleCity = templeCity;

    if (existingUser.addressLine?.startsWith('DK_META:')) {
      try {
        const parsed = JSON.parse(existingUser.addressLine.replace('DK_META:', ''));
        if (role === 'DHARMA_KARTHA') {
          currentTempleName = parsed.templeName || currentTempleName;
          currentTempleTrust = parsed.templeTrustName || currentTempleTrust;
          currentTempleCity = parsed.templeCity || currentTempleCity;
        }
      } catch {}
    }

    return {
      success: true,
      message: `Login successful as ${role === 'DHARMA_KARTHA' ? 'Dharma Kartha (Temple Founder)' : 'Customer'}! Welcome to Saranam Ayyappa.`,
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: currentRole,
        templeName: currentTempleName,
        templeTrustName: currentTempleTrust,
        templeCity: currentTempleCity,
        preferredLang: updatedUser.preferredLang,
        profileOnboardingStatus: updatedUser.profileOnboardingStatus,
      },
    };
  }
}
