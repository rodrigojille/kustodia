import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class JunoTransaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string; // deposit, payout, issuance, redemption

  @Column({ nullable: true })
  reference!: string;

  @Column("decimal", { precision: 18, scale: 2 })
  amount!: number;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ nullable: true })
  tx_hash!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
