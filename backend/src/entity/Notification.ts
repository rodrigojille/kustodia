import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Payment } from './Payment';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  message!: string;

  @Column()
  link!: string; // e.g., /dashboard/pagos/123

  @Column({ default: 'info' })
  type!: 'success' | 'info' | 'warning' | 'error'; // Notification type for UI styling

  @Column({ default: 'general' })
  category!: 'payment' | 'dispute' | 'account' | 'general';

  @Column({ default: false })
  read!: boolean;

  // Optional reference to related payment
  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @Column({ nullable: true })
  payment_id?: number;

  @CreateDateColumn()
  createdAt!: Date;
}
