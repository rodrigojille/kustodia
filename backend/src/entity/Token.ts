import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 42 })
  address!: string;

  @Column({ length: 64, nullable: true })
  symbol?: string;

  @Column({ length: 255, nullable: true })
  name?: string;
}
