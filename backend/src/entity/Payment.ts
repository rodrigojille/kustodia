import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Escrow } from "./Escrow";
import { JunoTransaction } from "./JunoTransaction";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  recipient_email!: string;

  @Column("decimal", { precision: 18, scale: 2 })
  amount!: number;

  @Column({ default: 'MXN' })
  currency!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  reference!: string;

  // Relación explícita con la transacción Juno
  @ManyToOne(() => JunoTransaction, { nullable: true })
  @JoinColumn({ name: "juno_transaction_id" })
  junoTransaction?: JunoTransaction;
  // Si quieres mantener transaction_id como legacy, puedes dejarlo comentado o deprecado:
  // @Column({ nullable: true })
  // transaction_id!: string;

  @Column({ nullable: true })
  blockchain_tx_hash?: string;

  @Column({ nullable: true })
  bitso_tracking_number?: string;

  /**
   * Travel Rule compliance data (originator/beneficiary info, etc)
   * Example: {
   *   originator: { name, address, account },
   *   beneficiary: { name, address, account },
   *   reference: string
   * }
   */
  @Column({ type: "jsonb", nullable: true })
  travel_rule_data?: Record<string, any>;

  @Column({ nullable: true, length: 18 })
  deposit_clabe?: string; // Recipient's deposit CLABE at time of payment

  @Column({ nullable: true, length: 18 })
  payout_clabe?: string; // Seller's payout CLABE at time of payment creation

  @Column({ default: 'pending' })
  status!: string;

  @OneToOne(() => Escrow, escrow => escrow.payment)
  @JoinColumn({ name: "escrow_id" })
  escrow?: Escrow;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
