#!/usr/bin/env python3
import argparse
import os
import random
import sqlite3
import uuid
import wave
from datetime import datetime, timedelta, timezone
from pathlib import Path


TOPICS = [
    "Project planning and next milestones",
    "Customer interview insights and follow ups",
    "Daily reflection on focus and energy",
    "Bug triage notes and reproduction steps",
    "Architecture tradeoffs for offline sync",
    "Marketing ideas for launch week",
    "Retrospective notes from today's sprint",
    "Thoughts on product direction and scope",
]

SNIPPETS = [
    "Today I reviewed priorities and identified the highest risk to delivery.",
    "I captured action items that need to happen before the end of the week.",
    "The main blocker is dependency alignment across frontend and backend.",
    "I want to test this workflow with several realistic examples.",
    "Overall progress feels steady and the direction still makes sense.",
    "The next step is to validate assumptions with a small user test.",
    "I should simplify this flow so onboarding is easier to understand.",
    "I noticed a pattern in the feedback and it is worth exploring.",
]


def default_app_dir() -> Path:
    xdg_data_home = os.environ.get("XDG_DATA_HOME")
    if xdg_data_home:
        return Path(xdg_data_home) / "com.enticies.offline-audio-journal"
    return Path.home() / ".local/share/com.enticies.offline-audio-journal"


def ensure_schema(cursor: sqlite3.Cursor) -> None:
    cursor.executescript(
        """
        CREATE TABLE IF NOT EXISTS folders (
          id TEXT PRIMARY KEY,
          parent_id TEXT REFERENCES folders(id) ON DELETE RESTRICT,
          name TEXT NOT NULL,
          normalized_name TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_sibling_name
          ON folders(COALESCE(parent_id, ''), normalized_name);

        CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

        INSERT OR IGNORE INTO folders (id, parent_id, name, normalized_name, created_at, updated_at)
          VALUES ('root', NULL, 'Root', 'root', 0, 0);

        CREATE TABLE IF NOT EXISTS entries (
          id TEXT PRIMARY KEY,
          folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE RESTRICT,
          storage_path TEXT NOT NULL,
          display_name TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          duration_seconds REAL,
          title TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_entries_folder_id ON entries(folder_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_storage_path ON entries(storage_path);

        CREATE TABLE IF NOT EXISTS transcript_segments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
          segment_index INTEGER NOT NULL,
          start_ms INTEGER NOT NULL,
          end_ms INTEGER NOT NULL,
          text TEXT NOT NULL,
          UNIQUE(entry_id, segment_index)
        );

        CREATE INDEX IF NOT EXISTS idx_segments_entry_id ON transcript_segments(entry_id);
        CREATE INDEX IF NOT EXISTS idx_segments_timestamps ON transcript_segments(entry_id, start_ms, end_ms);

        CREATE TABLE IF NOT EXISTS transcript_overrides (
          entry_id TEXT PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          normalized_name TEXT NOT NULL UNIQUE,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS entry_tags (
          entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
          tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (entry_id, tag_id)
        );

        CREATE INDEX IF NOT EXISTS idx_entry_tags_entry_id ON entry_tags(entry_id);
        CREATE INDEX IF NOT EXISTS idx_entry_tags_tag_id ON entry_tags(tag_id);
        """
    )


def make_wav(path: Path, seconds: float, _seed: int) -> None:
    sample_rate = 8000
    sample_count = int(seconds * sample_rate)
    silence = b"\x00\x00" * sample_count

    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(silence)


def transcript_parts(rnd: random.Random, count: int) -> list[str]:
    selection_count = max(2, min(6, count))
    return rnd.sample(SNIPPETS, k=selection_count)


def find_or_create_folder(cursor: sqlite3.Cursor, parent_id: str, name: str, now: int) -> str:
    normalized = name.strip().lower()
    cursor.execute(
        "SELECT id FROM folders WHERE parent_id = ? AND normalized_name = ? LIMIT 1",
        (parent_id, normalized),
    )
    row = cursor.fetchone()
    if row:
        return row[0]

    folder_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO folders (id, parent_id, name, normalized_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (folder_id, parent_id, name, normalized, now, now),
    )
    return folder_id


def ensure_date_folder(cursor: sqlite3.Cursor, dt: datetime, now: int) -> str:
    year_name = f"{dt.year:04d}"
    month_name = f"{dt.month:02d}"
    day_name = f"{dt.day:02d}"

    year_id = find_or_create_folder(cursor, "root", year_name, now)
    month_id = find_or_create_folder(cursor, year_id, month_name, now)
    day_id = find_or_create_folder(cursor, month_id, day_name, now)
    return day_id


def seed_fake_entries(app_dir: Path, count: int, append: bool, seed: int) -> None:
    recordings_dir = app_dir / "recordings"
    db_path = app_dir / "journal.db"

    app_dir.mkdir(parents=True, exist_ok=True)
    recordings_dir.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    ensure_schema(cursor)

    if not append:
        cursor.execute("SELECT storage_path FROM entries WHERE title LIKE 'FAKE:%'")
        stale_files = [row[0] for row in cursor.fetchall()]

        cursor.execute("DELETE FROM entries WHERE title LIKE 'FAKE:%'")

        for storage_path in stale_files:
            fake_file = recordings_dir / storage_path
            if fake_file.exists() and fake_file.is_file():
                fake_file.unlink()

    base_now = datetime.now(timezone.utc)
    now_ts = int(base_now.timestamp())
    rnd = random.Random(seed)

    for i in range(count):
        entry_id = str(uuid.uuid4())
        created_at_dt = base_now - timedelta(hours=i * 6)
        created_at = int(created_at_dt.timestamp())

        folder_id = ensure_date_folder(cursor, created_at_dt, now_ts)

        duration_seconds = round(rnd.uniform(18.0, 140.0), 2)
        storage_path = f"{created_at_dt.year:04d}/{created_at_dt.month:02d}/{created_at_dt.day:02d}/{entry_id}_{created_at_dt.hour:02d}-{created_at_dt.minute:02d}-{created_at_dt.second:02d}.wav"
        display_name = f"{created_at_dt.year:04d}-{created_at_dt.month:02d}-{created_at_dt.day:02d}_{created_at_dt.hour:02d}-{created_at_dt.minute:02d}-{created_at_dt.second:02d}"

        file_dir = recordings_dir / f"{created_at_dt.year:04d}/{created_at_dt.month:02d}/{created_at_dt.day:02d}"
        file_dir.mkdir(parents=True, exist_ok=True)
        make_wav(recordings_dir / storage_path, duration_seconds, seed + i)

        title = f"FAKE: {rnd.choice(TOPICS)}"
        segments = transcript_parts(rnd, rnd.randint(3, 5))
        cursor.execute(
            "INSERT INTO entries (id, folder_id, storage_path, display_name, created_at, duration_seconds, title) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (entry_id, folder_id, storage_path, display_name, created_at, duration_seconds, title),
        )

        total_ms = int(duration_seconds * 1000)
        for segment_index, text in enumerate(segments):
            start_ms = int(segment_index * total_ms / len(segments))
            end_ms = int((segment_index + 1) * total_ms / len(segments))

            cursor.execute(
                "INSERT INTO transcript_segments (entry_id, segment_index, start_ms, end_ms, text) VALUES (?, ?, ?, ?, ?)",
                (entry_id, segment_index, start_ms, end_ms, text),
            )

    connection.commit()
    connection.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed fake audio recordings and transcripts for offline-audio-journal."
    )
    parser.add_argument(
        "--count",
        type=int,
        default=200,
        help="Number of fake entries to create (default: 200).",
    )
    parser.add_argument(
        "--append",
        action="store_true",
        help="Append fake data instead of replacing existing FAKE: entries.",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed for repeatable data.")
    parser.add_argument(
        "--app-dir",
        type=Path,
        default=default_app_dir(),
        help="Override app data directory.",
    )

    args = parser.parse_args()
    count = args.count

    if count < 1:
        raise SystemExit("count must be at least 1")

    seed_fake_entries(args.app_dir, count, args.append, args.seed)

    mode = "appended" if args.append else "replaced"
    print(
        f"Fake data {mode}: {count} entries in {args.app_dir / 'journal.db'} at {datetime.now().isoformat(timespec='seconds')}"
    )


if __name__ == "__main__":
    main()
