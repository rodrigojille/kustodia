import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

const isCompiled = __dirname.includes('dist');

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true, // set to false in production and use migrations
  logging: false,
  entities: [isCompiled ? "dist/entity/**/*.js" : "src/entity/**/*.ts"],
  migrations: [isCompiled ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
  subscribers: [isCompiled ? "dist/subscriber/**/*.js" : "src/subscriber/**/*.ts"],
});
