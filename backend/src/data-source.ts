import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { Escrow } from "./entity/Escrow";
import { Payment } from "./entity/Payment";
import { PaymentEvent } from "./entity/PaymentEvent";
import { Dispute } from "./entity/Dispute";
import { User } from "./entity/User";
import { JunoTransaction } from "./entity/JunoTransaction";
import { Lead } from "./entity/Lead";
import EarlyAccessCounter from "./entity/EarlyAccessCounter";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres", // Cambia a tu tipo de base de datos si usas otro
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Escrow, Payment, PaymentEvent, Dispute, User, JunoTransaction, Lead, EarlyAccessCounter],
  synchronize: false,
  logging: false,
});
