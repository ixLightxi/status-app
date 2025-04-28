# Get the path to the Windows Startup folder
$startupFolder = [Environment]::GetFolderPath('Startup')

# Copy the batch file to the Startup folder
Copy-Item "launch-status-app.bat" -Destination $startupFolder

Write-Host "Setup complete! The Status App will now open automatically when you start your computer."
Write-Host "The startup script has been placed in: $startupFolder"
