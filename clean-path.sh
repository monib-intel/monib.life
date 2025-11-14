#!/bin/bash

# Clean PATH Script - Remove Windows /mnt/c paths from WSL

echo "Current PATH:"
echo $PATH | tr ':' '\n'

echo ""
echo "Cleaning PATH to remove /mnt/c entries..."

# Create a new PATH excluding /mnt/c paths
NEW_PATH=""
IFS=':' read -ra ADDR <<< "$PATH"
for i in "${ADDR[@]}"; do
    if [[ ! "$i" =~ ^/mnt/c ]]; then
        if [ -z "$NEW_PATH" ]; then
            NEW_PATH="$i"
        else
            NEW_PATH="$NEW_PATH:$i"
        fi
    fi
done

# Set the new PATH
export PATH="$NEW_PATH"

echo "New PATH:"
echo $PATH | tr ':' '\n'

echo ""
echo "Testing node and npm availability:"
which node
which npm
node --version 2>/dev/null || echo "Node.js not found in PATH"
npm --version 2>/dev/null || echo "npm not found in PATH"

# Make the change permanent
echo ""
echo "Making PATH change permanent in ~/.zshrc..."

# Remove any existing PATH exports from .zshrc
grep -v "export PATH=" ~/.zshrc > /tmp/zshrc_clean 2>/dev/null || touch /tmp/zshrc_clean
mv /tmp/zshrc_clean ~/.zshrc

# Add the clean PATH
echo "# Clean PATH without Windows /mnt/c directories" >> ~/.zshrc
echo "export PATH=\"$NEW_PATH\"" >> ~/.zshrc

echo "PATH cleanup complete!"
echo "Restart your terminal or run 'source ~/.zshrc' to apply changes."