# Refactor Methodology — 17-Step Reference

> Reference methodology for refactoring tasks. Loaded by `/implement` when intent classifies as refactor.
> Generic — applies to any codebase + language.

## Principle

Refactoring **preserves external behavior** while improving internal structure. Prioritize safety over speed. Maintain comprehensive test coverage throughout.

## Steps

1. **Pre-refactoring analysis** — identify the code, the reasons, the dependencies, the usage points.
2. **Test coverage verification** — write missing tests **before** refactoring; establish baseline.
3. **Refactoring strategy** — define goals (perf / readability / maintainability); pick technique (extract method, extract class, rename, move, replace conditional with polymorphism, eliminate dead code).
4. **Environment setup** — branch off (`refactor/<scope>`); ensure tests pass before starting; set up profilers/analyzers if needed.
5. **Incremental refactoring** — small focused changes one at a time; tests after each; commit working changes frequently.
6. **Code quality improvements** — naming, DRY, simplify conditionals, reduce method length, separation of concerns.
7. **Performance optimizations** — eliminate bottlenecks; optimize algorithms/data structures; reduce computations; improve memory usage.
8. **Design pattern application** — apply patterns where beneficial; improve abstraction/encapsulation; enhance modularity.
9. **Error handling improvement** — standardize approaches; improve messages and logging; add proper exception handling.
10. **Documentation updates** — code comments reflecting changes; revise API docs if interfaces changed; ensure accuracy.
11. **Testing enhancements** — tests for new code paths; remove or update obsolete tests; ensure tests remain meaningful.
12. **Static analysis** — run linters; static analyzers; security scanners; complexity metrics.
13. **Performance verification** — run benchmarks if applicable; before/after metrics; ensure no regression.
14. **Integration testing** — full test suite; integration with dependent systems; edge cases and error scenarios.
15. **Code review preparation** — review changes for quality + consistency; verify goals achieved; prepare clear explanation.
16. **Documentation of changes** — summary; breaking changes; new patterns; benefits + rationale.
17. **Deployment considerations** — feature flags for gradual rollout; rollback procedure; monitoring on refactored components.

## Anti-patterns

- "Big bang" rewrite — always incremental
- No tests before refactor → no safety net
- Mixing refactor with feature changes → unclear blame
- Skipping benchmarks on perf-motivated refactor
- Forgetting to update docs / interface contracts
