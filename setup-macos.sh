#!/bin/bash

# Create launch agent directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Create plist file for auto-launch
cat > ~/Library/LaunchAgents/com.statusapp.startup.plist << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.statusapp.startup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/open</string>
        <string>https://ixlightxi.github.io/status-app/</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOL

# Load the launch agent
launchctl load ~/Library/LaunchAgents/com.statusapp.startup.plist

echo "Setup complete for macOS! The Status App will open automatically on startup."
