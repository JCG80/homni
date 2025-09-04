#!/bin/bash
set -e

# This script seeds test users for testing and development
echo "Seeding test users..."

# Setup environment variables with defaults for local development
SUPABASE_URL=${SUPABASE_URL:-http://localhost:54321}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU}

# Export so child processes can read them
export SUPABASE_URL
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_KEY"

echo "Using Supabase URL: $SUPABASE_URL"

# Run the TypeScript seed scripts
echo "Running TypeScript seedTestUsers script (profiles only)..."
npx ts-node scripts/seedTestUsers.ts

echo "Running TypeScript seedAuthUsers script (auth + profiles)..."
npx ts-node scripts/seedAuthUsers.ts

echo "Test users seeded successfully"
