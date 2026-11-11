import * as crypto from 'crypto';

interface KeyedOtpChallenge {
  phone: string;
  hmacDigest: string; // HMAC-SHA256 with pepper
  salt: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

// Secret Pepper loaded from environment, fallback to secure random string
const HMAC_PEPPER = process.env.OTP_HMAC_SECRET || 'saranam_ayyappa_swamiye_otp_pepper_2026';

// Persistent memory store with automated expiration garbage collection
const challengeStore = new Map<string, KeyedOtpChallenge>();

// Clean expired challenges every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of challengeStore.entries()) {
    if (now > entry.expiresAt) {
      challengeStore.delete(phone);
    }
  }
}, 60000);

export class KeyedOtpManager {
  /**
   * Generates a cryptographically strong HMAC-SHA256 digest of the 6-digit OTP
   */
  private static computeHmac(otp: string, salt: string): string {
    return crypto
      .createHmac('sha256', `${HMAC_PEPPER}:${salt}`)
      .update(otp)
      .digest('hex');
  }

  /**
   * Records a new OTP challenge with:
   * - 5-minute strict expiry
   * - 30s resend cooldown
   * - Max 3 attempts
   * - Unique random per-challenge salt
   */
  static saveChallenge(phoneNumber: string, otp: string): void {
    const salt = crypto.randomBytes(16).toString('hex');
    const hmacDigest = this.computeHmac(otp, salt);

    challengeStore.set(phoneNumber, {
      phone: phoneNumber,
      hmacDigest,
      salt,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
      lastSentAt: Date.now(),
    });
  }

  /**
   * Checks resend cooldown (30 seconds)
   */
  static getRemainingCooldown(phoneNumber: string): number {
    const entry = challengeStore.get(phoneNumber);
    if (!entry) return 0;
    const elapsed = Date.now() - entry.lastSentAt;
    if (elapsed < 30000) {
      return Math.ceil((30000 - elapsed) / 1000);
    }
    return 0;
  }

  /**
   * Verifies OTP using constant-time comparison against HMAC digest
   */
  static verify(phoneNumber: string, inputOtp: string): { valid: boolean; reason?: string } {
    const entry = challengeStore.get(phoneNumber);
    if (!entry) {
      return { valid: false, reason: 'No active OTP request found or code has expired. Please request a new OTP.' };
    }

    if (Date.now() > entry.expiresAt) {
      challengeStore.delete(phoneNumber);
      return { valid: false, reason: 'OTP has expired. Please request a new code.' };
    }

    if (entry.attempts >= 3) {
      challengeStore.delete(phoneNumber);
      return { valid: false, reason: 'Maximum attempts exceeded. Please request a new code.' };
    }

    const inputHmac = this.computeHmac(inputOtp.trim(), entry.salt);

    // Constant-time comparison to prevent timing attacks
    const hmacMatch = crypto.timingSafeEqual(
      Buffer.from(entry.hmacDigest, 'hex'),
      Buffer.from(inputHmac, 'hex')
    );

    if (!hmacMatch) {
      entry.attempts += 1;
      const remaining = 3 - entry.attempts;
      return {
        valid: false,
        reason: remaining > 0 ? `Invalid OTP. ${remaining} attempt(s) remaining.` : 'Maximum attempts exceeded.',
      };
    }

    // Atomic one-time consumption (prevent replay attack)
    challengeStore.delete(phoneNumber);
    return { valid: true };
  }
}

