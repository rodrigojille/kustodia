import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type TransactionType = "DEPOSIT" | "WITHDRAWAL";
export type TransactionStatus =
  // Deposit Flow
  | 'pending_deposit'
  | 'pending_juno_withdrawal'
  | 'pending_bridge_transfer'
  | 'pending_blockchain_confirmation'
  | 'completed'
  // Withdrawal Flow
  | 'pending_user_transfer' // User needs to send crypto to bridge
  | 'pending_spei_payout'   // Ready to be paid out via SPEI
  | 'withdrawal_completed'
  // General
  | 'failed'
  | 'pending';

@Entity('wallet_transaction')
export class WalletTransaction {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'enum',
    enum: ['DEPOSIT', 'WITHDRAWAL']
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: ['pending_deposit', 'pending_juno_withdrawal', 'pending_bridge_transfer', 'pending_blockchain_confirmation', 'completed', 'failed', 'pending'],
    default: 'pending'
  })
  status!: TransactionStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  amount_mxn!: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  amount_mxnb!: number;

  @Column({ nullable: true, unique: true })
  deposit_clabe!: string;

  @Column({ nullable: true })
  blockchain_tx_hash!: string;

  @Column({ nullable: true })
  juno_transaction_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
