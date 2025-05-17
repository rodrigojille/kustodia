import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

const isCompiled = __dirname.includes('dist');

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, // Use this for Heroku!
  synchronize: true, // set to false in production and use migrations
  logging: false,
  entities: [isCompiled ? "dist/entity/**/*.js" : "src/entity/**/*.ts"],
  migrations: [isCompiled ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
  subscribers: [isCompiled ? "dist/subscriber/**/*.js" : "src/subscriber/**/*.ts"],
});
