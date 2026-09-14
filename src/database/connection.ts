import {
  open,
  type NitroSQLiteConnection,
} from 'react-native-nitro-sqlite';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'growgratitude.db';

let connection: NitroSQLiteConnection | null = null;
let initialization: Promise<void> | null = null;

export function getDatabase(): NitroSQLiteConnection {
  if (connection === null) {
    connection = open({
      name: DATABASE_NAME,
    });
  }

  return connection;
}

async function configureAndMigrateDatabase(): Promise<void> {
  const database = getDatabase();

  await database.executeAsync('PRAGMA foreign_keys = ON');
  await database.executeAsync('PRAGMA journal_mode = WAL');
  await runMigrations(database);
}

export function initializeDatabase(): Promise<void> {
  if (initialization === null) {
    initialization = configureAndMigrateDatabase().catch(error => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}
