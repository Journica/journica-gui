# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Seed fake data

Generate artificial recordings and transcripts for local testing:

```bash
npm run seed:data
```

Default seed size is `200` entries.

Useful flags:

```bash
python3 scripts/seed_fake_data.py --count 50
python3 scripts/seed_fake_data.py --append
python3 scripts/seed_fake_data.py --app-dir /path/to/custom/app-data
```

By default this replaces only existing entries with titles starting with `FAKE:` and keeps real recordings untouched.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
