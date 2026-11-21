import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class SplashService {
  private readonly uploadsDir: string;

  constructor(private readonly prisma: PrismaService) {
    const candidates = [
      path.join(process.cwd(), 'apps', 'api', 'uploads'),
      path.join(__dirname, '..', '..', '..', 'uploads'),
      path.join(__dirname, '..', '..', 'uploads'),
      path.join(process.cwd(), 'uploads'),
    ];
    const baseDir = candidates.find((dir) => fs.existsSync(dir)) || candidates[0];
    this.uploadsDir = path.join(baseDir, 'splash');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // Helper to format full public URL for mobile and admin consumption (Task 2)
  private formatImageUrl(reqHost: string, relativePath: string): string {
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

    // 1. Explicit environment media origin (e.g. MEDIA_ORIGIN="http://192.168.1.6:4000" or CDN)
    if (process.env.MEDIA_ORIGIN) {
      const origin = process.env.MEDIA_ORIGIN.replace(/\/$/, '');
      return `${origin}${cleanPath}`;
    }

    // 2. Production HTTPS media domain
    if (process.env.NODE_ENV === 'production') {
      return `https://api.ayyappa.org${cleanPath}`;
    }

    // 3. For physical mobile devices on LAN: If request host is localhost or 127.0.0.1, resolve to LAN IP
    let host = reqHost;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      host = '192.168.1.6:4000';
    }

    const protocol = host.startsWith('https') ? 'https' : 'http';
    return `${protocol}://${host}${cleanPath}`;
  }

  // 1. Resolve currently published active splash for mobile client
  async getActiveSplash(platform: string = 'ALL', reqHost: string = 'localhost:4005') {
    const now = new Date();
    const normalizedPlatform = platform.toUpperCase();

    // Query for PUBLISHED asset with valid schedule eligibility
    const active = await this.prisma.splashAsset.findFirst({
      where: {
        status: 'PUBLISHED',
        archivedAt: null,
        OR: [
          { platform: 'ALL' },
          { platform: normalizedPlatform },
        ],
        AND: [
          {
            OR: [
              { scheduledStart: null },
              { scheduledStart: { lte: now } },
            ],
          },
          {
            OR: [
              { scheduledEnd: null },
              { scheduledEnd: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { version: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    if (!active) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: {
        id: active.id,
        version: active.version,
        title: active.title,
        description: active.description,
        imageUrl: this.formatImageUrl(reqHost, active.imageUrl),
        storageKey: active.storageKey,
        mimeType: active.mimeType,
        width: active.imageWidth || 1080,
        height: active.imageHeight || 1920,
        aspectRatio: active.aspectRatio || '9:16',
        platform: active.platform,
        status: active.status,
        updatedAt: active.updatedAt,
      },
    };
  }

  // 2. Admin: List assets with server-side pagination, search, status & platform filter
  async listAdminSplashAssets(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    platform?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    reqHost?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      archivedAt: query.status === 'ARCHIVED' ? { not: null } : null,
    };

    if (query.search && query.search.trim()) {
      where.OR = [
        { title: { contains: query.search.trim() } },
        { description: { contains: query.search.trim() } },
      ];
    }

    if (query.status && query.status !== 'ALL' && query.status !== 'ARCHIVED') {
      where.status = query.status.toUpperCase();
    }

    if (query.platform && query.platform !== 'ALL') {
      where.platform = query.platform.toUpperCase();
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      this.prisma.splashAsset.count({ where }),
      this.prisma.splashAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
      }),
    ]);

    const reqHost = query.reqHost || 'localhost:4005';
    const formatted = items.map((item) => ({
      ...item,
      imageUrl: this.formatImageUrl(reqHost, item.imageUrl),
    }));

    return {
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Admin: Get single splash asset by ID
  async getSplashById(id: number, reqHost: string = 'localhost:4005') {
    const asset = await this.prisma.splashAsset.findUnique({
      where: { id },
    });
    if (!asset) throw new NotFoundException(`Splash asset with ID ${id} not found`);

    return {
      success: true,
      data: {
        ...asset,
        imageUrl: this.formatImageUrl(reqHost, asset.imageUrl),
      },
    };
  }

  // 4. Admin: Upload & Create New Splash Asset
  async createSplashAsset(dto: {
    title: string;
    description?: string;
    imageBase64?: string;
    fileBuffer?: Buffer;
    fileName?: string;
    mimeType?: string;
    platform?: string;
    status?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    adminEmail?: string;
  }) {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('Splash title is required');
    }

    let buffer: Buffer;
    let mimeType = dto.mimeType || 'image/jpeg';
    let ext = '.jpg';

    if (dto.imageBase64) {
      const matches = dto.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(dto.imageBase64, 'base64');
      }
    } else if (dto.fileBuffer) {
      buffer = dto.fileBuffer;
    } else {
      throw new BadRequestException('Image data (base64 or file upload) is required');
    }

    // Security & file validation
    if (buffer.length > 15 * 1024 * 1024) {
      throw new BadRequestException('Image size exceeds maximum limit of 15MB');
    }

    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    else {
      throw new BadRequestException('Unsupported image format. Please upload JPEG, PNG, or WebP.');
    }

    // Generate sanitized unique storage key
    const uniqueHash = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const storageKey = `splash_${timestamp}_${uniqueHash}${ext}`;
    const filePath = path.join(this.uploadsDir, storageKey);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/splash/${storageKey}`;
    const fileSize = buffer.length;

    // Get current max version
    const maxVersionAsset = await this.prisma.splashAsset.findFirst({
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const nextVersion = (maxVersionAsset?.version || 0) + 1;

    const initialStatus = dto.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

    // If marked as published directly on create, perform atomic status transition
    return await this.prisma.$transaction(async (tx) => {
      if (initialStatus === 'PUBLISHED') {
        const normalizedPlatform = (dto.platform || 'ALL').toUpperCase();
        await tx.splashAsset.updateMany({
          where: {
            status: 'PUBLISHED',
            OR: [{ platform: 'ALL' }, { platform: normalizedPlatform }],
          },
          data: { status: 'DRAFT' },
        });
      }

      const created = await tx.splashAsset.create({
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          imageUrl: relativeUrl,
          storageKey,
          mimeType,
          fileSize,
          imageWidth: 1080,
          imageHeight: 1920,
          aspectRatio: '9:16',
          platform: (dto.platform || 'ALL').toUpperCase(),
          status: initialStatus,
          scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : null,
          scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
          version: nextVersion,
          createdBy: dto.adminEmail || 'SUPER_ADMIN',
          updatedBy: dto.adminEmail || 'SUPER_ADMIN',
        },
      });

      // Audit log
      await tx.adminAuditLog.create({
        data: {
          action: 'SPLASH_UPLOAD_CREATED',
          targetType: 'SplashAsset',
          targetId: String(created.id),
          detailsJson: JSON.stringify({
            title: created.title,
            version: created.version,
            status: created.status,
            storageKey: created.storageKey,
          }),
        },
      });

      return {
        success: true,
        data: created,
        message: 'Splash screen image uploaded and registered successfully.',
      };
    });
  }

  // 5. Admin: Publish a Splash Asset (Atomic Transaction)
  async publishSplashAsset(id: number, adminEmail: string = 'SUPER_ADMIN') {
    const asset = await this.prisma.splashAsset.findUnique({
      where: { id },
    });
    if (!asset) throw new NotFoundException(`Splash asset with ID ${id} not found`);

    if (asset.archivedAt) {
      throw new BadRequestException('Archived splash assets cannot be published directly. Restore it first.');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Step A: Archive or set currently active published asset for this platform to DRAFT
      await tx.splashAsset.updateMany({
        where: {
          id: { not: id },
          status: 'PUBLISHED',
          OR: [{ platform: 'ALL' }, { platform: asset.platform }],
        },
        data: {
          status: 'DRAFT',
        },
      });

      // Step B: Mark target asset as PUBLISHED with new version increment
      const maxVersion = await tx.splashAsset.findFirst({
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const newVersion = Math.max(asset.version, (maxVersion?.version || 0) + 1);

      const updated = await tx.splashAsset.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          version: newVersion,
          updatedBy: adminEmail,
          updatedAt: new Date(),
        },
      });

      // Step C: Record immutable Audit Log
      await tx.adminAuditLog.create({
        data: {
          action: 'SPLASH_PUBLISHED',
          targetType: 'SplashAsset',
          targetId: String(id),
          detailsJson: JSON.stringify({
            id: updated.id,
            title: updated.title,
            version: updated.version,
            platform: updated.platform,
            publishedBy: adminEmail,
          }),
        },
      });

      return {
        success: true,
        data: updated,
        message: `Version ${updated.version} of "${updated.title}" is now published and active for all mobile devices.`,
      };
    });
  }

  // 6. Admin: Unpublish a Splash Asset
  async unpublishSplashAsset(id: number, adminEmail: string = 'SUPER_ADMIN') {
    const asset = await this.prisma.splashAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Splash asset with ID ${id} not found`);

    const updated = await this.prisma.splashAsset.update({
      where: { id },
      data: {
        status: 'DRAFT',
        updatedBy: adminEmail,
        updatedAt: new Date(),
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        action: 'SPLASH_UNPUBLISHED',
        targetType: 'SplashAsset',
        targetId: String(id),
        detailsJson: JSON.stringify({ id, title: asset.title, previousStatus: asset.status }),
      },
    });

    return {
      success: true,
      data: updated,
      message: `Splash asset "${asset.title}" unpublished and moved to DRAFT.`,
    };
  }

  // 7. Admin: Archive a Splash Asset
  async archiveSplashAsset(id: number, adminEmail: string = 'SUPER_ADMIN') {
    const asset = await this.prisma.splashAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Splash asset with ID ${id} not found`);

    const updated = await this.prisma.splashAsset.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
        updatedBy: adminEmail,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        action: 'SPLASH_ARCHIVED',
        targetType: 'SplashAsset',
        targetId: String(id),
        detailsJson: JSON.stringify({ id, title: asset.title }),
      },
    });

    return {
      success: true,
      data: updated,
      message: `Splash asset "${asset.title}" archived successfully.`,
    };
  }

  // 8. Admin: Restore a Splash Asset
  async restoreSplashAsset(id: number, adminEmail: string = 'SUPER_ADMIN') {
    const asset = await this.prisma.splashAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Splash asset with ID ${id} not found`);

    const updated = await this.prisma.splashAsset.update({
      where: { id },
      data: {
        status: 'DRAFT',
        archivedAt: null,
        updatedBy: adminEmail,
        updatedAt: new Date(),
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        action: 'SPLASH_RESTORED',
        targetType: 'SplashAsset',
        targetId: String(id),
        detailsJson: JSON.stringify({ id, title: asset.title }),
      },
    });

    return {
      success: true,
      data: updated,
      message: `Splash asset "${asset.title}" restored to DRAFT. You may now publish it.`,
    };
  }
}

