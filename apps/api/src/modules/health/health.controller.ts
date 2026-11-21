import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    let dbStatus = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e: any) {
      dbStatus = `disconnected: ${e?.message || 'DB error'}`;
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      service: 'saranam-ayyappa-backend',
      database: dbStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('liveness')
  getLiveness() {
    return {
      status: 'ok',
      service: 'saranam-ayyappa-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        database: 'disconnected',
        details: error?.message || 'Database connection error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}


