/**
 * Agent Orchestrator - Decision Matrix
 *
 * Helps decide between: single agent, subagents, or agent teams
 */

export type OrchestrationStrategy = "single" | "subagents" | "team";

export type ComplexityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TaskAnalysis {
  complexity: ComplexityLevel;
  layers: string[];
  parallelizable: boolean;
  reasoning: string;
  requiresCoordination: boolean;
  strategy: OrchestrationStrategy;
}

/**
 * Classify task complexity based on indicators
 */
export function classifyComplexity(task: {
  fileCount?: number;
  layers?: string[];
  hasSchema?: boolean;
  hasApi?: boolean;
  hasUi?: boolean;
  hasTests?: boolean;
}): ComplexityLevel {
  let score = 1;

  // File count increases complexity
  if (task.fileCount) {
    if (task.fileCount >= 20) {
      score += 3;
    } else if (task.fileCount >= 10) {
      score += 2;
    } else if (task.fileCount >= 5) {
      score += 1;
    }
  }

  // Layer count
  const layerCount = task.layers?.length ?? 0;
  if (layerCount >= 3) {
    score += 3;
  } else if (layerCount === 2) {
    score += 2;
  } else if (layerCount === 1) {
    score += 1;
  }

  // Specific features
  if (task.hasSchema) {
    score += 1;
  }
  if (task.hasApi) {
    score += 1;
  }
  if (task.hasUi) {
    score += 1;
  }
  if (task.hasTests) {
    score += 0;
  }

  return Math.min(score, 10) as ComplexityLevel;
}

/**
 * Main decision function - returns recommended strategy
 */
export function decideStrategy(analysis: TaskAnalysis): OrchestrationStrategy {
  const { complexity, layers, parallelizable, requiresCoordination } = analysis;

  // L1-L3: Single agent for simple tasks
  if (complexity <= 3 && layers.length <= 1) {
    return "single";
  }

  // L3-L4: Subagents for parallel independent tasks
  if (complexity <= 4 && parallelizable && !requiresCoordination) {
    return "subagents";
  }

  // L5+: Agent teams for complex coordination
  if (complexity >= 5 || (layers.length >= 2 && requiresCoordination)) {
    return "team";
  }

  // Default
  return complexity === 4 ? "subagents" : "single";
}

/**
 * Analyze a task and return recommendation
 */
export function analyzeTask(task: {
  description: string;
  fileCount?: number;
  affectedLayers?: string[];
}): TaskAnalysis {
  const layers = task.affectedLayers ?? detectLayers(task.description);
  const complexity = classifyComplexity({
    fileCount: task.fileCount,
    layers,
    hasSchema: layers.includes("database"),
    hasApi: layers.includes("backend"),
    hasUi: layers.includes("frontend"),
  });

  const parallelizable = !layers.includes("database") || layers.length === 1;
  const requiresCoordination = layers.length >= 2;

  const strategy = decideStrategy({
    complexity,
    layers,
    parallelizable,
    requiresCoordination,
  });

  const reasoning = generateReasoning(complexity, layers, strategy);

  return {
    complexity,
    layers,
    parallelizable,
    requiresCoordination,
    strategy,
    reasoning,
  };
}

/**
 * Detect affected layers from task description
 */
function detectLayers(description: string): string[] {
  const layers: string[] = [];
  const desc = description.toLowerCase();

  if (
    desc.includes("database") ||
    desc.includes("schema") ||
    desc.includes("drizzle") ||
    desc.includes("migration")
  ) {
    layers.push("database");
  }
  if (
    desc.includes("api") ||
    desc.includes("trpc") ||
    desc.includes("endpoint") ||
    desc.includes("router")
  ) {
    layers.push("backend");
  }
  if (
    desc.includes("ui") ||
    desc.includes("frontend") ||
    desc.includes("component") ||
    desc.includes("react")
  ) {
    layers.push("frontend");
  }
  if (desc.includes("test") || desc.includes("e2e")) {
    layers.push("tests");
  }

  return layers.length > 0 ? layers : ["unknown"];
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  complexity: ComplexityLevel,
  layers: string[],
  strategy: OrchestrationStrategy
): string {
  if (strategy === "single") {
    return `L${complexity} - Simple task (${layers.join(", ")}). Direct execution is fastest.`;
  }
  if (strategy === "subagents") {
    return `L${complexity} - ${layers.length} layer(s), parallelizable. Use subagents for independent work.`;
  }
  return `L${complexity} - Complex (${layers.join(", ")}), requires coordination. Use agent team.`;
}

// CLI-friendly output
if (import.meta.main) {
  const args = process.argv.slice(2);
  const task = args.join(" ");
  const result = analyzeTask({ description: task });
  console.log(JSON.stringify(result, null, 2));
}
