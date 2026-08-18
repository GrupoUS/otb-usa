#!/bin/sh
# post-commit: say out loud that the commit is still only local.
#
# Vercel builds from origin/main. A commit that stops at the local repository
# looks finished from every angle — the editor shows it, the working tree is
# clean — and production quietly keeps serving the previous build. That is
# exactly what happened on 2026-08-18: the IDE ran `git add` and `git commit`
# and never ran `git push`, so the ink-palette build sat unpublished.
#
# Runs on every commit, prints nothing when the branch is already in sync, and
# never blocks: a reminder is not a gate.

set -u

upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || echo "origin/main")
git rev-parse --verify --quiet "$upstream" >/dev/null 2>&1 || exit 0

ahead=$(git rev-list --count "$upstream..HEAD" 2>/dev/null || echo 0)
[ "$ahead" -gt 0 ] || exit 0

branch=$(git rev-parse --abbrev-ref HEAD)
plural=""
[ "$ahead" -gt 1 ] && plural="s"

printf '\n\033[33m! %s está %s commit%s à frente de %s — nada foi publicado ainda.\033[0m\n' \
	"$branch" "$ahead" "$plural" "$upstream"
printf '\033[2m  → bun run ship   (gates + push + verificação do deploy)\033[0m\n\n'

# The IDE swallows hook output, so the reminder also goes to the desktop.
if command -v notify-send >/dev/null 2>&1; then
	notify-send --app-name="OTB USA" --urgency=normal \
		"Commit ainda não publicado" \
		"$branch está $ahead commit$plural à frente de $upstream. Rode: bun run ship" \
		>/dev/null 2>&1 || true
fi

exit 0
