#!/bin/bash

# Auto-commit script that commits every 3 seconds
# Usage: ./auto-commit.sh

cd "$(dirname "$0")"

echo "🚀 Auto-commit script started..."
echo "📝 This script will commit changes every 3 seconds"
echo "⚠️  Press Ctrl+C to stop"
echo ""

while true; do
    # Check if there are any changes to commit
    if [[ -n $(git status --porcelain) ]]; then
        # Get list of modified/added files
        changed_files=$(git status --porcelain | awk '{print $2}')
        
        # Stage all changes
        git add .
        
        # Create commit message with all changed filenames
        commit_msg="feat: updated"
        for file in $changed_files; do
            commit_msg="$commit_msg $(basename $file)"
        done
        
        # Commit the changes
        git commit -m "$commit_msg"
        
        echo "✅ Committed at $(date '+%Y-%m-%d %H:%M:%S')"
    else
        echo "⏭️  No changes to commit at $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Wait for 3 seconds
    sleep 3
done

