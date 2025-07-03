import { Request, Response, NextFunction } from 'express';
import AppDataSource from '../ormconfig';
import { Notification } from '../entity/Notification';
import { AuthenticatedRequest } from '../authenticateJWT';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const notifications = await notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 20,
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const unreadCount = await notificationRepository.count({
      where: { user: { id: userId }, read: false },
    });
    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const notification = await notificationRepository.findOne({ where: { id: parseInt(id), user: { id: userId } } });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notificationRepository.save(notification);

    res.json(notification);
  } catch (error) {
    next(error);
  }
};
