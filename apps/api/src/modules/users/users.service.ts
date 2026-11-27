import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { KeyedOtpManager } from '../auth/keyed-otp.manager';
import { Msg91Service } from '../auth/msg91.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate profile completion percentage based on devotional attributes
   */
  calculateCompletionPercentage(user: any): number {
    let score = 0;
    if (user.fullName && user.fullName.trim().length > 0) score += 20;
    if (user.phoneNumber && user.phoneNumber.trim().length > 0) score += 20;
    if (user.dateOfBirth) score += 10;
    if (user.gender && user.gender.trim().length > 0) score += 10;
    if (user.rashiId) score += 10;
    if (user.nakshatraId) score += 10;
    if (user.city || user.state || user.pincode) score += 10;
    if (user.profileImageUrl && user.profileImageUrl.trim().length > 0) score += 10;
    return Math.min(score, 100);
  }

  /**
   * Fetch Devotee Profile with Rashi, Nakshatram and Completion Statistics
   */
  async getProfile(userId: number, lang = 'te') {
    let user = await this.prisma.appUser.findUnique({
      where: { id: userId },
      include: {
        rashi: {
          include: {
            translations: {
              where: { language: { code: lang } },
            },
          },
        },
        nakshatra: {
          include: {
            translations: {
              where: { language: { code: lang } },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const completionPercentage = this.calculateCompletionPercentage(user);
    const rashiName = user.rashi?.translations[0]?.name || user.rashi?.code || null;
    const nakshatraName = user.nakshatra?.translations[0]?.name || user.nakshatra?.code || null;

    // Format devotee since date
    const createdAt = new Date(user.createdAt);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const devoteeSince = `${months[createdAt.getMonth()]} ${createdAt.getFullYear()}`;

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      fullName: user.fullName,
      preferredLang: user.preferredLang,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
      gender: user.gender,
      rashiId: user.rashiId,
      rashiName,
      nakshatraId: user.nakshatraId,
      nakshatraName,
      profileImageUrl: user.profileImageUrl,
      addressLine: user.addressLine,
      state: user.state,
      district: user.district,
      city: user.city,
      pincode: user.pincode,
      devotionalUpdatesEnabled: user.devotionalUpdatesEnabled,
      profileOnboardingStatus: user.profileOnboardingStatus,
      profileCompletedAt: user.profileCompletedAt,
      completionPercentage,
      devoteeSince,
      isVerifiedPhone: Boolean(user.phoneNumber),
    };
  }

  /**
   * Update Devotee Profile
   */
  async updateProfile(userId: number, dto: any) {
    try {
      let user = await this.prisma.appUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('Devotee user not found.');
      }

      const targetUserId = user.id;
      const updateData: any = {};

      if (dto.fullName !== undefined) updateData.fullName = dto.fullName.trim();
      if (dto.email !== undefined) updateData.email = dto.email ? dto.email.trim() : null;
      if (dto.phoneNumber !== undefined && dto.phoneNumber) {
        updateData.phoneNumber = dto.phoneNumber.replace(/[^0-9]/g, '').slice(-10);
      }
      if (dto.profileImageUrl !== undefined) {
        updateData.profileImageUrl = dto.profileImageUrl ? dto.profileImageUrl.trim() : null;
      }
      if (dto.gender !== undefined) {
        updateData.gender = dto.gender ? String(dto.gender).trim() : null;
      }
      if (dto.addressLine !== undefined) updateData.addressLine = dto.addressLine;
      if (dto.state !== undefined) updateData.state = dto.state;
      if (dto.district !== undefined) updateData.district = dto.district;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.pincode !== undefined) updateData.pincode = dto.pincode;
      if (dto.preferredLang !== undefined) updateData.preferredLang = dto.preferredLang;
      if (dto.devotionalUpdatesEnabled !== undefined) {
        updateData.devotionalUpdatesEnabled = Boolean(dto.devotionalUpdatesEnabled);
      }

      if (dto.dateOfBirth !== undefined) {
        if (!dto.dateOfBirth) {
          updateData.dateOfBirth = null;
        } else {
          let dateObj: Date | null = null;
          if (dto.dateOfBirth instanceof Date) {
            dateObj = !isNaN(dto.dateOfBirth.getTime()) ? dto.dateOfBirth : null;
          } else if (typeof dto.dateOfBirth === 'string') {
            const raw = dto.dateOfBirth.trim();
            // Handle ISO YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
              dateObj = new Date(raw.split('T')[0] + 'T00:00:00.000Z');
            } else {
              const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
              const parts = raw.split(/[\s\-\/]+/);
              if (parts.length === 3) {
                const p0 = parseInt(parts[0], 10);
                const mIdx = isNaN(Number(parts[1]))
                  ? monthsShort.indexOf(parts[1].toLowerCase().slice(0, 3))
                  : parseInt(parts[1], 10) - 1;
                const p2 = parseInt(parts[2], 10);

                if (p2 > 1000 && !isNaN(p0) && mIdx >= 0) {
                  // DD Mon YYYY
                  dateObj = new Date(Date.UTC(p2, mIdx, p0));
                } else if (p0 > 1000 && !isNaN(p2) && mIdx >= 0) {
                  // YYYY Mon DD
                  dateObj = new Date(Date.UTC(p0, mIdx, p2));
                }
              }
              if (!dateObj || isNaN(dateObj.getTime())) {
                const fallbackParsed = new Date(raw);
                if (!isNaN(fallbackParsed.getTime())) {
                  dateObj = fallbackParsed;
                }
              }
            }
          }
          updateData.dateOfBirth = dateObj && !isNaN(dateObj.getTime()) ? dateObj : null;
        }
      }

      if (dto.rashiId !== undefined) {
        updateData.rashiId = dto.rashiId ? Number(dto.rashiId) : null;
      }

      if (dto.nakshatraId !== undefined) {
        updateData.nakshatraId = dto.nakshatraId ? Number(dto.nakshatraId) : null;
      }

      if (dto.profileOnboardingStatus) {
        updateData.profileOnboardingStatus = dto.profileOnboardingStatus;
        if (dto.profileOnboardingStatus === 'COMPLETED' || dto.profileOnboardingStatus === 'SKIPPED') {
          updateData.profileCompletedAt = new Date();
        }
      }

      try {
        await this.prisma.appUser.update({
          where: { id: targetUserId },
          data: updateData,
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          delete updateData.phoneNumber;
          delete updateData.email;
          await this.prisma.appUser.update({
            where: { id: targetUserId },
            data: updateData,
          });
        } else {
          throw err;
        }
      }

      return this.getProfile(targetUserId, dto.lang || user.preferredLang || 'te');
    } catch (topErr: any) {
      console.error('[UsersService] Error during updateProfile:', topErr?.message || topErr);
      throw new BadRequestException(topErr?.message || 'Failed to update devotee profile in database.');
    }
  }

  /**
   * Upload Profile Photo (Base64 JPEG/PNG)
   */
  async uploadProfilePhoto(userId: number, base64Image: string) {
    if (!base64Image) {
      throw new BadRequestException('Image data is required.');
    }

    let user = await this.prisma.appUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Devotee user not found.');
    }
    const targetUserId = user.id;

    // Strip data URI prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const uploadsDir = path.resolve(process.cwd(), 'uploads/profiles');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `profile_${targetUserId}_${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Save robust data URI so React Native mobile Image renders immediately
    const dataUri = `data:image/jpeg;base64,${cleanBase64}`;
    const relativeUrl = `/uploads/profiles/${filename}`;

    await this.prisma.appUser.update({
      where: { id: targetUserId },
      data: { profileImageUrl: dataUri },
    });

    return {
      success: true,
      profileImageUrl: dataUri,
      relativeUrl,
      profile: await this.getProfile(targetUserId, user.preferredLang || 'te'),
    };
  }

  /**
   * Submit Account Deletion Request with OTP Verification
   */
  async requestAccountDeletion(userId: number, otp: string, reason?: string) {
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    if (!user.phoneNumber) {
      throw new BadRequestException('User does not have a registered mobile number for OTP verification.');
    }

    const cleanPhone = user.phoneNumber.replace(/[^0-9]/g, '').slice(-10);

    // Verify OTP using production SMS provider or dev manager
    const isMsg91Active = Boolean(process.env.MSG91_AUTH_KEY);
    if (isMsg91Active) {
      const msg91Verify = await Msg91Service.verifyOtp(cleanPhone, otp.trim());
      if (!msg91Verify.verified) {
        throw new BadRequestException(msg91Verify.message || 'Invalid or expired OTP code.');
      }
    } else {
      const localVerify = KeyedOtpManager.verify(cleanPhone, otp.trim());
      if (!localVerify.valid) {
        throw new BadRequestException(localVerify.reason || 'Invalid or expired OTP code.');
      }
    }

    // Mark deletion request on user record in MariaDB
    const updated = await this.prisma.appUser.update({
      where: { id: userId },
      data: {
        deletionRequested: true,
        deletionRequestedAt: new Date(),
        deletionReason: reason || 'User requested account removal via mobile application.',
      },
    });

    // Write audit log for administrator review
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          action: 'USER_DELETION_REQUESTED',
          targetType: 'APP_USER',
          targetId: String(userId),
          detailsJson: JSON.stringify({
            userId,
            phone: user.phoneNumber,
            fullName: user.fullName,
            reason: reason || 'User requested account removal via mobile application.',
            requestedAt: new Date().toISOString(),
          }),
        },
      });
    } catch {}

    return {
      success: true,
      message: 'Account deletion request verified and submitted for administrative review.',
      data: {
        userId: updated.id,
        deletionRequested: updated.deletionRequested,
        deletionRequestedAt: updated.deletionRequestedAt,
      },
    };
  }

  private async ensureBookmarksTable() {
    try {
      await this.prisma.$queryRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`user_bookmarks\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`user_id\` INT NOT NULL,
          \`item_id\` VARCHAR(100) NOT NULL,
          \`item_type\` VARCHAR(50) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`subtitle\` VARCHAR(255) NULL,
          \`thumbnail_url\` VARCHAR(500) NULL,
          \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          INDEX (\`user_id\`),
          UNIQUE KEY \`user_item_unique\` (\`user_id\`, \`item_id\`, \`item_type\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (e) {
      console.warn('[UsersService] ensureBookmarksTable note:', e);
    }
  }

  async getBookmarks(userId: number) {
    await this.ensureBookmarksTable();
    try {
      const rows: any = await this.prisma.$queryRawUnsafe(
        'SELECT * FROM `user_bookmarks` WHERE `user_id` = ? ORDER BY `id` DESC',
        userId,
      );
      if (Array.isArray(rows)) {
        return rows.map((r) => ({
          id: r.item_id || String(r.id),
          dbId: r.id,
          title: r.title,
          subtitle: r.subtitle || undefined,
          category: r.item_type,
          thumbnailUrl: r.thumbnail_url || undefined,
          createdAt: r.created_at,
        }));
      }
    } catch (e) {
      console.warn('[UsersService] getBookmarks error:', e);
    }
    return [];
  }

  async addBookmark(userId: number, body: { itemId: string; itemType: string; title: string; subtitle?: string; thumbnailUrl?: string }) {
    await this.ensureBookmarksTable();
    if (!body.itemId || !body.title) {
      throw new BadRequestException('itemId and title are required for bookmark');
    }
    const itemType = body.itemType || 'temple';
    await this.prisma.$queryRawUnsafe(
      `INSERT INTO \`user_bookmarks\` (\`user_id\`, \`item_id\`, \`item_type\`, \`title\`, \`subtitle\`, \`thumbnail_url\`)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`subtitle\` = VALUES(\`subtitle\`), \`thumbnail_url\` = VALUES(\`thumbnail_url\`)`,
      userId,
      body.itemId,
      itemType,
      body.title,
      body.subtitle || null,
      body.thumbnailUrl || null,
    );
    return { success: true, message: 'Bookmark saved successfully.' };
  }

  async removeBookmark(userId: number, bookmarkId: string) {
    await this.ensureBookmarksTable();
    const numId = parseInt(bookmarkId, 10);
    if (!isNaN(numId)) {
      await this.prisma.$queryRawUnsafe(
        'DELETE FROM `user_bookmarks` WHERE `user_id` = ? AND (`id` = ? OR `item_id` = ?)',
        userId,
        numId,
        bookmarkId,
      );
    } else {
      await this.prisma.$queryRawUnsafe(
        'DELETE FROM `user_bookmarks` WHERE `user_id` = ? AND `item_id` = ?',
        userId,
        bookmarkId,
      );
    }
    return { success: true, message: 'Bookmark removed successfully.' };
  }

  async toggleBookmark(
    userId: number,
    body: { itemId: string; itemType: string; title: string; subtitle?: string; thumbnailUrl?: string }
  ) {
    await this.ensureBookmarksTable();
    if (!body.itemId || !body.title) {
      throw new BadRequestException('itemId and title are required for bookmark');
    }
    const itemType = body.itemType || 'general';

    const existing: any = await this.prisma.$queryRawUnsafe(
      'SELECT id FROM `user_bookmarks` WHERE `user_id` = ? AND `item_id` = ? LIMIT 1',
      userId,
      body.itemId,
    );

    if (Array.isArray(existing) && existing.length > 0) {
      await this.prisma.$queryRawUnsafe(
        'DELETE FROM `user_bookmarks` WHERE `user_id` = ? AND `item_id` = ?',
        userId,
        body.itemId,
      );
      return { success: true, isBookmarked: false, message: 'Bookmark removed successfully.' };
    } else {
      await this.prisma.$queryRawUnsafe(
        `INSERT INTO \`user_bookmarks\` (\`user_id\`, \`item_id\`, \`item_type\`, \`title\`, \`subtitle\`, \`thumbnail_url\`)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`subtitle\` = VALUES(\`subtitle\`), \`thumbnail_url\` = VALUES(\`thumbnail_url\`)`,
        userId,
        body.itemId,
        itemType,
        body.title,
        body.subtitle || null,
        body.thumbnailUrl || null,
      );
      return { success: true, isBookmarked: true, message: 'Bookmark added successfully.' };
    }
  }

  async checkBookmark(userId: number, itemId: string) {
    if (!userId || !itemId) {
      return { success: true, isBookmarked: false };
    }
    await this.ensureBookmarksTable();
    const rows: any = await this.prisma.$queryRawUnsafe(
      'SELECT id FROM `user_bookmarks` WHERE `user_id` = ? AND `item_id` = ? LIMIT 1',
      userId,
      itemId,
    );
    const isBookmarked = Array.isArray(rows) && rows.length > 0;
    return { success: true, isBookmarked };
  }

  async getPreferences(userId: number) {
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
      select: {
        preferredLang: true,
        devotionalUpdatesEnabled: true,
      },
    });
    return {
      preferredLang: user?.preferredLang || 'te',
      devotionalUpdatesEnabled: user?.devotionalUpdatesEnabled ?? true,
    };
  }

  async updatePreferences(userId: number, prefs: { preferredLang?: string; devotionalUpdatesEnabled?: boolean }) {
    const data: any = {};
    if (prefs.preferredLang) data.preferredLang = prefs.preferredLang;
    if (prefs.devotionalUpdatesEnabled !== undefined) data.devotionalUpdatesEnabled = Boolean(prefs.devotionalUpdatesEnabled);

    const updated = await this.prisma.appUser.update({
      where: { id: userId },
      data,
      select: {
        preferredLang: true,
        devotionalUpdatesEnabled: true,
      },
    });
    return {
      success: true,
      message: 'App preferences updated successfully.',
      data: updated,
    };
  }
}

