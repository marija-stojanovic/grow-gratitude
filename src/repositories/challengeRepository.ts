import type { Challenge, ChallengeCompletion } from '../types';
import {
  mapChallengeCompletionRow,
  mapChallengeRow,
  type ChallengeCompletionRow,
  type ChallengeRow,
} from '../database/rowMappers';
import { database, firstRow } from './repositoryHelpers';

export const challengeRepository = {
  async findAll(): Promise<Challenge[]> {
    const db = await database();
    const result = await db.executeAsync<ChallengeRow>(
      'SELECT * FROM challenges ORDER BY origin ASC, created_at ASC',
    );
    return result.rows._array.map(mapChallengeRow);
  },

  async findActive(): Promise<Challenge[]> {
    const db = await database();
    const result = await db.executeAsync<ChallengeRow>(
      'SELECT * FROM challenges WHERE is_active = 1 ORDER BY created_at ASC',
    );
    return result.rows._array.map(mapChallengeRow);
  },

  async findById(id: string): Promise<Challenge | null> {
    const db = await database();
    const result = await db.executeAsync<ChallengeRow>(
      'SELECT * FROM challenges WHERE id = ? LIMIT 1',
      [id],
    );
    const row = firstRow(result.rows);
    return row ? mapChallengeRow(row) : null;
  },

  async findByTitle(title: string): Promise<Challenge | null> {
    const db = await database();
    const result = await db.executeAsync<ChallengeRow>(
      'SELECT * FROM challenges WHERE title = ? COLLATE NOCASE LIMIT 1',
      [title.trim()],
    );
    const row = firstRow(result.rows);
    return row ? mapChallengeRow(row) : null;
  },

  async create(challenge: Challenge): Promise<void> {
    const db = await database();
    await db.executeAsync(
      `INSERT INTO challenges (
        id, title, origin, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        challenge.id,
        challenge.title,
        challenge.origin,
        challenge.isActive,
        challenge.createdAt,
        challenge.updatedAt,
      ],
    );
  },

  async updateCustom(
    id: string,
    title: string,
    updatedAt: string,
  ): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync(
      `UPDATE challenges SET title = ?, updated_at = ?
       WHERE id = ? AND origin = 'custom'`,
      [title.trim(), updatedAt, id],
    );
    return (result.rowsAffected ?? 0) > 0;
  },

  async setActive(
    id: string,
    isActive: boolean,
    updatedAt: string,
  ): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync(
      `UPDATE challenges SET is_active = ?, updated_at = ?
       WHERE id = ? AND (
         ? = 1 OR EXISTS (
           SELECT 1 FROM challenges
           WHERE id <> ? AND is_active = 1
         )
       )`,
      [isActive, updatedAt, id, isActive, id],
    );
    return (result.rowsAffected ?? 0) > 0;
  },

  async deleteCustom(id: string): Promise<boolean> {
    const db = await database();
    const result = await db.executeAsync(
      "DELETE FROM challenges WHERE id = ? AND origin = 'custom'",
      [id],
    );
    return (result.rowsAffected ?? 0) > 0;
  },

  async addCompletion(completion: ChallengeCompletion): Promise<void> {
    const db = await database();
    await db.executeAsync(
      `INSERT INTO challenge_completions (
        id, challenge_id, completion_date, completed_at
      ) VALUES (?, ?, ?, ?)`,
      [
        completion.id,
        completion.challengeId,
        completion.completionDate,
        completion.completedAt,
      ],
    );
  },

  async findCompletionByDate(
    challengeId: string,
    completionDate: string,
  ): Promise<ChallengeCompletion | null> {
    const db = await database();
    const result = await db.executeAsync<ChallengeCompletionRow>(
      `SELECT * FROM challenge_completions
       WHERE challenge_id = ? AND completion_date = ? LIMIT 1`,
      [challengeId, completionDate],
    );
    const row = firstRow(result.rows);
    return row ? mapChallengeCompletionRow(row) : null;
  },

  async findAllCompletions(): Promise<ChallengeCompletion[]> {
    const db = await database();
    const result = await db.executeAsync<ChallengeCompletionRow>(
      `SELECT * FROM challenge_completions
       ORDER BY completion_date DESC, completed_at DESC`,
    );
    return result.rows._array.map(mapChallengeCompletionRow);
  },

  async findCompletions(challengeId: string): Promise<ChallengeCompletion[]> {
    const db = await database();
    const result = await db.executeAsync<ChallengeCompletionRow>(
      `SELECT * FROM challenge_completions
       WHERE challenge_id = ? ORDER BY completion_date DESC`,
      [challengeId],
    );
    return result.rows._array.map(mapChallengeCompletionRow);
  },
};
