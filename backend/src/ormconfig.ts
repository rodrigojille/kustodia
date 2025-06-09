import { DataSource } from "typeorm";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("[DEBUG] DATABASE_URL:", process.env.DATABASE_URL);

const isCompiled = __dirname.includes('dist');

import { JunoTransaction } from "./entity/JunoTransaction";
import { Payment } from "./entity/Payment";
import { User } from "./entity/User";
import { Escrow } from "./entity/Escrow";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, // Use this for Heroku!
  synchronize: true, // set to false in production and use migrations
  logging: false,
  entities: [
    JunoTransaction,
    Payment,
    User,
    Escrow,
    isCompiled ? "dist/entity/**/*.js" : "src/entity/**/*.ts"
  ],
  migrations: [isCompiled ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
  subscribers: [isCompiled ? "dist/subscriber/**/*.js" : "src/subscriber/**/*.ts"],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
