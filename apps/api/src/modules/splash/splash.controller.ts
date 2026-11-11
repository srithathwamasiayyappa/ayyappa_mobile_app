import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SplashService } from './splash.service';
import { Request } from 'express';

@Controller()
export class SplashController {
  constructor(private readonly splashService: SplashService) {}

  // 1. PUBLIC MOBILE ENDPOINT: GET /api/v1/mobile/splash/active
  @Get('mobile/splash/active')
  async getActiveSplash(
    @Query('platform') platform: string = 'ALL',
    @Req() req: Request,
  ) {
    const host = req.get('host') || 'localhost:4005';
    return await this.splashService.getActiveSplash(platform, host);
  }

  // 2. ADMIN LIST: GET /api/v1/admin/splash
  @Get('admin/splash')
  async listAdminSplashAssets(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Req() req?: Request,
  ) {
    const host = req?.get('host') || 'localhost:4005';
    return await this.splashService.listAdminSplashAssets({
      page,
      limit,
      search,
      status,
      platform,
      sortBy,
      sortOrder,
      reqHost: host,
    });
  }

  // 3. ADMIN GET SINGLE: GET /api/v1/admin/splash/:id
  @Get('admin/splash/:id')
  async getSplashById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const host = req.get('host') || 'localhost:4005';
    return await this.splashService.getSplashById(id, host);
  }

  // 4. ADMIN UPLOAD & CREATE: POST /api/v1/admin/splash
  @Post('admin/splash')
  @UseInterceptors(FileInterceptor('file'))
  async createSplash(
    @UploadedFile() file: any,
    @Body() body: any,
    @Headers('authorization') authHeader?: string,
  ) {
    return await this.splashService.createSplashAsset({
      title: body.title,
      description: body.description,
      imageBase64: body.imageBase64,
      fileBuffer: file ? file.buffer : undefined,
      fileName: file ? file.originalname : undefined,
      mimeType: file ? file.mimetype : body.mimeType,
      platform: body.platform,
      status: body.status,
      scheduledStart: body.scheduledStart,
      scheduledEnd: body.scheduledEnd,
      adminEmail: body.adminEmail || 'SUPER_ADMIN',
    });
  }

  // 5. ADMIN PUBLISH: POST /api/v1/admin/splash/:id/publish
  @Post('admin/splash/:id/publish')
  async publishSplash(
    @Param('id', ParseIntPipe) id: number,
    @Body('adminEmail') adminEmail?: string,
  ) {
    return await this.splashService.publishSplashAsset(id, adminEmail || 'SUPER_ADMIN');
  }

  // 6. ADMIN UNPUBLISH: POST /api/v1/admin/splash/:id/unpublish
  @Post('admin/splash/:id/unpublish')
  async unpublishSplash(
    @Param('id', ParseIntPipe) id: number,
    @Body('adminEmail') adminEmail?: string,
  ) {
    return await this.splashService.unpublishSplashAsset(id, adminEmail || 'SUPER_ADMIN');
  }

  // 7. ADMIN ARCHIVE: POST /api/v1/admin/splash/:id/archive
  @Post('admin/splash/:id/archive')
  async archiveSplash(
    @Param('id', ParseIntPipe) id: number,
    @Body('adminEmail') adminEmail?: string,
  ) {
    return await this.splashService.archiveSplashAsset(id, adminEmail || 'SUPER_ADMIN');
  }

  // 8. ADMIN RESTORE: POST /api/v1/admin/splash/:id/restore
  @Post('admin/splash/:id/restore')
  async restoreSplash(
    @Param('id', ParseIntPipe) id: number,
    @Body('adminEmail') adminEmail?: string,
  ) {
    return await this.splashService.restoreSplashAsset(id, adminEmail || 'SUPER_ADMIN');
  }
}

