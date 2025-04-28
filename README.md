# Status App Auto-Start Setup

This repository contains scripts to set up auto-start for the Status App on different operating systems.

## Windows Setup

1. Download `launch-status-app.bat` and `setup-autostart.ps1`
2. Right-click on `setup-autostart.ps1` and select "Run with PowerShell"
3. The script will automatically install the auto-start configuration

To remove auto-start:
1. Press Windows + R
2. Type "shell:startup"
3. Delete the "launch-status-app.bat" file

## macOS Setup

1. Download `setup-macos.sh`
2. Open Terminal
3. Navigate to the download directory
4. Run these commands:
   ```bash
   chmod +x setup-macos.sh
   ./setup-macos.sh
   ```

To remove auto-start:
```bash
launchctl unload ~/Library/LaunchAgents/com.statusapp.startup.plist
rm ~/Library/LaunchAgents/com.statusapp.startup.plist
```

## Linux Setup

1. Download `setup-linux.sh`
2. Open Terminal
3. Navigate to the download directory
4. Run these commands:
   ```bash
   chmod +x setup-linux.sh
   ./setup-linux.sh
   ```

To remove auto-start:
```bash
rm ~/.config/autostart/status-app.desktop
```

## About the Status App

The Status App will open automatically in your default browser when you start your computer. You can access it anytime at:

https://ixlightxi.github.io/status-app/

You can also create a new account using an @devinci.fr email address.

## Troubleshooting

If the app doesn't open automatically:

1. Check if your internet connection is working
2. Try accessing the URL manually: https://ixlightxi.github.io/status-app/
3. Make sure the startup script is properly installed for your operating system
4. Check if your browser's default settings haven't been changed
