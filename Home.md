---
type: dashboard
tags: [home, dashboard]
created: 2025-01-27
updated: 2025-01-27
---

# <lucide-home></lucide-home> Overwrked Vault Home

## <lucide-rocket></lucide-rocket> Quick Start Guide

- Use the Slash menu ("/") to insert blocks
- **New project notes:** Use the [[Templates/Project Template|Project Template]] (see [[Templates]] folder)
- **New regular notes:** Use the [[Templates/Note Template|Note Template]]
- **Tip:** Enable the Dataview plugin for the sections below to render properly

> [!tip] <lucide-lightbulb></lucide-lightbulb> Pro Tip
> Keep your `updated` field current in project files so the dashboard stays accurate!

## <lucide-folder></lucide-folder> My Projects
```dataview
TABLE priority, status, due, owner
WHERE type = "project"
SORT status asc, due asc, priority desc
```

## <lucide-clock></lucide-clock> Due in Next 7 Days
```dataview
TABLE status, priority, due
WHERE type = "project" AND due >= date(today) AND due <= date(today) + dur(7 days)
SORT due asc, priority desc
```

## <lucide-alert-triangle></lucide-alert-triangle> Overdue
```dataview
TABLE status, priority, due
WHERE type = "project" AND due < date(today)
SORT due asc
```

## <lucide-edit></lucide-edit> Recently Updated Notes
```dataview
TABLE updated, tags
WHERE type = "note"
SORT updated desc
LIMIT 10
```

## <lucide-users></lucide-users> People
```dataview
TABLE role, area
WHERE type = "people"
SORT file.name asc
```

## <lucide-calendar-days></lucide-calendar-days> Daily Notes

```dataview
TABLE WITHOUT ID file.link as "Date", created as "Created"
WHERE type = "daily"
SORT created desc
LIMIT 7
```

## <lucide-list-checks></lucide-list-checks> Recent Tasks

```dataview
TABLE WITHOUT ID file.link as "Note", status as "Status"
WHERE type = "todo"
SORT updated desc
LIMIT 5
```

## <lucide-trending-up></lucide-trending-up> Project Progress

```dataview
TABLE WITHOUT ID file.link as "Project", status, priority, 
  choice(due != null, due, "No deadline") as "Due Date"
WHERE type = "project" AND status != "Completed"
SORT priority desc, due asc
```

---

## <lucide-info></lucide-info> Tips & Best Practices

> [!note] <lucide-database></lucide-database> Standard Properties
> Use these consistent properties across your vault:
> - `type`, `status`, `priority`, `due`, `owner`, `updated`

> [!tip] <lucide-refresh-cw></lucide-refresh-cw> Keep Updated
> Update the `updated` field when modifying notes so tables sort correctly

> [!info] <lucide-eye></lucide-eye> Visual Organization
> - Use page icons and link cards in Make.md for quick scanning
> - Consistent tagging helps with organization and search
> - Leverage Dataview queries for automated organization

## <lucide-link></lucide-link> Quick Links

- [[Templates/Note Template|<lucide-file-text></lucide-file-text> Note Template]]
- [[Templates/Project Template|<lucide-briefcase></lucide-briefcase> Project Template]]
- [[Vault_Organization_Summary|<lucide-file-bar-chart></lucide-file-bar-chart> Organization Summary]]


