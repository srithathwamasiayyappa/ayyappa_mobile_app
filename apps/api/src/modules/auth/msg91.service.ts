import * as crypto from 'crypto';

export interface Msg91SendOtpResponse {
  type: string;
  message: string;
  request_id?: string;
}

export interface Msg91VerifyOtpResponse {
  type: string;
  message: string;
}

export class Msg91Service {
  private static getAuthKey(): string {
    return process.env.MSG91_AUTH_KEY || process.env.SMS_API_KEY || '';
  }

  private static getTemplateId(): string {
    return process.env.MSG91_OTP_TEMPLATE_ID || '';
  }

  /**
   * Dispatches OTP using MSG91 SendOTP API v5
   * Enforces 6 digits, 5-minute expiry, and Indian DLT requirements.
   */
  static async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string; requestId?: string }> {
    const authKey = this.getAuthKey();
    const templateId = this.getTemplateId();

    if (!authKey) {
      return {
        success: false,
        message: 'SMS provider is not configured. Please specify MSG91_AUTH_KEY in apps/api/.env',
      };
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    const fullNumber = `91${cleanPhone}`;

    try {
      // MSG91 v5 OTP Send API with otp_length=6 & otp_expiry=5 minutes
      const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${fullNumber}&authkey=${authKey}&otp_length=6&otp_expiry=5`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: Msg91SendOtpResponse = await response.json();

      if (data.type === 'success' || data.message?.toLowerCase().includes('otp sent')) {
        return {
          success: true,
          message: 'OTP sent successfully to your mobile number.',
          requestId: data.request_id,
        };
      }

      return {
        success: false,
        message: data.message || 'SMS delivery failed. Please verify provider template.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'SMS gateway service unavailable.',
      };
    }
  }

  /**
   * Direct MSG91 Server-Side OTP Verification Endpoint
   * Verifies the OTP directly with MSG91's secure gateway.
   */
  static async verifyOtp(phoneNumber: string, otp: string): Promise<{ verified: boolean; message: string }> {
    const authKey = this.getAuthKey();
    if (!authKey) {
      return { verified: false, message: 'SMS provider not configured' };
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    const fullNumber = `91${cleanPhone}`;

    try {
      const url = `https://control.msg91.com/api/v5/otp/verify?otp=${encodeURIComponent(otp)}&mobile=${fullNumber}&authkey=${authKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: Msg91VerifyOtpResponse = await response.json();

      if (data.type === 'success' || data.message?.toLowerCase().includes('otp verified')) {
        return { verified: true, message: 'OTP verified successfully.' };
      }

      return {
        verified: false,
        message: data.message || 'Invalid or expired OTP code.',
      };
    } catch (err: any) {
      return { verified: false, message: 'SMS verification network error.' };
    }
  }
}

