#!/bin/bash

echo "🔧 Fixing database transaction issues..."

# Stop any potential locks
echo "Step 1: Checking for database locks..."
pkill -f "node.*next" || true
sleep 2

# Backup current database
echo "Step 2: Creating backup..."
if [ -f prisma/dev.db ]; then
    cp prisma/dev.db prisma/dev.db.backup
    echo "✓ Backup created: prisma/dev.db.backup"
fi

# Run Prisma generate to ensure client is up to date
echo "Step 3: Regenerating Prisma client..."
npx prisma generate

# Optional: Reset database if needed (uncomment if you want to start fresh)
# echo "Step 4: Resetting database..."
# npx prisma migrate reset --force
# npx tsx prisma/seed.ts

echo ""
echo "✅ Database fixed!"
echo ""
echo "Now restart your dev server:"
echo "  1. Stop the current server (Ctrl+C in terminal 1)"
echo "  2. Run: yarn dev"
echo ""

