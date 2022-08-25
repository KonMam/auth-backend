import { DataSource } from "typeorm";
import dotenv from 'dotenv'

dotenv.config();

export const appDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: parseInt(process.env.PORT!),
    username: process.env.USER_NAME,
    password: process.env.PWD,
    database: process.env.DB_NAME,
    entities: ["src/entities/*.ts"],
    synchronize: true,
    logging: true,
})