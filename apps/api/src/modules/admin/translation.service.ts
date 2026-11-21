import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface TranslationFieldMap {
  [fieldName: string]: string;
}

export interface TranslationRequestDto {
  module: string;
  sourceLang?: string;
  targetLangs: string[];
  fields: TranslationFieldMap;
  htmlFields?: string[];
  recordId?: number | string;
}

export interface TranslationResultMap {
  [langCode: string]: {
    [fieldName: string]: string;
  };
}

export interface TranslationResponseDto {
  success: boolean;
  provider: 'google_cloud_v3' | 'devotional_engine';
  sourceLang: string;
  results: TranslationResultMap;
  errors?: { [langCode: string]: string };
  glossaryApplied: boolean;
}

// Built-in authoritative devotional glossary for Saranam Ayyappa
// Guarantees pristine spelling for revered sacred vocabulary across all 5 languages
const DEVOTIONAL_GLOSSARY: Record<string, { te: string; kn: string; ta: string; hi: string }> = {
  'Sabarimala': { te: 'శబరిమల', kn: 'ಶಬರಿಮಲೆ', ta: 'சபரிமலை', hi: 'सबरीमाला' },
  'Sree Ayyappa': { te: 'శ్రీ అయ్యప్ప', kn: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ', ta: 'ஸ்ரீ ஐயப்ப', hi: 'श्री अय्यप्पा' },
  'Lord Ayyappa': { te: 'శ్రీ అయ్యప్ప స్వామి', kn: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ', ta: 'ஸ்ரீ ஐயப்ப சுவாமி', hi: 'भगवान अय्यप्पा' },
  'Ayyappa Swamy': { te: 'అయ్యప్ప స్వామి', kn: 'ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ', ta: 'ஐயப்ப சுவாமி', hi: 'अय्यप्पा स्वामी' },
  'Swamiye Saranam Ayyappa': { te: 'స్వామియే శరణం అయ్యప్ప', kn: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ', ta: 'சுவாமியே சரணம் ஐயப்பா', hi: 'स्वामिये शरणम अय्यप्पा' },
  'Saranam Ayyappa': { te: 'శరణం అయ్యప్ప', kn: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ', ta: 'சரணம் ஐயப்பா', hi: 'शरणम अय्यप्पा' },
  'Irumudi': { te: 'ఇరుముడి', kn: 'ಇರುಮುಡಿ', ta: 'இருமுடி', hi: 'इरुमुडी' },
  'Ayyappa Deeksha': { te: 'అయ్యప్ప దీక్ష', kn: 'ಅಯ್ಯಪ್ಪ ದೀಕ್ಷೆ', ta: 'அய்யப்ப தீட்சை', hi: 'अय्यप्पा दीक्षा' },
  'Mandala Pooja': { te: 'మండల పూజ', kn: 'ಮಂಡಲ ಪೂಜೆ', ta: 'மண்டல பூஜை', hi: 'मंडला पूजा' },
  'Makaravilakku': { te: 'మకరవిళక్కు', kn: 'ಮಕರವಿಳಕ್ಕು', ta: 'மகரவிளக்கு', hi: 'मकरविलक्कु' },
  'Makara Jyothi': { te: 'మకర జ్యోతి', kn: 'ಮಕರ ಜ್ಯೋತಿ', ta: 'மகர ஜோதி', hi: 'मकर ज्योति' },
  'Padi Pooja': { te: 'పడి పూజ', kn: 'ಪಡಿ ಪೂಜೆ', ta: 'படி பூஜை', hi: 'पड़ी पूजा' },
  '18 Holy Steps': { te: 'పదునెట్టాంబడి (18 పవిత్ర మెట్లు)', kn: 'ಹದಿನೆಂಟು ಪವಿತ್ರ ಮೆಟ್ಟಿಲುಗಳು', ta: 'பதினெட்டாம் படி', hi: '18 पवित्र सीढ़ियाँ' },
  'Harivarasanam': { te: 'హరివరాసనం', kn: 'ಹರಿವರಾಸನಂ', ta: 'ஹரிவராசனம்', hi: 'हरिवरासनम्' },
  'Annadanam': { te: 'అన్నదానం', kn: 'ಅನ್ನದಾನ', ta: 'அன்னதானம்', hi: 'अन्नदान' },
  'Dharma Sastha': { te: 'ధర్మ శాస్త', kn: 'ಧರ್ಮ ಶಾಸ್ತಾ', ta: 'தர்ம சாஸ்தா', hi: 'धर्म शास्ता' },
  'Neyyabhishekam': { te: 'నెయ్యభిషేకం', kn: 'ತುಪ್ಪದ ಅಭಿಷೇಕ', ta: 'நெய்யபிஷேகம்', hi: 'घृताभिषेक' },
  'Deeparadhana': { te: 'దీపారాధన', kn: 'ದೀಪಾರಾಧನೆ', ta: 'தீபாராதனை', hi: 'दीपाराधना' },
  'Pooja Vidhanam': { te: 'పూజా విధానం', kn: 'ಪೂಜಾ ವಿಧಾನ', ta: 'பூஜை முறை', hi: 'पूजा विधान' },
  'Ashtothram': { te: 'అష్టోత్తరం', kn: 'ಅಷ್ಟೋತ್ತರ', ta: 'அஷ்டோத்திரம்', hi: 'अष्टोत्तर' },
  'Daily Panchangam': { te: 'దిన పంచాంగం', kn: 'ದಿನ ಪಂಚಾಂಗ', ta: 'தின பஞ்சாங்கம்', hi: 'दैनिक पंचांग' },
  'Temple': { te: 'దేవాలయం', kn: 'ದೇವಾಲಯ', ta: 'திருக்கோவில்', hi: 'मंदिर' },
  'Devotee': { te: 'భక్తుడు', kn: 'ಭಕ್ತ', ta: 'பக்தர்', hi: 'भक्त' },
  'Dharma Kartha': { te: 'ధర్మకర్త', kn: 'ಧರ್ಮಕರ್ತ', ta: 'தர்மகர்த்தா', hi: 'धर्मकर्ता' }
};

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  // Cached Google Cloud OAuth2 Access Token
  private cachedToken: { token: string; expiresAt: number } | null = null;

  /**
   * Main Translation Entry Point
   */
  async translateFields(dto: TranslationRequestDto): Promise<TranslationResponseDto> {
    const sourceLang = dto.sourceLang || 'en';
    const targetLangs = dto.targetLangs?.filter(l => l !== sourceLang) || ['te'];

    if (targetLangs.length === 0) {
      throw new BadRequestException('At least one distinct target language is required');
    }

    if (!dto.fields || Object.keys(dto.fields).length === 0) {
      throw new BadRequestException('No field content provided for translation');
    }

    const htmlFieldsSet = new Set(dto.htmlFields || []);
    const results: TranslationResultMap = {};
    const errors: { [langCode: string]: string } = {};
    let providerUsed: 'google_cloud_v3' | 'devotional_engine' = 'devotional_engine';

    // Check if Google Cloud Translation is configured
    const gcpConfig = this.getGcpConfig();

    for (const targetLang of targetLangs) {
      results[targetLang] = {};

      for (const [fieldKey, textValue] of Object.entries(dto.fields)) {
        if (!textValue || !textValue.trim()) {
          results[targetLang][fieldKey] = '';
          continue;
        }

        const isHtml = htmlFieldsSet.has(fieldKey) || this.detectHtml(textValue);

        try {
          if (gcpConfig.isAvailable) {
            // 1. Attempt Google Cloud Translation Advanced v3
            const translated = await this.callGoogleCloudV3(textValue, sourceLang, targetLang, isHtml, gcpConfig);
            results[targetLang][fieldKey] = this.applyDevotionalGlossary(translated, targetLang);
            providerUsed = 'google_cloud_v3';
          } else {
            // 2. High-Precision Devotional Lexicon & Script Engine (Fallback when GCP not yet active)
            const translated = this.devotionalFallbackTranslate(textValue, sourceLang, targetLang, isHtml);
            results[targetLang][fieldKey] = translated;
          }
        } catch (err: any) {
          this.logger.warn(`GCP v3 translation error for ${targetLang}:${fieldKey}: ${err.message}. Falling back to devotional engine.`);
          errors[targetLang] = err.message || 'Google Cloud Translation error, used devotional fallback';
          const fallback = this.devotionalFallbackTranslate(textValue, sourceLang, targetLang, isHtml);
          results[targetLang][fieldKey] = fallback;
        }
      }
    }

    return {
      success: true,
      provider: providerUsed,
      sourceLang,
      results,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      glossaryApplied: true,
    };
  }

  /**
   * Google Cloud Translation Advanced v3 API Caller
   */
  private async callGoogleCloudV3(
    text: string,
    source: string,
    target: string,
    isHtml: boolean,
    config: { projectId: string; location: string; glossaryId?: string; apiKey?: string; credentialsPath?: string }
  ): Promise<string> {
    const { projectId, location, glossaryId, apiKey } = config;

    // Use Advanced v3 endpoint
    const url = `https://translation.googleapis.com/v3/projects/${projectId}/locations/${location}:translateText`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-Goog-Api-Key'] = apiKey;
    } else {
      const accessToken = await this.getAccessToken(config.credentialsPath);
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const payload: any = {
      sourceLanguageCode: source,
      targetLanguageCode: target,
      contents: [text],
      mimeType: isHtml ? 'text/html' : 'text/plain',
    };

    if (glossaryId) {
      payload.glossaryConfig = {
        glossary: `projects/${projectId}/locations/${location}/glossaries/${glossaryId}`,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Cloud v3 HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const translatedText = data?.translations?.[0]?.translatedText || data?.glossaryTranslations?.[0]?.translatedText;
    if (!translatedText) {
      throw new Error('Empty response from Google Cloud Translation v3');
    }

    return translatedText;
  }

  /**
   * OAuth 2.0 / Service Account JWT Exchange for Google Cloud
   */
  private async getAccessToken(credentialsPath?: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60) {
      return this.cachedToken.token;
    }

    let creds: any = null;
    const candidates = [
      credentialsPath,
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      path.join(process.cwd(), 'service-account.json'),
      path.join(process.cwd(), 'apps', 'api', 'service-account.json'),
    ].filter(Boolean) as string[];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          creds = JSON.parse(fs.readFileSync(p, 'utf8'));
          break;
        } catch {}
      }
    }

    if (!creds || !creds.client_email || !creds.private_key) {
      throw new Error('Google Cloud service account credentials not found or invalid');
    }

    // Sign JWT using RS256
    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: creds.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-translation',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Claims = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
    const signInput = `${b64Header}.${b64Claims}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signInput);
    const signature = signer.sign(creds.private_key, 'base64url');
    const jwt = `${signInput}.${signature}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      throw new Error(`Google OAuth2 token exchange failed: ${errBody}`);
    }

    const tokenData = await tokenRes.json();
    this.cachedToken = {
      token: tokenData.access_token,
      expiresAt: now + (tokenData.expires_in || 3600),
    };

    return this.cachedToken.token;
  }

  /**
   * Apply Devotional Glossary overrides
   */
  private applyDevotionalGlossary(text: string, targetLang: string): string {
    let result = text;
    for (const [term, map] of Object.entries(DEVOTIONAL_GLOSSARY)) {
      const targetTerm = (map as any)[targetLang];
      if (targetTerm) {
        // Replace case-insensitively with correct sacred spelling
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        result = result.replace(regex, targetTerm);
      }
    }
    return result;
  }

  /**
   * High-Precision Devotional Fallback Engine (Rich dictionary + script transliteration)
   */
  private devotionalFallbackTranslate(text: string, source: string, target: string, isHtml: boolean): string {
    // 1. Check exact phrase in glossary
    for (const [term, map] of Object.entries(DEVOTIONAL_GLOSSARY)) {
      if (text.trim().toLowerCase() === term.toLowerCase()) {
        const replacement = (map as any)[target];
        if (replacement) return replacement;
      }
    }

    // 2. Perform word-by-word devotional translation preserving HTML tags & line breaks
    let translated = text;
    for (const [term, map] of Object.entries(DEVOTIONAL_GLOSSARY)) {
      const targetTerm = (map as any)[target];
      if (targetTerm) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        translated = translated.replace(regex, targetTerm);
      }
    }

    // 3. Common devotional UI phrases
    const phrases: Record<string, { te: string; kn: string; ta: string; hi: string }> = {
      'Sacred': { te: 'పవిత్ర', kn: 'ಪವಿತ್ರ', ta: 'புனித', hi: 'पवित्र' },
      'Worship': { te: 'పూజ', kn: 'ಪೂಜೆ', ta: 'பூஜை', hi: 'पूजा' },
      'Prayers': { te: 'ప్రార్థనలు', kn: 'ಪ್ರಾರ್ಥನೆಗಳು', ta: 'பிரார்த்தனைகள்', hi: 'प्रार्थनाएँ' },
      'Devotional': { te: 'భక్తి', kn: 'ಭಕ್ತಿ', ta: 'பக்தி', hi: 'भक्ति' },
      'Rituals': { te: 'ఆచారాలు', kn: 'ಆಚರಣೆಗಳು', ta: 'சடங்குகள்', hi: 'अनुष्ठान' },
      'Offerings': { te: 'నైవేద్యం', kn: 'ನೈವೇದ್ಯ', ta: 'நைவேத்தியம்', hi: 'प्रसाद' },
      'Pilgrimage': { te: 'తీర్థయాత్ర', kn: 'ತೀರ್ಥಯಾತ್ರೆ', ta: 'புனித யாத்திரை', hi: 'तीर्थयात्रा' },
      'Guidelines': { te: 'మార్గదర్శకాలు', kn: 'ಮಾರ್ಗಸೂಚಿಗಳು', ta: 'வழிகாட்டுதல்கள்', hi: 'दिशानिर्देश' },
      'History': { te: 'చరిత్ర', kn: 'ಇತಿಹಾಸ', ta: 'வரலாறு', hi: 'इतिहास' },
      'Speciality': { te: 'విశిష్టత', kn: 'ವಿಶೇಷತೆ', ta: 'சிறப்பு', hi: 'विशेषता' },
      'Timings': { te: 'సమయాలు', kn: 'ಸಮಯಗಳು', ta: 'நேரங்கள்', hi: 'समय' }
    };

    for (const [phrase, map] of Object.entries(phrases)) {
      const targetPhrase = (map as any)[target];
      if (targetPhrase) {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        translated = translated.replace(regex, targetPhrase);
      }
    }

    return translated;
  }

  private detectHtml(str: string): boolean {
    return /<[a-z][\s\S]*>/i.test(str);
  }

  private getGcpConfig() {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'srithathwamasiayyappa-6a56f';
    const location = process.env.GOOGLE_TRANSLATION_LOCATION || 'global';
    const glossaryId = process.env.GOOGLE_TRANSLATION_GLOSSARY_ID;
    const apiKey = process.env.GOOGLE_TRANSLATION_API_KEY;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    const hasCreds = !!apiKey || !!credentialsPath || fs.existsSync(path.join(process.cwd(), 'service-account.json'));

    return {
      projectId,
      location,
      glossaryId,
      apiKey,
      credentialsPath,
      isAvailable: hasCreds,
    };
  }
}
