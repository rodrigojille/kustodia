import { Request, Response, NextFunction } from 'express';
import AppDataSource from '../ormconfig';
import { Notification } from '../entity/Notification';
import { AuthenticatedRequest } from '../authenticateJWT';

export const getNotifications = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  AppDataSource.getRepository(Notification).find({
    where: { user: { id: userId } },
    order: { createdAt: 'DESC' },
    take: 20,
  })
  .then(notifications => {
    res.json(notifications);
  })
  .catch(error => {
    next(error);
  });
};

export const getUnreadCount = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  AppDataSource.getRepository(Notification).count({
    where: { user: { id: userId }, read: false },
  })
  .then(unreadCount => {
    res.json({ unreadCount });
  })
  .catch(error => {
    next(error);
  });
};

export const markAsRead = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const notificationRepository = AppDataSource.getRepository(Notification);
  notificationRepository.findOne({ where: { id: parseInt(id), user: { id: userId } } })
    .then(notification => {
      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }
      notification.read = true;
      return notificationRepository.save(notification);
    })
    .then(savedNotification => {
      if (savedNotification) {
        res.json(savedNotification);
      }
    })
    .catch(error => {
      next(error);
    });
};
