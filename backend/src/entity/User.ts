import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Ticket } from "./Ticket";
import { Notification } from "./Notification";

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

  @Column({ nullable: true })
  portal_client_id?: string; // Portal client ID for API calls

  @Column({ type: 'varchar', nullable: true })
  portal_share?: string; // Portal SDK share for wallet recovery



  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string; // Google ID for SSO

  @Column({ type: 'text', nullable: true })
  googleAccessToken: string;

  @Column({ type: 'text', nullable: true })
  googleRefreshToken: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  mxnb_balance!: number;

  @Column({ default: 'user' })
  role!: string; // user, admin, etc.

  @Column('varchar', { nullable: true, length: 18 })
  deposit_clabe?: string; // Juno-generated CLABE for deposits (pay-ins)

  @Column('varchar', { nullable: true, length: 18 })
  payout_clabe?: string; // User's real CLABE for payouts (withdrawals)

  @Column('varchar', { nullable: true, length: 36 })
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

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets!: Ticket[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];
}
