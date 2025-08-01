import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { MultisigWalletConfig } from './MultisigWalletConfig';

@Entity('multisig_wallet_owners')
@Unique(['wallet_config_id', 'owner_address'])
export class MultisigWalletOwner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  wallet_config_id: number;

  @ManyToOne(() => MultisigWalletConfig, config => config.owners, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_config_id' })
  walletConfig: MultisigWalletConfig;

  @Column({ type: 'varchar', length: 42 })
  owner_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  owner_name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  added_at: Date;
}
