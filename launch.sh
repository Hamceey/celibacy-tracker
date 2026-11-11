#!/usr/bin/env bash
# Usage: ./launch.sh [widget|full]   (default: widget)
MODE="${1:-widget}"
DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
BROWSER=""
for b in chromium google-chrome-stable brave chromium-browser vivaldi-stable microsoft-edge-stable; do
  command -v "$b" >/dev/null 2>&1 && BROWSER="$b" && break
done
[ -z "$BROWSER" ] && { echo "Need a Chromium-based browser: sudo pacman -S chromium"; exit 1; }

FLAGS=(--user-data-dir="$HOME/.local/share/reset-tracker-profile" --no-first-run --no-default-browser-check)
# XWayland/X11 lets the widget position itself and stay on top
[ -n "$DISPLAY" ] && FLAGS+=(--ozone-platform=x11)

if [ "$MODE" = full ]; then
  exec "$BROWSER" "${FLAGS[@]}" --app="file://$DIR/index.html" --class=reset-tracker --window-size=440,740
fi

"$BROWSER" "${FLAGS[@]}" --app="file://$DIR/widget.html" --window-size=320,210 &
sleep 3
# Best effort (X11): always on top, on every desktop, slightly see-through
command -v wmctrl >/dev/null 2>&1 && wmctrl -r "Reset Widget" -b add,above,sticky
command -v xprop  >/dev/null 2>&1 && xprop -name "Reset Widget" -f _NET_WM_WINDOW_OPACITY 32c -set _NET_WM_WINDOW_OPACITY 0xE6666666
wait
