# Control Panel

Quick actions for publishing and backing up.

## Publish

```button
name Publish this note
type command
action GitHub Publisher: Share
```

```button
name Publish all shared notes
type command
action GitHub Publisher: Upload all shared notes
```

## Backup & Sync

```button
name Backup (commit + push)
type command
action Obsidian Git: Commit all changes and push
```

```button
name Pull latest
type command
action Obsidian Git: Pull
```

---

Tip: To make a note publishable, place it in `Public/` and add frontmatter:

```
---
share: true
---
```


