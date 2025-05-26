import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Payment } from "./Payment";

@Entity()
export class PaymentEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Payment, { nullable: false })
  payment!: Payment;

  @Column()
  type!: string; // e.g., 'initiated', 'deposit_received', 'payout_released', 'custody_released'

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at!: Date;
}
