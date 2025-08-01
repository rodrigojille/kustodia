import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MultisigWalletConfig } from './MultisigWalletConfig';
import { MultisigApprovalRequest } from './MultisigApprovalRequest';

@Entity('multisig_transaction_log')
export class MultisigTransactionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  wallet_config_id: number;

  @ManyToOne(() => MultisigWalletConfig, config => config.transactionLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_config_id' })
  walletConfig: MultisigWalletConfig;

  @Column({ type: 'integer', nullable: true })
  approval_request_id: number;

  @ManyToOne(() => MultisigApprovalRequest, request => request.transactionLogs, { nullable: true })
  @JoinColumn({ name: 'approval_request_id' })
  approvalRequest: MultisigApprovalRequest;

  @Column({ type: 'varchar', length: 66, nullable: true })
  transaction_hash: string;

  @Column({ type: 'varchar', length: 66, nullable: true })
  safe_tx_hash: string;

  @Column({ type: 'bigint', nullable: true })
  block_number: number;

  @Column({ type: 'bigint', nullable: true })
  gas_used: number;

  @Column({ type: 'bigint', nullable: true })
  gas_price: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  executed_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
