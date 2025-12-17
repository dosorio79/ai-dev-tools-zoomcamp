# AI Dev Tools Zoomcamp 
## Django TODO Application

This folder contains my submission for **Module 1** of the AI Dev Tools Zoomcamp (2025 cohort).

The goal was to build a fully working **TODO web application in Django**, using AI tools throughout the development workflow.

> **Note:** This version now acts as the baseline that **Module 4** coding agent will extend and modify.

<img src="docs/screenshot.png" style="max-width: 50%; height: auto;">
---

## Features

- Add TODO items
- Edit TODO items
- Delete TODO items
- Mark items as complete/incomplete
- Assign due dates
- Highlight overdue tasks in red
- Clean TailwindCSS UI
- Full Django test suite
- Makefile for common commands

---

## Tech Stack

- Python 3.11 (pyenv)
- Django 5.2.8
- uv for environment and package management
- TailwindCSS (CDN)
- WSL2 + VS Code
- SQLite

---

## Project Structure

```
01-todo/
    ├── manage.py
    ├── makefile
    ├── db.sqlite3
    ├── todo/
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    └── todoapp/
        ├── models.py
        ├── views.py
        ├── urls.py
        ├── tests.py
        └── templates/
            └── todoapp/
                ├── base.html
                ├── home.html
                └── edit.html
```

---

## Installation & Setup

From inside the `01-todo` directory:

### 1. Install environment and dependencies
```
make install
```

### 2. Run migrations
```
make migrate
```

### 3. Start the development server
```
make run
```

App runs at:

http://localhost:8010/

---

## Running Tests

```
make test
```

or:

```
python manage.py test
```

Tests cover:

- Listing todos
- Creating todos
- Editing todos
- Toggling completion
- Deleting todos
- Overdue context variable

---
## Notes
The project uses SQLite by default (db.sqlite3).
If you want to start from scratch, simply delete this file before running migrations.

The Django admin panel is available at:
http://localhost:8010/admin/

To create an admin user:~
```
make superuser
```
---
