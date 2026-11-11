#!/usr/bin/env bash
# Installs menu entries + starts the widget automatically at login.
DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
chmod +x "$DIR/launch.sh"
mkdir -p ~/.local/share/applications ~/.config/autostart ~/.local/share/icons
cp "$DIR/icon.svg" ~/.local/share/icons/reset-tracker.svg
entry() { # name exec
cat <<EOT
[Desktop Entry]
Type=Application
Name=$1
Exec=$2
Icon=$HOME/.local/share/icons/reset-tracker.svg
Categories=Utility;
EOT
}
entry "30-Day Reset" "$DIR/launch.sh full" > ~/.local/share/applications/reset-tracker.desktop
entry "30-Day Reset Widget" "$DIR/launch.sh widget" > ~/.local/share/applications/reset-tracker-widget.desktop
entry "30-Day Reset Widget" "sh -c 'sleep 8 && $DIR/launch.sh widget'" > ~/.config/autostart/reset-tracker-widget.desktop
echo "Done. Widget starts at every login; both apps are in your launcher."
