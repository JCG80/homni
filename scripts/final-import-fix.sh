#!/bin/bash
# Final import fix - Replace all useToast and leads imports

echo "🔧 Running final import fixes..."

# Fix useToast imports
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/hooks/use-toast|@/components/ui/use-toast|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|./use-toast|@/components/ui/use-toast|g'

# Fix leads type imports  
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/types/leads"|@/types/leads-canonical"|g'

echo "✅ Fixed all imports across codebase"