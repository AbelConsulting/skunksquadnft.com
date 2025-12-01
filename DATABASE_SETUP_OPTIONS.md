# Database Setup Options

You have two options for the badge system database:

## Option 1: SQLite (Recommended for Quick Start)
- ✅ No installation required
- ✅ File-based database
- ✅ Works immediately
- ⚠️ Single-user access

## Option 2: PostgreSQL (Production Ready)
- Requires PostgreSQL installation
- Multi-user support
- Better for production

---

## Quick Start with SQLite

Since PostgreSQL is not installed, I'll set up SQLite instead:

### 1. Install SQLite package
```powershell
npm install sqlite3
```

### 2. Create database automatically
The server will create `skunksquad.db` on first run

### 3. Start server
```powershell
node networking-server-sqlite.js
```

---

## PostgreSQL Installation (Optional)

If you want to use PostgreSQL later:

### Windows Installation
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Remember your postgres password
4. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`

### Create Database
```powershell
# After installation
psql -U postgres
CREATE DATABASE skunksquad_networking;
\q
```

### Run Migration
```powershell
psql -U postgres -d skunksquad_networking -f backend/db/badges-schema.sql
```

---

## Next Steps

Would you like me to:
1. **Set up SQLite** (quick, works now) - Recommended ✅
2. **Help install PostgreSQL** (better for production)
3. **Use in-memory storage** (no database, just testing)
