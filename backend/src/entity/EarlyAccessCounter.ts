import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class EarlyAccessCounter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 100 })
  slots!: number;
}

export default EarlyAccessCounter;
