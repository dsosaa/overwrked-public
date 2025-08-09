# Make.md Setup Checklist

Follow these steps inside Obsidian after installing Make.md:

## 1) Core toggles
- Enable: Slash menu
- Enable: Inline properties + Properties panel at top
- Enable: Page types + Page icons
- Enable views: Board, Table, Gallery
- Optional: Floating editor toolbar, Link cards

## 2) Page types
Add these types:
- note
- project
- task
- people
- resource

## 3) Property presets
Create these select fields globally:
- `status`: Backlog, Next, Doing, Blocked, Done
- `priority`: Low, Medium, High, Urgent
- `area`: Personal, Work, Learning, Health, Finance
- `effort`: 15m, 30m, 60m, 120m
And standard fields: `owner` (Text), `created` (Date), `updated` (Date), `due` (Date), `tags` (Tags)

## 4) Templates
Use the files in `Templates/`:
- Note Template.md → for general notes
- Project Template.md → for project notes

Recommended: Enable Obsidian's Core Templates plugin and set the Templates folder to `Templates/` so `{{date}}` and `{{title}}` work.

## 5) Folder defaults (suggested)
Apply these in Make.md's folder rules:
- Projects folder (or your existing `NSXO Projects/`):
  - Default view: Board
  - Group by: `status`
  - Card fields: `priority`, `due`, `owner`
  - New page template: Project Template.md
- Notes folder (`Notes/`):
  - Default view: Table
  - Columns: `type`, `tags`, `updated`
  - Sort: `updated` desc
  - New page template: Note Template.md
- People folder (optional):
  - Default view: Gallery
  - Card badges: `role`, `area`

## 6) Hotkeys (suggestions)
- Open Slash menu: `/`
- Toggle properties panel: Cmd+Shift+P (choose a free combo)
- Make: New page from template: Cmd+Alt+N
- Make: Switch view (Board/Table/Gallery): Cmd+Alt+V
- Make: Convert selection → Callout/Card: Cmd+Alt+C

## 7) Optional companion plugins
- Dataview: powers the `Home.md` tables
- QuickAdd or Templater: auto-update `updated` on save; smarter capture
- Periodic Notes + Calendar: daily/weekly notes
- Style Settings + Minimal/AnuPpuccin theme: nicer visuals

You're set. Open `Home.md` to view your dashboards, and start new pages using the templates.
