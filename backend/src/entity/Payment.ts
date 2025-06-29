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

  // The user expected to pay a payment request (for request/accept flows)
  @Column({ nullable: true, length: 255 })
  payer_email?: string;

  @Column("decimal", { precision: 18, scale: 2 })
  amount!: number;

  @Column({ default: 'MXN' })
  currency!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  reference!: string;

  @Column({ nullable: true })
  transaction_id?: string;

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

  @Column({ nullable: true, type: "decimal", precision: 5, scale: 2 })
  commission_percent?: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  commission_amount?: number;

  @Column({ nullable: true })
  platform_commission_percent?: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  platform_commission_amount?: number;

  @Column({ nullable: true })
  platform_commission_beneficiary_email?: string;

  @Column({ nullable: true, length: 255 })
  commission_beneficiary_name?: string;

  @Column({ nullable: true, length: 255 })
  commission_beneficiary_email?: string;

  @Column({ nullable: true, length: 18 })
  commission_beneficiary_clabe?: string;

  @Column({ nullable: true, length: 18 })
  payer_clabe?: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ default: 'traditional', length: 50 })
  payment_type!: string; // For routing to appropriate tracker: 'traditional' | 'nuevo_flujo' | 'web3'

  // Nuevo-flujo specific fields
  @Column({ nullable: true })
  payer_approval?: boolean;

  @Column({ nullable: true })
  payee_approval?: boolean;

  @Column({ nullable: true, type: "timestamp" })
  payer_approval_timestamp?: Date;

  @Column({ nullable: true, type: "timestamp" })
  payee_approval_timestamp?: Date;

  @Column({ nullable: true, type: "text" })
  release_conditions?: string;

  @Column({ nullable: true, length: 100 })
  vertical_type?: string; // e.g., 'freelance', 'marketplace', 'escrow'

  @OneToOne(() => Escrow, escrow => escrow.payment)
  @JoinColumn({ name: "escrow_id" })
  escrow?: Escrow;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
