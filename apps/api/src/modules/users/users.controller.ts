import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private extractUserId(
    headers: Record<string, any>,
    query: { userId?: string },
    body?: { userId?: number | string },
  ): number {
    const rawId = headers['x-user-id'] || query?.userId || body?.userId;
    const parsed = Number(rawId);
    if (!parsed || isNaN(parsed) || parsed <= 0) {
      throw new BadRequestException('User identification is missing or invalid.');
    }
    return parsed;
  }

  /**
   * GET /api/v1/users/me/profile
   */
  @Get('me/profile')
  async getMyProfile(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string; lang?: string },
  ) {
    const userId = this.extractUserId(headers, query);
    const profile = await this.usersService.getProfile(userId, query.lang || 'te');
    return {
      success: true,
      data: profile,
    };
  }

  /**
   * PATCH /api/v1/users/me/profile
   */
  @Patch('me/profile')
  async updateMyProfile(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string; lang?: string },
    @Body() body: any,
  ) {
    const userId = this.extractUserId(headers, query, body);
    const updated = await this.usersService.updateProfile(userId, body);
    return {
      success: true,
      message: 'Devotee profile updated successfully.',
      data: updated,
    };
  }

  /**
   * POST /api/v1/users/me/profile/photo
   */
  @Post('me/profile/photo')
  async uploadPhoto(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string },
    @Body() body: { userId?: number; imageBase64: string },
  ) {
    const userId = this.extractUserId(headers, query, body);
    if (!body.imageBase64) {
      throw new BadRequestException('imageBase64 is required.');
    }
    const result = await this.usersService.uploadProfilePhoto(userId, body.imageBase64);
    return result;
  }

  /**
   * POST /api/v1/users/me/request-deletion
   * Body: { userId?: number; otp: string; reason?: string }
   */
  @Post('me/request-deletion')
  async requestAccountDeletion(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string },
    @Body() body: { userId?: number; otp: string; reason?: string },
  ) {
    const userId = this.extractUserId(headers, query, body);
    if (!body.otp || body.otp.trim().length !== 6) {
      throw new BadRequestException('Please enter the 6-digit OTP sent to your mobile number.');
    }
    return this.usersService.requestAccountDeletion(userId, body.otp.trim(), body.reason);
  }

  /**
   * GET /api/v1/users/me/bookmarks
   */
  @Get('me/bookmarks')
  async getMyBookmarks(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string },
  ) {
    const userId = this.extractUserId(headers, query);
    const bookmarks = await this.usersService.getBookmarks(userId);
    return {
      success: true,
      data: bookmarks,
    };
  }

  /**
   * POST /api/v1/users/me/bookmarks
   */
  @Post('me/bookmarks')
  async addBookmark(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string },
    @Body() body: { itemId: string; itemType: string; title: string; subtitle?: string; thumbnailUrl?: string },
  ) {
    const userId = this.extractUserId(headers, query, body as any);
    return this.usersService.addBookmark(userId, body);
  }

  /**
   * DELETE /api/v1/users/me/bookmarks/:id
   */
  @Get('me/bookmarks/delete')
  async deleteBookmarkViaGet(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string; id: string },
  ) {
    const userId = this.extractUserId(headers, query);
    if (!query.id) throw new BadRequestException('Bookmark id is required');
    return this.usersService.removeBookmark(userId, query.id);
  }

  /**
   * GET /api/v1/users/me/preferences
   */
  @Get('me/preferences')
  async getPreferences(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string },
  ) {
    const userId = this.extractUserId(headers, query);
    const data = await this.usersService.getPreferences(userId);
    return {
      success: true,
      data,
    };
  }

  /**
   * PATCH /api/v1/users/me/preferences
   */
  @Patch('me/preferences')
  async updatePreferences(
    @Headers() headers: Record<string, any>,
    @Query() query: { userId?: string },
    @Body() body: { preferredLang?: string; devotionalUpdatesEnabled?: boolean },
  ) {
    const userId = this.extractUserId(headers, query, body as any);
    return this.usersService.updatePreferences(userId, body);
  }
}

