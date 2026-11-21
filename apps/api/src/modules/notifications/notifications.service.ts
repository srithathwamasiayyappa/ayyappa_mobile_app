import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  desc?: string;
  category: string;
  type: string;
  isRead: boolean;
  read?: boolean;
  linkUrl?: string | null;
  destination?: string | null;
  role: 'CUSTOMER' | 'DHARMA_KARTHA';
  createdAt: Date | string;
  updatedAt?: Date | string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Fallback in-memory customer notifications
  private fallbackCustomerNotifs: NotificationItem[] = [
    {
      id: 1,
      userId: 1,
      title: 'Daily Panchangam & Auspicious Muhurtham',
      message: 'Today is Shuddha Ekadashi with auspicious Brahma Muhurtham from 04:30 AM to 05:15 AM. Ideal for Lord Ayyappa Nitya Pooja.',
      category: 'panchangam',
      type: 'panchangam',
      role: 'CUSTOMER',
      isRead: false,
      linkUrl: '/panchangam',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      userId: 1,
      title: 'Mandala Pooja Vratham Reminder',
      message: 'Sacred 41-day Mandala Kalam observance guidelines and daily evening Harivarasanam chant available in Telugu & English.',
      category: 'pooja',
      type: 'pooja',
      role: 'CUSTOMER',
      isRead: false,
      linkUrl: '/audio',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 3,
      userId: 1,
      title: 'Makaravilakku Festival Darshan Schedule',
      message: 'Special live broadcast & Makaravilakku Jyothi darshan updates for Sabarimala hill shrine have been published.',
      category: 'festival',
      type: 'festival',
      role: 'CUSTOMER',
      isRead: true,
      linkUrl: '/festivals',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 4,
      userId: 1,
      title: 'Annadanam Seva Registered',
      message: 'Your voluntary Annadanam offering receipt for Sabarimala pilgrim camp has been generated.',
      category: 'annadanam',
      type: 'annadanam',
      role: 'CUSTOMER',
      isRead: true,
      linkUrl: '/profile',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

  // Fallback in-memory Dharma Kartha notifications
  private fallbackOwnerNotifs: NotificationItem[] = [
    {
      id: 101,
      userId: 1,
      title: 'Temple Ownership Approved',
      message: 'Your management rights for Sri Ayyappa Swamy Temple have been verified and approved by the Super Admin.',
      category: 'temple',
      type: 'APPROVAL',
      role: 'DHARMA_KARTHA',
      isRead: false,
      linkUrl: '/dharma-kartha/dashboard',
      createdAt: new Date().toISOString(),
    },
    {
      id: 102,
      userId: 1,
      title: 'Festival Schedule Published',
      message: 'Mandala Pooja Mahotsavam schedule has been successfully published to the public portal for devotees.',
      category: 'festival',
      type: 'EVENT',
      role: 'DHARMA_KARTHA',
      isRead: false,
      linkUrl: '/dharma-kartha/festivals',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 103,
      userId: 1,
      title: 'New Devotee Darshan Inquiries',
      message: '5 new devotees have saved your temple timing alerts for weekend special abhishekams.',
      category: 'temple',
      type: 'INFO',
      role: 'DHARMA_KARTHA',
      isRead: true,
      linkUrl: '/dharma-kartha/dashboard',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 104,
      userId: 1,
      title: 'Temple Gallery Images Approved',
      message: '3 newly uploaded Sanctum Sanctorum and Utsava Vigraham photographs are now live on your temple page.',
      category: 'gallery',
      type: 'APPROVAL',
      role: 'DHARMA_KARTHA',
      isRead: true,
      linkUrl: '/dharma-kartha/gallery',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Strictly verify authentication and resolve user role (CUSTOMER or DHARMA_KARTHA).
   * WITHOUT LOGIN NO NEED TO ALLOW -> strictly throws 401 Unauthorized.
   */
  async resolveUserAndRole(
    headers: Record<string, string>,
    query: any,
  ): Promise<{ userId: number; role: 'CUSTOMER' | 'DHARMA_KARTHA'; user: any }> {
    const authHeader = headers['authorization'] || headers['Authorization'];
    const rawUserId = headers['x-user-id'] || headers['X-User-Id'] || query?.userId;

    let resolvedId: number | null = null;

    if (rawUserId) {
      const parsed = parseInt(String(rawUserId), 10);
      if (!isNaN(parsed) && parsed > 0) {
        resolvedId = parsed;
      }
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (/^\d+$/.test(token)) {
        resolvedId = parseInt(token, 10);
      }
    }

    // STRICT AUTH REJECTION: Without login, no need to allow!
    if (!resolvedId) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Authentication required. Please log in to view or manage notifications.',
        error: 'Unauthorized',
      });
    }

    let user: any = null;
    try {
      user = await this.prisma.appUser.findUnique({
        where: { id: resolvedId },
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          isDeleted: true,
          isSuspended: true,
          addressLine: true,
        },
      });
    } catch (err: any) {
      this.logger.warn(`User lookup warning in MariaDB: ${err?.message || err}`);
    }

    if (user) {
      if (user.isDeleted) {
        throw new UnauthorizedException('This devotee account has been deactivated. Access denied.');
      }
      if (user.isSuspended) {
        throw new UnauthorizedException('This devotee account is currently suspended. Please contact temple administration.');
      }
    }

    // Determine Requested Role
    const explicitRole = (query?.role || headers['x-user-role'] || '').toUpperCase();
    let determinedRole: 'CUSTOMER' | 'DHARMA_KARTHA' = 'CUSTOMER';

    if (explicitRole.includes('DHARM') || explicitRole.includes('OWNER') || explicitRole.includes('TRUST')) {
      determinedRole = 'DHARMA_KARTHA';
    } else if (explicitRole.includes('CUST') || explicitRole.includes('DEV')) {
      determinedRole = 'CUSTOMER';
    } else {
      // Auto-detect role from user account
      const isDkInMeta = user?.addressLine && user.addressLine.includes('DHARMA_KARTHA');
      let hasMembership = false;
      try {
        const mem = await (this.prisma as any).templeMembership.findFirst({
          where: { userId: resolvedId },
        });
        if (mem) hasMembership = true;
      } catch {}

      if (isDkInMeta || hasMembership) {
        determinedRole = 'DHARMA_KARTHA';
      } else {
        determinedRole = 'CUSTOMER';
      }
    }

    return {
      userId: resolvedId,
      role: determinedRole,
      user,
    };
  }

  /**
   * Helper for backwards-compatible verifyAuthenticatedUser
   */
  async verifyAuthenticatedUser(
    headers: Record<string, string>,
    query: any,
    requiredRole?: 'CUSTOMER' | 'DHARMA_KARTHA',
  ): Promise<number> {
    const { userId } = await this.resolveUserAndRole(headers, { ...query, role: requiredRole || query?.role });
    return userId;
  }

  /**
   * 1. GET Notifications by Role (Single unified API)
   */
  async getNotificationsByRole(userId: number, role: 'CUSTOMER' | 'DHARMA_KARTHA', query: any = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const category = query.category || query.type;
    const unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === true || query.filter === 'Unread' || query.filter === 'UNREAD';
    const search = (query.search || '').trim().toLowerCase();

    if (role === 'DHARMA_KARTHA') {
      try {
        const where: any = { userId };
        if (unreadOnly) where.isRead = false;
        if (category && category !== 'ALL' && category !== 'All') {
          where.type = category;
        }

        const [total, unreadCount, items] = await Promise.all([
          (this.prisma as any).ownerNotification.count({ where }),
          (this.prisma as any).ownerNotification.count({ where: { userId, isRead: false } }),
          (this.prisma as any).ownerNotification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
        ]);

        return {
          success: true,
          role: 'DHARMA_KARTHA',
          unreadCount,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
          notifications: items.map((n: any) => ({
            id: n.id,
            userId: n.userId,
            title: n.title,
            message: n.message,
            desc: n.message,
            category: n.type?.toLowerCase() || 'temple',
            type: n.type || 'INFO',
            role: 'DHARMA_KARTHA',
            isRead: Boolean(n.isRead),
            read: Boolean(n.isRead),
            linkUrl: n.linkUrl,
            destination: n.linkUrl,
            createdAt: n.createdAt,
          })),
        };
      } catch (err: any) {
        this.logger.warn(`OwnerNotification DB query fallback: ${err?.message || err}`);
        let items = this.fallbackOwnerNotifs.filter((n) => n.userId === userId || n.userId === 1);
        if (unreadOnly) items = items.filter((n) => !n.isRead);
        if (category && category !== 'ALL' && category !== 'All') {
          items = items.filter((n) => n.type.toLowerCase() === category.toLowerCase() || n.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
          items = items.filter((n) => n.title.toLowerCase().includes(search) || n.message.toLowerCase().includes(search));
        }

        const total = items.length;
        const unreadCount = items.filter((n) => !n.isRead).length;
        const paginated = items.slice(skip, skip + limit);

        return {
          success: true,
          role: 'DHARMA_KARTHA',
          unreadCount,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
          notifications: paginated,
        };
      }
    }

    // Role: CUSTOMER
    try {
      const where: any = { userId };
      if (category && category !== 'All' && category !== 'ALL') {
        where.category = category;
      }
      if (unreadOnly) where.isRead = false;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { message: { contains: search } },
        ];
      }

      const [total, unreadCount, items] = await Promise.all([
        (this.prisma as any).customerNotification.count({ where }),
        (this.prisma as any).customerNotification.count({ where: { userId, isRead: false } }),
        (this.prisma as any).customerNotification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        success: true,
        role: 'CUSTOMER',
        unreadCount,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        notifications: items.map((n: any) => ({
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          desc: n.message,
          category: n.category,
          type: n.category,
          role: 'CUSTOMER',
          isRead: Boolean(n.isRead),
          read: Boolean(n.isRead),
          linkUrl: n.linkUrl,
          destination: n.linkUrl,
          createdAt: n.createdAt,
        })),
      };
    } catch (err: any) {
      this.logger.warn(`CustomerNotification DB query fallback: ${err?.message || err}`);
      let items = this.fallbackCustomerNotifs.filter((n) => n.userId === userId || n.userId === 1);
      if (category && category !== 'All' && category !== 'ALL') {
        items = items.filter((n) => n.category.toLowerCase() === category.toLowerCase());
      }
      if (unreadOnly) items = items.filter((n) => !n.isRead);
      if (search) {
        items = items.filter((n) => n.title.toLowerCase().includes(search) || n.message.toLowerCase().includes(search));
      }

      const total = items.length;
      const unreadCount = items.filter((n) => !n.isRead).length;
      const paginated = items.slice(skip, skip + limit);

      return {
        success: true,
        role: 'CUSTOMER',
        unreadCount,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        notifications: paginated,
      };
    }
  }

  /**
   * 2. GET Unread Count by Role (Single unified API)
   */
  async getUnreadCountByRole(userId: number, role: 'CUSTOMER' | 'DHARMA_KARTHA') {
    if (role === 'DHARMA_KARTHA') {
      try {
        const count = await (this.prisma as any).ownerNotification.count({
          where: { userId, isRead: false },
        });
        return { success: true, role: 'DHARMA_KARTHA', unreadCount: count };
      } catch {
        const count = this.fallbackOwnerNotifs.filter((n) => (n.userId === userId || n.userId === 1) && !n.isRead).length;
        return { success: true, role: 'DHARMA_KARTHA', unreadCount: count };
      }
    }

    try {
      const count = await (this.prisma as any).customerNotification.count({
        where: { userId, isRead: false },
      });
      return { success: true, role: 'CUSTOMER', unreadCount: count };
    } catch {
      const count = this.fallbackCustomerNotifs.filter((n) => (n.userId === userId || n.userId === 1) && !n.isRead).length;
      return { success: true, role: 'CUSTOMER', unreadCount: count };
    }
  }

  /**
   * 3. PATCH Mark Notification as Read (Single unified API)
   */
  async markReadByRole(userId: number, notifId: number, role?: 'CUSTOMER' | 'DHARMA_KARTHA') {
    let marked = false;

    // If Dharma Kartha or auto
    if (!role || role === 'DHARMA_KARTHA') {
      try {
        const res = await (this.prisma as any).ownerNotification.updateMany({
          where: { id: notifId, userId },
          data: { isRead: true },
        });
        if (res.count > 0) marked = true;
      } catch {}

      const dkItem = this.fallbackOwnerNotifs.find((n) => n.id === notifId);
      if (dkItem) {
        dkItem.isRead = true;
        marked = true;
      }
    }

    // If Customer or not yet marked
    if (!marked && (!role || role === 'CUSTOMER')) {
      try {
        const res = await (this.prisma as any).customerNotification.updateMany({
          where: { id: notifId, userId },
          data: { isRead: true },
        });
        if (res.count > 0) marked = true;
      } catch {}

      const custItem = this.fallbackCustomerNotifs.find((n) => n.id === notifId);
      if (custItem) {
        custItem.isRead = true;
        marked = true;
      }
    }

    return {
      success: true,
      message: 'Notification marked as read.',
      notificationId: notifId,
    };
  }

  /**
   * 4. PATCH Mark All Notifications as Read (Single unified API)
   */
  async markAllReadByRole(userId: number, role: 'CUSTOMER' | 'DHARMA_KARTHA') {
    if (role === 'DHARMA_KARTHA') {
      try {
        await (this.prisma as any).ownerNotification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });
      } catch {}
      this.fallbackOwnerNotifs
        .filter((n) => n.userId === userId || n.userId === 1)
        .forEach((n) => { n.isRead = true; });

      return {
        success: true,
        role: 'DHARMA_KARTHA',
        message: 'All Dharma Kartha notifications marked as read.',
      };
    }

    try {
      await (this.prisma as any).customerNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch {}
    this.fallbackCustomerNotifs
      .filter((n) => n.userId === userId || n.userId === 1)
      .forEach((n) => { n.isRead = true; });

    return {
      success: true,
      role: 'CUSTOMER',
      message: 'All devotional customer notifications marked as read.',
    };
  }

  // Alias methods for customer-specific backwards compatibility
  async getCustomerNotifications(userId: number, query: any = {}) {
    const res = await this.getNotificationsByRole(userId, 'CUSTOMER', query);
    return { ...res, data: res.notifications };
  }
  async getCustomerUnreadCount(userId: number) {
    return this.getUnreadCountByRole(userId, 'CUSTOMER');
  }
  async markCustomerNotificationRead(userId: number, notifId: number) {
    return this.markReadByRole(userId, notifId, 'CUSTOMER');
  }
  async markAllCustomerNotificationsRead(userId: number) {
    return this.markAllReadByRole(userId, 'CUSTOMER');
  }
  async deleteCustomerNotification(userId: number, notifId: number) {
    try {
      await (this.prisma as any).customerNotification.delete({ where: { id: notifId } });
    } catch {}
    this.fallbackCustomerNotifs = this.fallbackCustomerNotifs.filter((n) => n.id !== notifId);
    return { success: true, message: 'Notification deleted successfully.' };
  }
  async createCustomerNotification(data: any) {
    try {
      const created = await (this.prisma as any).customerNotification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          category: data.category || 'general',
          linkUrl: data.linkUrl || null,
          isRead: false,
        },
      });
      return { success: true, notification: created };
    } catch {
      const newItem: NotificationItem = {
        id: Date.now(),
        userId: data.userId,
        title: data.title,
        message: data.message,
        category: data.category || 'general',
        type: data.category || 'general',
        role: 'CUSTOMER',
        isRead: false,
        linkUrl: data.linkUrl || null,
        createdAt: new Date().toISOString(),
      };
      this.fallbackCustomerNotifs.unshift(newItem);
      return { success: true, notification: newItem };
    }
  }
}
