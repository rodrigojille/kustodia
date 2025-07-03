import { AppDataSource } from '../data-source';
import { Notification } from '../entity/Notification';
import { User } from '../entity/User';

/**
 * Creates and saves a new notification for a user.
 *
 * @param userId - The ID of the user to notify.
 * @param message - The notification message.
 * @param link - The URL the notification should link to.
 */
export const createNotification = async (userId: number, message: string, link: string): Promise<void> => {
  try {
    const notificationRepo = AppDataSource.getRepository(Notification);
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOneBy({ id: userId });

    if (!user) {
      console.error(`Attempted to create notification for non-existent user with ID: ${userId}`);
      return;
    }

    const newNotification = new Notification();
    newNotification.user = user;
    newNotification.message = message;
    newNotification.link = link;
    newNotification.read = false;

    await notificationRepo.save(newNotification);
    console.log(`Notification created for user ${userId}: "${message}"`);
  } catch (error) {
    console.error('Error creating notification:', error);
    // Depending on requirements, you might want to throw the error
    // to be handled by the calling function.
  }
};
