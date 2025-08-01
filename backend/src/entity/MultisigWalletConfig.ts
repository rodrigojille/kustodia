import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('multisig_wallet_config')
export class MultisigWalletConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 42, unique: true })
  wallet_address: string;

  @Column({ type: 'integer', default: 2 })
  threshold: number;

  @Column({ type: 'integer', default: 3 })
  owner_count: number;

  @Column({ type: 'varchar', length: 50, default: 'arbitrum' })
  network: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'integer', nullable: true })
  created_by: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => require('./MultisigWalletOwner').MultisigWalletOwner, (owner: any) => owner.walletConfig)
  owners: any[];

  @OneToMany(() => require('./MultisigApprovalRequest').MultisigApprovalRequest, (request: any) => request.walletConfig)
  approvalRequests: any[];

  @OneToMany(() => require('./MultisigTransactionLog').MultisigTransactionLog, (log: any) => log.walletConfig)
  transactionLogs: any[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
