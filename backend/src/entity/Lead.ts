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

  @Column({ length: 100, nullable: true })
  empresa?: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({ length: 50, nullable: true })
  vertical?: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ default: false })
  invited!: boolean;

  @ManyToOne(() => EarlyAccessCounter)
  @JoinColumn({ name: 'early_access_counter_id' })
  earlyAccessCounter?: EarlyAccessCounter;
}

export default Lead;
