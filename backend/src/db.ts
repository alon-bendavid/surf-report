import { DataSource } from "typeorm";
// import Ad from "./entities/Ad";
// import Category from "./entities/Category";
// import Tag from "./entities/Tag";
import env from "./env";
import User from "./entities/User";
import Job from "./entities/Job";
// import Job from "./entities/Job";

const db = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  entities: [User, Job],
  synchronize: true,
  logging: env.NODE_ENV !== "test",
});

export async function clearDB() {
  const entities = db.entityMetadatas;
  const tableNames = entities
    .map((entity) => `"${entity.tableName}"`)
    .join(", ");
  await db.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
}

export default db;
