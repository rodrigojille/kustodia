import { DataSource } from "typeorm";
import * as path from "path";


const isCompiled = __dirname.includes('dist');

import { Escrow } from "./entity/Escrow";
import { JunoTransaction } from "./entity/JunoTransaction";
import { Payment } from "./entity/Payment";
import { PaymentEvent } from "./entity/PaymentEvent";
import { User } from "./entity/User";
import { Ticket } from "./entity/Ticket";
import { TicketReply } from './entity/TicketReply';
import { Notification } from './entity/Notification';

const AppDataSource = new DataSource({
  name: "default",
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false, // Should be false in production, use migrations
  logging: true,
  entities: [
    User,
    Escrow,
    Payment,
    PaymentEvent,
    JunoTransaction,
    Ticket,
    TicketReply,
    Notification
  ],
  migrations: [isCompiled ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
  subscribers: [isCompiled ? "dist/subscriber/**/*.js" : "src/subscriber/**/*.ts"],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
