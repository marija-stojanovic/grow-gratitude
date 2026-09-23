import type {
  NitroSQLiteConnection,
  QueryResultRow,
} from 'react-native-nitro-sqlite';
import { getDatabase, initializeDatabase } from '../database/connection';

export async function database(): Promise<NitroSQLiteConnection> {
  await initializeDatabase();
  return getDatabase();
}

export function firstRow<Row extends QueryResultRow>(rows: {
  _array: Row[];
}): Row | null {
  return rows._array[0] ?? null;
}
