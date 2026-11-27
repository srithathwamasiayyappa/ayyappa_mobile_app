import { Controller, Get, Query } from '@nestjs/common';
import { MasterService } from './master.service';

@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  /**
   * Unified endpoint: Fetch all profile master options (rashis, nakshatras, languages, states, districts, deities, logos)
   */
  @Get('profile-options')
  async getProfileOptions(@Query('lang') lang?: string, @Query('state') state?: string) {
    const data = await this.masterService.getProfileOptions(lang || 'te', state);
    return {
      success: true,
      data,
    };
  }

  @Get('rashis')
  async getRashis(@Query('lang') lang?: string) {
    const rashis = await this.masterService.getRashis(lang || 'te');
    return {
      success: true,
      data: rashis,
    };
  }

  @Get('nakshatras')
  async getNakshatras(@Query('lang') lang?: string) {
    const nakshatras = await this.masterService.getNakshatras(lang || 'te');
    return {
      success: true,
      data: nakshatras,
    };
  }

  @Get('languages')
  async getLanguages() {
    const languages = await this.masterService.getLanguages();
    return {
      success: true,
      data: languages,
    };
  }

  @Get('states')
  async getStates() {
    const states = await this.masterService.getStates();
    return {
      success: true,
      data: states,
    };
  }

  @Get('districts')
  async getDistricts(@Query('state') state?: string) {
    const districts = await this.masterService.getDistricts(state);
    return {
      success: true,
      data: districts,
    };
  }

  @Get('deities')
  async getDeities(
    @Query('lang') lang?: string,
    @Query('featured') featured?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    const targetLang = (lang || 'en').toLowerCase().trim();
    let deities = await this.masterService.getDeities(targetLang);
    if (featured === 'true') {
      const featList = deities.filter((d: any) => d.isFeatured);
      if (featList.length > 0) deities = featList;
    }
    if (category && category !== 'all') {
      deities = deities.filter((d: any) => d.category === category);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      deities = deities.filter((d: any) =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.englishName && d.englishName.toLowerCase().includes(q)) ||
        (d.teluguName && d.teluguName.toLowerCase().includes(q)) ||
        (d.slug && d.slug.toLowerCase().includes(q))
      );
    }
    return {
      success: true,
      data: deities,
      total: deities.length,
    };
  }

  @Get('preset-logos')
  async getPresetLogos() {
    const logos = this.masterService.getPresetLogos();
    return {
      success: true,
      data: logos,
    };
  }

  @Get('ui-translations')
  async getUiTranslations(@Query('lang') lang?: string) {
    const data = await this.masterService.getUiTranslations(lang || 'en');
    return {
      success: true,
      language: lang || 'en',
      data,
    };
  }
}
