
#!/bin/bash

# Exit on error
set -e

# Get project ID from environment or prompt user
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Enter your Supabase project ID:"
  read SUPABASE_PROJECT_ID
fi

# Regenerate types
echo "Regenerating Supabase types..."
npx supabase gen types typescript \
  --project-id $SUPABASE_PROJECT_ID \
  --schema public \
  > src/integrations/supabase/types.ts

echo "Types generated successfully at src/integrations/supabase/types.ts"
