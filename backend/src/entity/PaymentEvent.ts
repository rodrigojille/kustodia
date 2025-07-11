import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Payment } from "./Payment";

@Entity()
export class PaymentEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  is_automatic!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Payment, { nullable: false })
  @JoinColumn({ name: "paymentId" })
  payment!: Payment;

  @Column()
  paymentId!: number;
}
