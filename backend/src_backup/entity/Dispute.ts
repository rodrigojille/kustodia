import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Escrow } from "./Escrow";
import { User } from "./User";

@Entity()
export class Dispute {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Escrow, { nullable: false })
  @JoinColumn({ name: "escrow_id" })
  escrow!: Escrow;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "raised_by" })
  raisedBy!: User;

  @Column({ nullable: false })
  reason!: string;

  @Column({ nullable: false })
  details!: string;

  @Column({ nullable: true })
  evidence_url?: string;

  @Column({ default: 'pending' })
  status!: string; // pending, resolved, dismissed

  @Column({ nullable: true })
  admin_notes?: string;

  @Column({ nullable: true })
  contract_dispute_raised_tx?: string;

  @Column({ nullable: true })
  contract_dispute_resolved_tx?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
