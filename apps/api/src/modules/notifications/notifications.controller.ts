import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

/**
 * ===================================================================================
 * SINGLE UNIFIED ROLE-BASED NOTIFICATIONS CONTROLLER
 * Route: /api/v1/notifications
 * 
 * Supports:
 *   - role=CUSTOMER (Devotee: Panchangam, vratham reminders, pooja updates)
 *   - role=DHARMA_KARTHA (Trustee: Temple claim approvals, festivals, admin alerts)
 * 
 * STRICT AUTHENTICATION:
 *   Without login, strictly returns 401 Unauthorized.
 * ===================================================================================
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  /**
   * 1. GET /api/v1/notifications
   * Role-based notification list.
   * Query params:
   *   - role: 'CUSTOMER' | 'DHARMA_KARTHA' (Optional, auto-detected from account if omitted)
   *   - page: number (default: 1)
   *   - limit: number (default: 20)
   *   - category / type: string (filter by category)
   *   - unreadOnly: boolean (true to filter unread)
   *   - search: string (search keyword)
   * 
   * STRICT: Without login, throws 401 Unauthorized.
   */
  @Get()
  async getNotifications(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
  ) {
    const { userId, role } = await this.notifService.resolveUserAndRole(headers, query);
    return this.notifService.getNotificationsByRole(userId, role, query);
  }

  /**
   * 2. GET /api/v1/notifications/unread-count
   * Role-based unread notification count badge.
   * Query params:
   *   - role: 'CUSTOMER' | 'DHARMA_KARTHA'
   * 
   * STRICT: Without login, throws 401 Unauthorized.
   */
  @Get('unread-count')
  async getUnreadCount(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
  ) {
    const { userId, role } = await this.notifService.resolveUserAndRole(headers, query);
    return this.notifService.getUnreadCountByRole(userId, role);
  }

  /**
   * 3. PATCH /api/v1/notifications/:id/read
   * Mark single notification as read.
   * 
   * STRICT: Without login, throws 401 Unauthorized.
   */
  @Patch(':id/read')
  async markRead(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const { userId, role } = await this.notifService.resolveUserAndRole(headers, query);
    return this.notifService.markReadByRole(userId, parseInt(id, 10), role);
  }

  /**
   * 4. PATCH /api/v1/notifications/mark-all-read
   * Mark all notifications as read for the user's role.
   * 
   * STRICT: Without login, throws 401 Unauthorized.
   */
  @Patch('mark-all-read')
  async markAllRead(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
  ) {
    const { userId, role } = await this.notifService.resolveUserAndRole(headers, query);
    return this.notifService.markAllReadByRole(userId, role);
  }

  /**
   * 4b. POST /api/v1/notifications/read-all (Alias for mark-all-read)
   * STRICT: Without login, throws 401 Unauthorized.
   */
  @Post('read-all')
  async readAll(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
  ) {
    const { userId, role } = await this.notifService.resolveUserAndRole(headers, query);
    return this.notifService.markAllReadByRole(userId, role);
  }

  /**
   * 5. DELETE /api/v1/notifications/:id
   * Delete single notification.
   * STRICT: Without login, throws 401 Unauthorized.
   */
  @Delete(':id')
  async deleteNotification(
    @Headers() headers: Record<string, string>,
    @Query() query: any,
    @Param('id') id: string,
  ) {
    const { userId } = await this.notifService.resolveUserAndRole(headers, query);
    return this.notifService.deleteCustomerNotification(userId, parseInt(id, 10));
  }
}
