import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Payment } from './Payment';

@Entity('commission_recipients')
@Index(['payment_id'])
export class CommissionRecipient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('integer')
  payment_id!: number;

  // Broker details
  @Column({ length: 255 })
  broker_email!: string;

  @Column({ nullable: true, length: 255 })
  broker_name?: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  broker_percentage!: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  broker_amount!: number;

  // Payment tracking
  @Column({ default: false })
  paid!: boolean;

  @Column({ nullable: true })
  paid_at?: Date;

  @Column({ nullable: true, length: 255 })
  payment_transaction_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relationship with Payment
  @ManyToOne(() => Payment, payment => payment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;
}
