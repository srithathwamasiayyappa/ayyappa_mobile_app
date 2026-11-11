import * as crypto from 'crypto';

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  /**
   * Dispatch OTP through MSG91 or Fast2SMS based on environment configuration
   */
  static async sendOtpSms(phoneNumber: string, otp: string): Promise<SmsSendResult> {
    const provider = process.env.SMS_PROVIDER || 'MOCK';
    const authKey = process.env.SMS_API_KEY || process.env.MSG91_AUTH_KEY || '';
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID || '';

    // Standardize 10-digit Indian phone with 91 prefix
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    const fullNumber = `91${cleanPhone}`;

    if (provider.toUpperCase() === 'MSG91' && authKey) {
      try {
        // MSG91 Send OTP v5 API
        const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${fullNumber}&authkey=${authKey}&otp=${otp}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.type === 'success' || data.message === 'OTP sent successfully') {
          return { success: true, messageId: data.request_id };
        }
        return { success: false, error: data.message || 'MSG91 gateway error' };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    if (provider.toUpperCase() === 'FAST2SMS' && authKey) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': authKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variables_values: otp,
            route: 'otp',
            numbers: cleanPhone,
          }),
        });
        const data = await response.json();
        if (data.return) {
          return { success: true, messageId: data.request_id };
        }
        return { success: false, error: data.message };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // If no provider API key is provided, return clearly without fake success
    return {
      success: false,
      error: 'SMS_GATEWAY_NOT_CONFIGURED: Please configure SMS_API_KEY / MSG91_AUTH_KEY in apps/api/.env',
    };
  }
}

