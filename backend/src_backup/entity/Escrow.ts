import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Payment } from "./Payment";

@Entity()
export class Escrow {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Payment)
  @JoinColumn({ name: "payment_id" })
  payment!: Payment;

  @Column({ nullable: true })
  smart_contract_escrow_id?: string;

  @Column({ nullable: true })
  blockchain_tx_hash?: string;

  @Column({ nullable: true })
  release_tx_hash?: string;

  @Column("decimal", { precision: 5, scale: 2 })
  custody_percent!: number;

  @Column("decimal", { precision: 18, scale: 2 })
  custody_amount!: number;

  @Column("decimal", { precision: 18, scale: 2 })
  release_amount!: number;

  @Column({ default: 'active' })
  status!: string;

  @Column({ default: 'none' })
  dispute_status!: string;

  @Column({ nullable: true })
  dispute_reason?: string;

  @Column({ nullable: true })
  dispute_details?: string;

  @Column({ nullable: true })
  dispute_evidence?: string;

  @Column({ type: 'jsonb', nullable: true })
  dispute_history?: Array<any>;

  @Column({ nullable: true })
  custody_end!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
