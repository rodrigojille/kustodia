import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { MultisigWalletConfig } from './MultisigWalletConfig';
import { User } from './User';

@Entity('multisig_approval_requests')
export class MultisigApprovalRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  wallet_config_id: number;

  @ManyToOne(() => MultisigWalletConfig, config => config.approvalRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_config_id' })
  walletConfig: MultisigWalletConfig;

  @Column({ type: 'varchar', length: 66, nullable: true })
  transaction_hash: string;

  @Column({ type: 'varchar', length: 66, nullable: true })
  safe_tx_hash: string;

  @Column({ type: 'varchar', length: 42 })
  to_address: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  value: number;

  @Column({ type: 'text', nullable: true })
  data: string;

  @Column({ type: 'integer', default: 0 })
  operation: number;

  @Column({ type: 'bigint', default: 0 })
  safe_tx_gas: number;

  @Column({ type: 'bigint', default: 0 })
  base_gas: number;

  @Column({ type: 'bigint', default: 0 })
  gas_price: number;

  @Column({ type: 'varchar', length: 42, nullable: true })
  gas_token: string;

  @Column({ type: 'varchar', length: 42, nullable: true })
  refund_receiver: string;

  @Column({ type: 'integer' })
  nonce: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'integer', nullable: true })
  created_by: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => require('./MultisigSignature').MultisigSignature, (signature: any) => signature.approvalRequest)
  signatures: any[];

  @OneToMany(() => require('./MultisigTransactionLog').MultisigTransactionLog, (log: any) => log.approvalRequest)
  transactionLogs: any[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
