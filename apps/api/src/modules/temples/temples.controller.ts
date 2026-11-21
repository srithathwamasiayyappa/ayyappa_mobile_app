import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TemplesService } from './temples.service';

@Controller('temples')
export class TemplesController {
  constructor(private readonly templesService: TemplesService) {}

  @Get()
  async getTemples(
    @Query('lang') lang?: string,
    @Query('q') q?: string,
    @Query('deity') deity?: string,
    @Query('state') state?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const data = await this.templesService.getTemples({ lang, q, deity, state, includeInactive });
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get(':id')
  async getTempleById(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    const data = await this.templesService.getTempleById(id, lang);
    return {
      success: true,
      data,
    };
  }

  @Post()
  async createTemple(@Body() body: any) {
    const data = await this.templesService.createTemple(body);
    return {
      success: true,
      data,
      message: 'Temple created successfully',
    };
  }

  @Put(':id')
  async updateTemple(@Param('id') id: string, @Body() body: any) {
    const data = await this.templesService.updateTemple(id, body);
    return {
      success: true,
      data,
      message: 'Temple updated successfully',
    };
  }

  @Delete(':id')
  async deleteTemple(@Param('id') id: string) {
    const success = await this.templesService.deleteTemple(id);
    return {
      success,
      message: success ? 'Temple deleted successfully' : 'Failed to delete temple',
    };
  }
}
