# 30-Day Reset Tracker

A minimalist, offline personal discipline tracker for Linux. It tracks a 30-day (configurable) reset with a daily commitments checklist, and includes a small always-visible desktop widget.

No server, no account, no internet. Plain HTML, CSS and vanilla JavaScript.

## Features

- Automatic day counter based on calendar dates (no timezone or hour-based errors)
- Segmented progress bar with percentage elapsed and days remaining
- Six daily commitments with custom checkboxes; checklist resets each new day
- Save or clear today's check-in; previous days are never deleted
- Daily history with completion count and percentage; click any day (or any progress dot) to inspect it
- Configurable start date and target length; "Start a new reset" keeps history
- Completed state when the target is reached (never auto-restarts)
- JSON export / import backup
- Corner widget: title, current day, days remaining and progress; click to open the full tracker, minimize to a small pill
- Autostart at login

An incomplete day is not treated as a failure; commitments are tracked independently.

## Requirements

- Linux with a Chromium-based browser (Chromium, Chrome, Brave, Vivaldi, Edge)
  - Arch / EndeavourOS: `sudo pacman -S chromium`
- Optional, for always-on-top and transparency on X11/XWayland: `sudo pacman -S wmctrl xorg-xprop`

## Quick start

```bash
git clone <your-repo-url> reset-tracker
cd reset-tracker
./install.sh          # menu icons + autostart at login
./launch.sh widget    # start the corner widget now
./launch.sh full      # open the full tracker window
```

You can also just open `index.html` in any browser.

## Usage

| Action | How |
| --- | --- |
| Open the full tracker | Click the widget card, or launch "30-Day Reset" |
| Minimize the widget | Click `–`; click the pill to expand |
| Inspect a past day | Click its progress dot, or its row in Daily history |
| Change start date / length | Reset settings, then Apply settings |
| Back up your data | Export backup (downloads JSON) |
| Restore | Import backup |

## Configuration

- **Widget corner:** edit `CORNER` at the top of `widget.js` (`'right'` or `'left'`).
- **Widget size:** edit `SIZES` in `widget.js`, and `--window-size` in `launch.sh`.
- **Commitments:** edit the `ITEMS` array in `app.js`. Keep six items, or update the import validation.
- **Transparency:** change `0xE6666666` in `launch.sh` (about 90% opacity).

## Project structure

```text
reset-tracker/
├── index.html     full tracker UI
├── styles.css     tracker styles
├── app.js         tracker logic, storage, backup
├── widget.html    corner widget
├── widget.js      widget logic, minimize, positioning
├── launch.sh      launches the widget or the full window
├── install.sh     menu entries and autostart
├── icon.svg       app icon
└── README.md
```

## Data and privacy

Data is stored in `localStorage` (key `resetTracker.v1`) inside a dedicated browser profile at `~/.local/share/reset-tracker-profile`. Nothing leaves your machine. Export backups regularly; deleting the profile deletes the data.

Backup format:

```json
{ "startDate": "2026-11-11", "target": 30,
  "records": { "2026-11-11": { "items": [true, true, true, true, true, true], "savedAt": "..." } } }
```

## Uninstall

```bash
rm ~/.config/autostart/reset-tracker-widget.desktop \
   ~/.local/share/applications/reset-tracker*.desktop \
   ~/.local/share/icons/reset-tracker.svg
rm -rf ~/.local/share/reset-tracker-profile   # also deletes your data
```

## Troubleshooting

- **Widget not in the corner / not on top:** Wayland ignores window positioning and stacking. The launcher forces XWayland when available; otherwise use your desktop's window rules for the title `Reset Widget`.
- **Nothing launches:** no Chromium-based browser found; install one.
- **Pill larger than expected:** Chromium enforces a minimum window size.
- **Data missing:** the browser profile path changed or was deleted; import a backup.

## Roadmap

Daily notes, urge tracking, work-hour tracking, weekly summaries, streaks and milestones, desktop notifications, optional password protection.

## License

MIT. See `LICENSE`.
