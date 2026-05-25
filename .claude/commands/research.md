---
description: Deep research mode — parallel exploration of codebase + external docs. Returns structured findings only, no code changes.
workflow_type: parallelization
---

# /research — Parallel Research Only

**ARGUMENTS**: $ARGUMENTS

> Triggers Phase 2A of the D.R.P.I.V methodology in **research-only** mode. No edits. No fixes.

---

## Agent routing (mandatory — choose by **where the answer lives**)

> **`explorer` = custom agent at `.claude/agents/explorer-agent.md`** — structured findings table with confidence scores (1-5), Knowledge Gaps, Librarian Requests.
> **NOT the built-in `Explore`.** Use `subagent_type: "explorer"` (exact case).

| Question type | Agent | Why |
|---|---|---|
| What exists in our codebase? | `explorer` | Filesystem |
| How does this code pattern work? | `explorer` | Filesystem |
| Which files need to change? | `explorer` | Filesystem |
| How does this library/API work? | `librarian` | External |
| What are best practices for X? | `librarian` | External |
| Is this package behavior documented? | `librarian` | External |

---

## Setup

```typescript
Skill("superpowers:using-superpowers");           // meta — bootstrap (per _shared.md § 0.5)
Skill("superpowers:dispatching-parallel-agents"); // explorer + librarian = parallel batch with distinct scope
```

If the research scope is open-ended (user says "should we build X?" / "how should we approach Y?" / no concrete artifact requested), also invoke `Skill("superpowers:brainstorming")` to frame the right questions before research. Skip when the user asked a concrete factual question (`how does library X handle Y?`).

## Execution

1. Fire `explorer` (custom agent, **NOT** built-in `Explore`) in background for codebase analysis.
2. Fire `librarian` in background for external documentation **IF** any library, package, or external API is mentioned.
3. Continue reading immediately — do not wait for agents.
4. Collect background results.
5. Output structured findings table with confidence (1-5), source, impact.
6. **Do NOT implement.** Research only.

---

## Tool selection

| Question | Tool | Rationale |
|---|---|---|
| API syntax, config options, framework patterns | **Context7** | Official docs — version-accurate |
| Current best practices, community patterns | **Tavily** | Training data stales; community evolves |
| Package CVEs, security advisories, maintenance | **Tavily** | Realtime ecosystem (GHSA, Snyk, npm) |
| Breaking changes in library vN | **Context7 → Tavily** | Official migration → community pitfalls |
| Comparing 2+ packages | **Tavily** | Community benchmarks, npm stats |
| Exact hook/function signatures, schemas | **Context7** | Always prefer over training |

### Tavily — web intelligence

For community patterns, CVEs, ecosystem comparisons, migration war stories.

- Formulate 2-3 query variations (`"<lib> middleware order 2026"`, `"<lib> v<N> breaking changes"`)
- Scope to authoritative sources: `github.com`, `npmjs.com`, `github.com/advisories`, `snyk.io`
- For CVEs: `site:github.com/advisories <package>` or `<package> CVE GHSA`
- **Always add year + version** to queries — avoids stale results

### Context7 — documentation lookup

For exact API signatures, config options, anything needing authoritative current docs.

1. `mcp__claude_ai_Context7__resolve-library-id` — get library ID from package name
2. `mcp__claude_ai_Context7__query-docs` — query with specific topic (`"useQuery options"`, `"insert returning"`)

Always prefer Context7 over training knowledge for any library/framework where the API surface is non-trivial.

---

## Approach

1. Classify: answer in codebase (explorer) or external (librarian)?
2. External: API/docs question (Context7) or ecosystem state (Tavily)?
3. Run both when question spans documentation + community context
4. Verify key facts across sources — flag contradictions
5. Confidence score reflects source quality: 1=speculation · 3=community · 5=official docs

---

## Output

- Research methodology + queries used
- Curated findings with source URLs
- Credibility assessment of sources
- Synthesis highlighting key insights
- Contradictions or gaps identified
- Data tables / structured summaries
- Recommendations for further research

Direct quotes for important claims. Actionable insights only.

---

## Findings format

| # | Finding | Confidence | Source | Impact |
|---|---|---|---|---|
| 1 | … | 4 | codebase: path/file | high |
| 2 | … | 5 | docs: URL | high |

## Knowledge gaps

[List what remains unknown after both agents complete]

## Recommended next step

[One suggested action based on findings]
