import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
}

export default Lead;
