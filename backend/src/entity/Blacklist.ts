import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export enum BlacklistType {
  USER = 'user',
  WALLET_ADDRESS = 'wallet_address',
  EMAIL = 'email',
  IP_ADDRESS = 'ip_address'
}

export enum BlacklistReason {
  MONEY_LAUNDERING = 'money_laundering',
  FRAUD = 'fraud',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  REGULATORY_REQUEST = 'regulatory_request',
  SANCTIONS = 'sanctions',
  HIGH_RISK_JURISDICTION = 'high_risk_jurisdiction',
  MANUAL_REVIEW = 'manual_review',
  OTHER = 'other'
}

export enum BlacklistStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_REVIEW = 'under_review'
}

@Entity()
export class Blacklist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: BlacklistType
  })
  type!: BlacklistType;

  @Column()
  identifier!: string; // The actual value being blacklisted (email, wallet, etc.)

  @Column({
    type: 'enum',
    enum: BlacklistReason
  })
  reason!: BlacklistReason;

  @Column({
    type: 'enum',
    enum: BlacklistStatus,
    default: BlacklistStatus.ACTIVE
  })
  status!: BlacklistStatus;

  @Column({ type: 'text', nullable: true })
  description?: string; // Additional details about the blacklisting

  @Column({ nullable: true })
  reference_number?: string; // External reference (e.g., regulatory case number)

  @Column({ nullable: true })
  source?: string; // Source of the blacklist (e.g., 'OFAC', 'Internal', 'Law Enforcement')

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'added_by_user_id' })
  addedBy?: User;

  @Column({ nullable: true })
  added_by_user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy?: User;

  @Column({ nullable: true })
  reviewed_by_user_id?: number;

  @Column({ type: 'timestamp', nullable: true })
  review_date?: Date;

  @Column({ type: 'text', nullable: true })
  review_notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date?: Date; // Optional expiry for temporary blacklists

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Helper methods
  isExpired(): boolean {
    if (!this.expiry_date) return false;
    return new Date() > this.expiry_date;
  }

  isActive(): boolean {
    return this.status === BlacklistStatus.ACTIVE && !this.isExpired();
  }
}
