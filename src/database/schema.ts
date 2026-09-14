export const SCHEMA_VERSION = 1;

export const CREATE_SCHEMA_V1 = [
  `CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY NOT NULL,
    theme_key TEXT UNIQUE,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 50),
    description TEXT NOT NULL DEFAULT '',
    origin TEXT NOT NULL CHECK (origin IN ('built-in', 'custom')),
    plant_type_id TEXT NOT NULL,
    is_automatic INTEGER NOT NULL DEFAULT 0 CHECK (is_automatic IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS plants (
    id TEXT PRIMARY KEY NOT NULL,
    theme_id TEXT NOT NULL,
    plant_type_id TEXT NOT NULL,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 50),
    cycle_number INTEGER NOT NULL CHECK (cycle_number >= 1),
    is_automatic INTEGER NOT NULL DEFAULT 0 CHECK (is_automatic IN (0, 1)),
    status TEXT NOT NULL CHECK (status IN ('growing', 'withered', 'completed')),
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak BETWEEN 0 AND 21),
    total_waterings INTEGER NOT NULL DEFAULT 0 CHECK (total_waterings >= 0),
    last_watered_on TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE,
    UNIQUE (theme_id, cycle_number)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS one_active_plant_per_theme
    ON plants(theme_id)
    WHERE status IN ('growing', 'withered')`,
  `CREATE INDEX IF NOT EXISTS plants_by_theme
    ON plants(theme_id, cycle_number DESC)`,
  `CREATE TABLE IF NOT EXISTS gratitude_entries (
    id TEXT PRIMARY KEY NOT NULL,
    plant_id TEXT NOT NULL,
    theme_id TEXT NOT NULL,
    text TEXT NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 300),
    entry_date TEXT NOT NULL,
    streak_day INTEGER NOT NULL CHECK (streak_day BETWEEN 1 AND 21),
    created_at TEXT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE,
    UNIQUE (plant_id, entry_date)
  )`,
  `CREATE INDEX IF NOT EXISTS gratitude_by_date
    ON gratitude_entries(entry_date DESC, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS gratitude_by_theme
    ON gratitude_entries(theme_id, entry_date DESC)`,
  `CREATE TABLE IF NOT EXISTS mood_entries (
    id TEXT PRIMARY KEY NOT NULL,
    mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
    entry_date TEXT NOT NULL UNIQUE,
    note TEXT CHECK (note IS NULL OR length(note) <= 300),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS moods_by_date
    ON mood_entries(entry_date DESC)`,
  `CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL COLLATE NOCASE
      CHECK (length(trim(title)) BETWEEN 1 AND 100),
    origin TEXT NOT NULL CHECK (origin IN ('built-in', 'custom')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (title)
  )`,
  `CREATE TABLE IF NOT EXISTS challenge_completions (
    id TEXT PRIMARY KEY NOT NULL,
    challenge_id TEXT NOT NULL,
    completion_date TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE (challenge_id, completion_date)
  )`,
  `CREATE INDEX IF NOT EXISTS challenge_completions_by_date
    ON challenge_completions(completion_date DESC)`,
  `CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    theme_preference TEXT NOT NULL DEFAULT 'system'
      CHECK (theme_preference IN ('system', 'light', 'dark')),
    notifications_enabled INTEGER NOT NULL DEFAULT 0
      CHECK (notifications_enabled IN (0, 1)),
    notification_time TEXT NOT NULL DEFAULT '20:00'
      CHECK (
        length(notification_time) = 5
        AND substr(notification_time, 3, 1) = ':'
        AND CAST(substr(notification_time, 1, 2) AS INTEGER) BETWEEN 0 AND 23
        AND CAST(substr(notification_time, 4, 2) AS INTEGER) BETWEEN 0 AND 59
      ),
    onboarding_completed INTEGER NOT NULL DEFAULT 0
      CHECK (onboarding_completed IN (0, 1)),
    last_shown_challenge_id TEXT,
    language TEXT NOT NULL DEFAULT 'sr-Latn-ijekavian',
    FOREIGN KEY (last_shown_challenge_id)
      REFERENCES challenges(id) ON DELETE SET NULL
  )`,
] as const;
