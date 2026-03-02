import { migrate as drizzleMigrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDatabase } from './database';
import path from 'path';

export function migrate(): void {
  const db = getDatabase();
  drizzleMigrate(db, {
    migrationsFolder: path.resolve(__dirname, '../../drizzle'),
  });
  console.log('✅ Database migrated successfully');
}

// Run directly if called as a script
if (require.main === module) {
  migrate();
  process.exit(0);
}
