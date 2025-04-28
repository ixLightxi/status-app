#!/bin/bash

# Create autostart directory if it doesn't exist
mkdir -p ~/.config/autostart

# Create desktop entry file
cat > ~/.config/autostart/status-app.desktop << EOL
[Desktop Entry]
Type=Application
Name=Status App
Exec=xdg-open "https://ixlightxi.github.io/status-app/"
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOL

chmod +x ~/.config/autostart/status-app.desktop

echo "Setup complete for Linux! The Status App will open automatically on startup."
