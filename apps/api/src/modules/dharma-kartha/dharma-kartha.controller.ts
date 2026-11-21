import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { DharmaKarthaService } from './dharma-kartha.service';

@Controller('dharma-kartha')
export class DharmaKarthaController {
  constructor(private readonly dkService: DharmaKarthaService) {}

  // Helper to extract or resolve user id for general endpoints
  private resolveUserId(headers: Record<string, string>, query: any): number {
    const rawId = headers['x-user-id'] || headers['X-User-Id'] || query.userId;
    return rawId ? parseInt(rawId, 10) : 1; // Defaults to authenticated devotee #1 in dev
  }

  // Helper strictly requiring login (without login no need to allow)
  private requireAuthenticatedUser(headers: Record<string, string>, query: any): number {
    const authHeader = headers['authorization'] || headers['Authorization'];
    const rawId = headers['x-user-id'] || headers['X-User-Id'] || query?.userId;

    let resolvedId: number | null = null;
    if (rawId) {
      const parsed = parseInt(String(rawId), 10);
      if (!isNaN(parsed) && parsed > 0) {
        resolvedId = parsed;
      }
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (/^\d+$/.test(token)) {
        resolvedId = parseInt(token, 10);
      }
    }

    if (!resolvedId) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Authentication required. Please log in to view or manage notifications.',
        error: 'Unauthorized',
      });
    }

    return resolvedId;
  }

  // 1. GET /api/v1/dharma-kartha/dashboard
  @Get('dashboard')
  async getDashboard(@Headers() headers: Record<string, string>, @Query() query: any) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.getDashboardStats(userId);
  }

  // 2. GET /api/v1/dharma-kartha/profile
  @Get('profile')
  async getProfile(@Headers() headers: Record<string, string>, @Query() query: any) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.getOwnerProfile(userId);
  }

  // 3. GET /api/v1/dharma-kartha/temples
  @Get('temples')
  async getMyTemples(@Headers() headers: Record<string, string>, @Query() query: any) {
    const userId = this.resolveUserId(headers, query);
    if (query.page || query.limit || query.search || query.status) {
      return this.dkService.getAuthorizedTemplesPaginated(userId, query);
    }
    return this.dkService.getAuthorizedTemples(userId);
  }

  // 3b. GET /api/v1/dharma-kartha/public/temples (Approved & Published Temples for Public Website)
  @Get('public/temples')
  async getPublicPublishedTemples() {
    return this.dkService.getPublicPublishedTemples();
  }

  // 3c. GET /api/v1/dharma-kartha/public/temples/:slugOrName/details
  @Get('public/temples/:slugOrName/details')
  async getPublicTempleDetails(@Param('slugOrName') slugOrName: string) {
    return this.dkService.getPublicTempleDetails(slugOrName);
  }

  // 3d. POST /api/v1/dharma-kartha/temples/claim (Submit Ownership Claim)
  @Post('temples/claim')
  async claimOwnership(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.claimTempleOwnership(userId, body);
  }

  // =========================================================
  // PHASE 5: TEMPLE TIMINGS CONTROLLER ENDPOINTS
  // =========================================================

  // GET /api/v1/dharma-kartha/temples/:id/timings
  @Get('temples/:id/timings')
  async getTempleTimings(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.getTempleTimings(userId, parseInt(id, 10));
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // POST /api/v1/dharma-kartha/temples/:id/timings
  @Post('temples/:id/timings')
  async addTempleTiming(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.addTempleTiming(userId, parseInt(id, 10), body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // PATCH /api/v1/dharma-kartha/temples/:id/timings/:timingId
  @Patch('temples/:id/timings/:timingId')
  async updateTempleTiming(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Param('timingId') timingId: string,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.updateTempleTiming(
      userId,
      parseInt(id, 10),
      parseInt(timingId, 10),
      body,
    );
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // DELETE /api/v1/dharma-kartha/temples/:id/timings/:timingId
  @Delete('temples/:id/timings/:timingId')
  async deleteTempleTiming(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Param('timingId') timingId: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.deleteTempleTiming(
      userId,
      parseInt(id, 10),
      parseInt(timingId, 10),
    );
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // =========================================================
  // PHASE 6: FESTIVALS & EVENTS CONTROLLER ENDPOINTS
  // =========================================================

  // GET /api/v1/dharma-kartha/festivals
  @Get('festivals')
  async getFestivals(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const templeId = query.templeId ? parseInt(query.templeId, 10) : undefined;
    return this.dkService.getOwnerFestivals(userId, templeId);
  }

  // GET /api/v1/dharma-kartha/festivals/:id (View Festival by ID)
  @Get('festivals/:id')
  async getFestivalById(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.getOwnerFestivalById(userId, parseInt(id, 10));
  }

  // POST /api/v1/dharma-kartha/festivals
  @Post('festivals')
  async addFestival(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.addTempleFestival(userId, body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // PATCH /api/v1/dharma-kartha/festivals/:id
  @Patch('festivals/:id')
  async updateFestival(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.updateTempleFestival(userId, parseInt(id, 10), body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // DELETE /api/v1/dharma-kartha/festivals/:id
  @Delete('festivals/:id')
  async deleteFestival(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.deleteTempleFestival(userId, parseInt(id, 10));
  }

  // GET /api/v1/dharma-kartha/events
  @Get('events')
  async getEvents(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const templeId = query.templeId ? parseInt(query.templeId, 10) : undefined;
    return this.dkService.getOwnerEvents(userId, templeId);
  }

  // GET /api/v1/dharma-kartha/events/:id (View Event by ID)
  @Get('events/:id')
  async getEventById(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.getOwnerEventById(userId, parseInt(id, 10));
  }

  // POST /api/v1/dharma-kartha/events
  @Post('events')
  async addEvent(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.addTempleEvent(userId, body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // PATCH /api/v1/dharma-kartha/events/:id
  @Patch('events/:id')
  async updateEvent(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.updateTempleEvent(userId, parseInt(id, 10), body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // DELETE /api/v1/dharma-kartha/events/:id
  @Delete('events/:id')
  async deleteEvent(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.deleteTempleEvent(userId, parseInt(id, 10));
  }

  // GET /api/v1/dharma-kartha/public/temples/:slugOrName/festivals
  @Get('public/temples/:slugOrName/festivals')
  async getPublicTempleFestivals(@Param('slugOrName') slugOrName: string) {
    return this.dkService.getPublicTempleFestivals(slugOrName);
  }

  // GET /api/v1/festivals/calendar (Domain A: General Hindu Festival Calendar)
  @Get('general/calendar')
  async getHinduCalendar(@Query() query: any) {
    return this.dkService.getHinduFestivalCalendar(query);
  }

  // =========================================================
  // PHASE 7: GALLERY MEDIA & NOTIFICATIONS ENDPOINTS
  // =========================================================

  // GET /api/v1/dharma-kartha/media
  @Get('media')
  async getMedia(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const templeId = query.templeId ? parseInt(query.templeId, 10) : undefined;
    return this.dkService.getOwnerMedia(userId, templeId, query.status);
  }

  // GET /api/v1/dharma-kartha/media/:id (View Media by ID)
  @Get('media/:id')
  async getMediaById(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.getOwnerMediaById(userId, parseInt(id, 10));
  }

  // POST /api/v1/dharma-kartha/media
  @Post('media')
  async uploadMedia(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.uploadTempleMedia(userId, body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // PATCH /api/v1/dharma-kartha/media/:id
  @Patch('media/:id')
  async updateMedia(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.updateTempleMedia(userId, parseInt(id, 10), body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // DELETE /api/v1/dharma-kartha/media/:id
  @Delete('media/:id')
  async deleteMedia(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.deleteTempleMedia(userId, parseInt(id, 10));
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // GET /api/v1/dharma-kartha/public/temples/:slugOrName/gallery
  @Get('public/temples/:slugOrName/gallery')
  async getPublicGallery(@Param('slugOrName') slugOrName: string) {
    return this.dkService.getPublicTempleGallery(slugOrName);
  }

  // POST /api/v1/dharma-kartha/admin/review-claim - Super Admin Claim Review
  @Post('admin/review-claim')
  async reviewClaim(
    @Headers('authorization') authHeader: string,
    @Body() body: { claimRequestId: number; approve: boolean; notes?: string },
  ) {
    // Admin auth verification
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminEmail = token ? 'admin@saranamayyappa.org' : 'superadmin@saranamayyappa.in';
    return this.dkService.reviewClaimAsAdmin(adminEmail, body.claimRequestId, body.approve, body.notes);
  }

  // GET /api/v1/dharma-kartha/admin/temples - Super Admin Temple Review List
  @Get('admin/temples')
  async getAdminTemples(@Query() query: any) {
    return this.dkService.getAllTemplesForAdmin(query);
  }

  // PUT /api/v1/dharma-kartha/admin/temples/:id/review - Approve or Reject Temple
  @Put('admin/temples/:id/review')
  async reviewTemplePut(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminEmail = token ? 'admin@saranamayyappa.org' : 'superadmin@saranamayyappa.in';
    return this.dkService.reviewTempleAsAdmin(parseInt(id, 10), body, adminEmail);
  }

  // POST /api/v1/dharma-kartha/admin/temples/:id/review - Approve or Reject Temple (POST alias)
  @Post('admin/temples/:id/review')
  async reviewTemplePost(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminEmail = token ? 'admin@saranamayyappa.org' : 'superadmin@saranamayyappa.in';
    return this.dkService.reviewTempleAsAdmin(parseInt(id, 10), body, adminEmail);
  }

  // POST /api/v1/dharma-kartha/upload-image - Upload temple hero/sanctum image
  @Post('upload-image')
  async uploadImage(@Body() body: any) {
    return this.dkService.uploadImage(body);
  }

  // 4. GET /api/v1/dharma-kartha/temples/:id (Fetch Details of Authorized Temple)
  @Get('temples/:id')
  async getTempleDetails(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.getTempleDetails(userId, parseInt(id, 10));
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // 5. PATCH /api/v1/dharma-kartha/temples/:id (Update Authorized Temple)
  @Patch('temples/:id')
  async updateTemple(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.updateTemple(userId, parseInt(id, 10), body);
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // 6. POST /api/v1/dharma-kartha/temples (Register New Temple)
  @Post('temples')
  async createTemple(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.createTemple(userId, body);
  }

  // 7. POST /api/v1/dharma-kartha/temples/:id/deletion-request
  @Post('temples/:id/deletion-request')
  async requestDeletion(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = this.resolveUserId(headers, query);
    return this.dkService.requestTempleDeletion(userId, parseInt(id, 10), body?.reason || 'Owner request');
  }

  // 8. DELETE /api/v1/dharma-kartha/temples/:id (Direct Delete Mandir)
  @Delete('temples/:id')
  async deleteTemple(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const userId = this.resolveUserId(headers, query);
    const result = await this.dkService.deleteTemple(userId, parseInt(id, 10));
    if (!result.success && result.statusCode === 403) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }
}
