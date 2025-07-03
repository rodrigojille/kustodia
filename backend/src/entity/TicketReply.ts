import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './Ticket';
import { User } from './User';

@Entity('ticket_replies')
export class TicketReply {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column('text')
    message!: string;

  @CreateDateColumn()
    createdAt!: Date;

  @Column()
    ticketId!: string;

  @ManyToOne(() => Ticket, ticket => ticket.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
    ticket!: Ticket;

  @Column()
    userId!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
    user!: User;
}
