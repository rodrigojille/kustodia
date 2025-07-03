import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Notification } from '../entity/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notificationRepo = AppDataSource.getRepository(Notification);

    const notifications = await notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to the last 50 notifications
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notificationRepo = AppDataSource.getRepository(Notification);

    const count = await notificationRepo.count({
      where: { user: { id: userId }, read: false },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ message: 'Error fetching unread notification count' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notificationId = parseInt(req.params.id, 10);
    const notificationRepo = AppDataSource.getRepository(Notification);

    const notification = await notificationRepo.findOne({
        where: { id: notificationId, user: { id: userId } }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or you do not have permission to view it.' });
    }

    notification.read = true;
    await notificationRepo.save(notification);

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};
