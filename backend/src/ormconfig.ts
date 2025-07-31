import { DataSource } from "typeorm";
import { User } from './entity/User';
import { Payment } from './entity/Payment';
import { PaymentEvent } from './entity/PaymentEvent';
import { Escrow } from './entity/Escrow';
import { Dispute } from './entity/Dispute';
import { DisputeMessage } from './entity/DisputeMessage';
import { Notification } from './entity/Notification';
import { EarlyAccessCounter } from './entity/EarlyAccessCounter';
import { JunoTransaction } from './entity/JunoTransaction';
import { Lead } from './entity/Lead';
import { Ticket } from './entity/Ticket';
import { TicketReply } from './entity/TicketReply';
import { Token } from './entity/Token';
import { WalletTransaction } from './entity/WalletTransaction';
import { CommissionRecipient } from './entity/CommissionRecipient';
import { Blacklist } from './entity/Blacklist';

const AppDataSource = new DataSource({
  name: "default",
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false, // Should be false in production, use migrations
  logging: true,
  entities: [
    User,
    Payment,
    PaymentEvent,
    Escrow,
    Dispute,
    DisputeMessage,
    Notification,
    EarlyAccessCounter,
    JunoTransaction,
    Lead,
    Ticket,
    TicketReply,
    Token,
    WalletTransaction,
    CommissionRecipient,
    Blacklist
  ],
  migrations: process.env.NODE_ENV === "production" ? ["dist/migration/**/*.js"] : ["src/migration/**/*.ts"],
  subscribers: ["dist/subscriber/**/*.js"],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
