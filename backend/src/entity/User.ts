import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ nullable: true })
  full_name!: string;

  @Column({ default: 'pending' })
  kyc_status!: string;

  @Column({ nullable: true })
  wallet_address!: string;

  @Column({ nullable: true, length: 18 })
  deposit_clabe?: string; // Juno-generated CLABE for deposits (pay-ins)

  @Column({ nullable: true, length: 18 })
  payout_clabe?: string; // User's real CLABE for payouts (withdrawals)

  @Column({ nullable: true, length: 64 })
  juno_bank_account_id?: string; // Juno UUID for payout bank account

  @Column({ default: false })
  email_verified!: boolean;

  @Column({ nullable: true })
  email_verification_token?: string;

  @Column({ nullable: true })
  password_reset_token?: string;

  @Column({ nullable: true })
  truora_process_id?: string;

  @Column({ nullable: true, type: 'timestamp' })
  password_reset_expires?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
