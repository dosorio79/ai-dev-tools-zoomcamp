YouTube → DuckDB Airflow DAG
=============================

This repository contains an Apache Airflow 3.x DAG that searches YouTube for videos on a given topic and ingests metadata and transcripts into a local DuckDB database.

Quick setup
-----------

1. Create and activate a Python virtual environment, then install dependencies.

If you use `uv` (repo includes `uv.lock`) prefer installing exact pinned dependencies from the lockfile:

```bash
# create venv
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip

# install uv CLI (if not installed)
pip install uv

# sync/install pinned deps from uv.lock into the active venv
uv sync
```

If you don't use `uv`, install the main runtime packages directly:

```bash
pip install apache-airflow==3.* yt-dlp google-api-python-client youtube-transcript-api duckdb requests
```

2. Initialize Airflow (if not already):

```bash
export AIRFLOW_HOME=$(pwd)/airflow_home
airflow db init
airflow users create --username admin --password <password> --firstname Admin --lastname User --role Admin --email admin@example.com
```

3. (Optional) Add YouTube API key in an Airflow connection `youtube_api` to use the YouTube Data API v3 (preferred):

```bash
# Put API key in the connection password
airflow connections add 'youtube_api' --conn-type 'http' --conn-password '<YOUR_API_KEY>'
# Or add as extras JSON
airflow connections add 'youtube_api' --conn-type 'http' --conn-extra '{"api_key":"<YOUR_API_KEY>"}'
```

Running the DAG
---------------

The DAG is manual-trigger only and expects the search `topic` to be supplied as a dag-run configuration (or you may set `YOUTUBE_SEARCH_TOPIC` env var). Example manual trigger:

```bash
airflow dags trigger -c '{"topic":"python tutorial","max_results":3}' youtube_to_duckdb
```

If you trigger from the Web UI, paste the same JSON into the "JSON Configuration" box.

Inspecting results
------------------

The pipeline writes a DuckDB file (default `/tmp/youtube_data.duckdb` or override with `duckdb_path` in dag-run conf). Query it with the `duckdb` CLI:

```bash
duckdb /tmp/youtube_data.duckdb "SELECT video_id, title, published_at FROM youtube_videos LIMIT 10;"
```

Notes
-----
- The DAG reads the YouTube API key from the Airflow Connection `youtube_api` (password or extras.api_key) or falls back to `yt-dlp` if no key is configured.
- Published dates and ingestion timestamps are normalized to `YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS` before inserting into DuckDB.
- There's a backfill task that normalizes malformed `published_at` fields already present in the DB.

If you'd like, I can add a small unit-test skeleton or add the optional dependencies as extras in `pyproject.toml`.
