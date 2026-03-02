import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import {todos} from "./schema"

let connection: Database.Database;
let db: BetterSQLite3Database<{todos: typeof todos}>;

export function getDatabase(): BetterSQLite3Database<{todos: typeof todos}> {
  if (!db) {
    const dbDir = path.dirname(path.resolve(config.dbPath));
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    connection = new Database(path.resolve(config.dbPath));

    // Enable WAL mode for better concurrent read performance
    connection.pragma('journal_mode = WAL');
    // Enable foreign keys
    connection.pragma('foreign_keys = ON');

    db = drizzle(connection, { schema: { todos } });
  }
  return db;
}

export function closeDatabase(): void {
  if (connection) {
    connection.close();
  }
}
