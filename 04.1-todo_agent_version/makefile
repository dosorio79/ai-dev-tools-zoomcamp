# ===== Django TODO App Makefile =====

# Use uv's Python runner
PYTHON := uv run python
MANAGE := $(PYTHON) manage.py

# Default port (can be overridden: make run PORT=8877)
PORT ?= 8010


# ----- Dependencies -----

install:
	uv venv
	uv sync


# ----- Database / Migrations -----

migrations:
	$(MANAGE) makemigrations

migrate:
	$(MANAGE) migrate

# Optional combined command
migrate-all: migrations migrate


# ----- Run Development Server -----

run:
	$(MANAGE) runserver 0.0.0.0:$(PORT)


# ----- Testing -----

test:
	$(MANAGE) test


# ----- Admin / Users -----

superuser:
	$(MANAGE) createsuperuser


# ----- Cleanup -----

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete


# ----- Utilities -----

shell:
	$(MANAGE) shell

show-urls:
	$(MANAGE) show_urls


# ----- Help -----

help:
	@echo ""
	@echo "Django TODO App — Available Commands"
	@echo ""
	@echo "  make install        Install dependencies"
	@echo "  make migrations     Create migrations"
	@echo "  make migrate        Apply migrations"
	@echo "  make migrate-all    Create + apply migrations"
	@echo "  make run            Run development server (default PORT=8010)"
	@echo "  make test           Run tests"
	@echo "  make superuser      Create Django admin user"
	@echo "  make clean          Remove cache files"
	@echo "  make shell          Start Django shell"
	@echo ""
