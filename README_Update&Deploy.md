# LRS Kanban (4ga Boards)

## Oracle Cloud Deployment & Operations Runbook

This document explains how to connect to the Oracle VM, back up the PostgreSQL database, update the 4ga Boards (Planka fork) Kanban instance, and recover safely if anything breaks.

This README is intended to be the **single source of truth** for running and maintaining the LRS Kanban board.

---

## 1. Server Access (Oracle Cloud)

### SSH into the Oracle VM

From your local machine:

```bash
ssh -i "~/.ssh/planka-key.pem.key" ubuntu@<ORACLE_PUBLIC_IP>
```

Example:

```bash
ssh -i "~/.ssh/planka-key.pem.key" ubuntu@192.18.146.194
```

---

## 2. Project Structure

```
~/lrs_kanban/
├─ Caddyfile
├─ docker-compose.yml        # Reverse proxy
├─ backups/                  # Database backups
└─ app/                      # 4ga Boards git repository
   ├─ docker-compose.yml     # Main application stack
   ├─ server/
   ├─ client/
   └─ ...
```

⚠️ **Important**
- Only `~/lrs_kanban/app` is a git repository
- All `git` commands must be run from inside the `app` directory

---

## 3. GitHub Authentication

SSH authentication is required and confirmed working.

```bash
ssh -T git@github.com
```

Expected output:

```
Hi LucidRainStudios! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 4. Environment Overview

### Application URL

```
BASE_URL=http://<ORACLE_PUBLIC_IP>/
```

### PostgreSQL

- Container: `app-db-1`
- Image: `postgres:16-alpine`
- Port: `5432`
- Docker volume: `app_db-data`

### Database Connection

Defined in Docker Compose:

```
postgresql://planka:<PASSWORD>@postgres:5432/planka
```

### Default Admin User

```
DEFAULT_ADMIN_EMAIL=admin@lucidrainstudios.com
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_NAME=Lucid Rain Admin
DEFAULT_ADMIN_PASSWORD=********
```

⚠️ Passwords should ideally be stored in secrets, not committed files.

---

## 5. Database Backups (Always Do This First)

**Always back up the database before updating or rebuilding containers.**

### Step 1. Move to project root

```bash
cd ~/lrs_kanban
```

### Step 2. Ensure backup directory exists

```bash
mkdir -p backups
```

### Step 3. Create a compressed backup

```bash
docker exec -t app-db-1 \
pg_dump -U postgres -d planka | gzip > backups/4gaboards_$(date +%F_%H%M).sql.gz
```

### Step 4. Verify backup

```bash
ls -lh backups
```

You should see a `.sql.gz` file with non-zero size.

---

## 6. Updating 4ga Boards

### Step 1. Enter the app repository

```bash
cd ~/lrs_kanban/app
```

### Step 2. Pull latest code

```bash
git fetch
git pull
```

Ensure the update fast-forwards with no conflicts.

---

### Step 3. Pull updated Docker images

```bash
docker compose pull
```

---

### Step 4. Rebuild and restart services

```bash
docker compose up -d --build
```

---

### Step 5. Verify services

```bash
docker compose ps
```

Expected:
- `app-db-1` → healthy
- `app-4gaBoards-1` → running

---

## 7. Health Checks & Debugging

### View logs

```bash
docker compose logs --tail=200
```

### Local HTTP check

```bash
curl -I http://localhost:1337
```

---

## 8. Database Restore (Emergency)

⚠️ This overwrites current data.

```bash
gunzip -c backups/4gaboards_YYYY-MM-DD_HHMM.sql.gz | \
docker exec -i app-db-1 psql -U postgres -d planka
```

---

## 9. Clean Restart (No Data Loss)

```bash
docker compose down
docker compose up -d --build
```

🚫 **Do NOT use `-v` unless you intend to delete all data.**

---

## 10. One-Command Update Cheat Sheet

```bash
cd ~/lrs_kanban
docker exec -t app-db-1 pg_dump -U postgres -d planka | gzip > backups/4gaboards_$(date +%F_%H%M).sql.gz
cd app
git pull
docker compose pull
docker compose up -d --build
```

---

## 11. Known Gotchas

- `.env` does not exist at repo root, config is injected via Docker Compose
- Only `app/` is a git repository
- SSH deploy keys avoid passphrase issues
- Docker volumes persist database data
- `docker compose down -v` = total data loss

---

## 12. Current Status

- GitHub SSH authenticated
- Database backups working
- Containers healthy
- Board accessible externally

---

This README should be kept up to date whenever deployment details change.

