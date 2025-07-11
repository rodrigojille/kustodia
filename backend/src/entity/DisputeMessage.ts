import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Dispute } from './Dispute';
import { User } from './User';

export enum MessageType {
  INITIAL = 'initial',
  USER_MESSAGE = 'user_message',
  ADMIN_MESSAGE = 'admin_message',
  EVIDENCE = 'evidence',
  SYSTEM = 'system'
}

@Entity('dispute_messages')
export class DisputeMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  message!: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.USER_MESSAGE,
  })
  message_type!: MessageType;

  @Column({ nullable: true })
  attachment_url?: string;

  @Column({ nullable: true })
  attachment_name?: string;

  @Column({ nullable: true })
  attachment_type?: string; // image, document, video, etc.

  @CreateDateColumn()
  created_at!: Date;

  @Column()
  dispute_id!: number;

  @ManyToOne(() => Dispute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute!: Dispute;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ default: false })
  is_admin!: boolean;
}
