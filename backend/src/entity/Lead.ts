import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import EarlyAccessCounter from './EarlyAccessCounter';

@Entity()
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 120 })
  email!: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ default: false })
  invited!: boolean;

  @ManyToOne(() => EarlyAccessCounter)
  @JoinColumn({ name: 'early_access_counter_id' })
  earlyAccessCounter?: EarlyAccessCounter;
}

export default Lead;
