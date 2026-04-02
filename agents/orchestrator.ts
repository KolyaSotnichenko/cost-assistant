/**
 * Головний оркестратор на базі LangGraph StateGraph
 * Координує роботу всіх агентів факторного аналізу
 *
 * Граф потоку:
 *  __start__
 *     ↓
 *   [egg_agent] ─── (якщо є eggInput)
 *     ↓
 *   [feed_agent] ── (якщо є feedInput)
 *     ↓
 *   [budget_agent] ─ (якщо є budgetInput)
 *     ↓
 *   [summary_agent] (агрегує всі результати)
 *     ↓
 *  __end__
 */

import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { runEggAgent } from "./egg-agent";
import { runFeedAgent } from "./feed-agent";
import { runBudgetAgent } from "./budget-agent";
import { runSummaryAgent } from "./summary-agent";
import type {
  AgentState,
  EggInput,
  FeedInput,
  BudgetInput,
} from "../lib/types";

// ─── Оголошення стану графу ───────────────────────────────────────────────────

const GraphState = Annotation.Root({
  // Вхідні дані
  eggInput: Annotation<EggInput | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  feedInput: Annotation<FeedInput | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  budgetInput: Annotation<BudgetInput | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),

  // Результати аналізу
  eggAnalysis: Annotation<AgentState["eggAnalysis"]>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  feedAnalysis: Annotation<AgentState["feedAnalysis"]>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  budgetAnalysis: Annotation<AgentState["budgetAnalysis"]>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
  summaryAnalysis: Annotation<AgentState["summaryAnalysis"]>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),

  // Службові поля
  messages: Annotation<string[]>({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
  errors: Annotation<string[]>({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
  currentStep: Annotation<string | undefined>({
    reducer: (_, b) => b,
    default: () => undefined,
  }),
});

type GraphStateType = typeof GraphState.State;

// ─── Вузли графу ─────────────────────────────────────────────────────────────

async function eggNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  if (!state.eggInput) return {};

  const result = await runEggAgent(state.eggInput);
  return {
    eggAnalysis: result.eggAnalysis,
    messages: result.messages ?? [],
    errors: result.errors ?? [],
    currentStep: "egg_done",
  };
}

async function feedNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  if (!state.feedInput) return {};

  const result = await runFeedAgent(state.feedInput);
  return {
    feedAnalysis: result.feedAnalysis,
    messages: result.messages ?? [],
    errors: result.errors ?? [],
    currentStep: "feed_done",
  };
}

async function budgetNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  if (!state.budgetInput) return {};

  const result = await runBudgetAgent(state.budgetInput);
  return {
    budgetAnalysis: result.budgetAnalysis,
    messages: result.messages ?? [],
    errors: result.errors ?? [],
    currentStep: "budget_done",
  };
}

async function summaryNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const result = await runSummaryAgent(
    state.eggAnalysis,
    state.feedAnalysis,
    state.budgetAnalysis
  );
  return {
    summaryAnalysis: result.summaryAnalysis,
    messages: result.messages ?? [],
    errors: result.errors ?? [],
    currentStep: "summary_done",
  };
}

// ─── Побудова графу ──────────────────────────────────────────────────────────

function buildAnalysisGraph() {
  const graph = new StateGraph(GraphState)
    .addNode("egg_agent", eggNode)
    .addNode("feed_agent", feedNode)
    .addNode("budget_agent", budgetNode)
    .addNode("summary_agent", summaryNode);

  // Лінійний ланцюг: start → egg → feed → budget → summary → end
  graph.addEdge(START, "egg_agent");
  graph.addEdge("egg_agent", "feed_agent");
  graph.addEdge("feed_agent", "budget_agent");
  graph.addEdge("budget_agent", "summary_agent");
  graph.addEdge("summary_agent", END);

  return graph.compile();
}

// Ледача ініціалізація скомпільованого графу
let _compiledGraph: ReturnType<typeof buildAnalysisGraph> | null = null;

function getCompiledGraph() {
  if (!_compiledGraph) {
    _compiledGraph = buildAnalysisGraph();
  }
  return _compiledGraph;
}

// ─── Публічна функція запуску ─────────────────────────────────────────────────

/**
 * Запуск повного факторного аналізу через LangGraph StateGraph
 */
export async function runFullAnalysis(inputs: {
  eggInput?: EggInput | null;
  feedInput?: FeedInput | null;
  budgetInput?: BudgetInput | null;
}): Promise<AgentState> {
  const initialState: Partial<GraphStateType> = {
    eggInput: inputs.eggInput ?? undefined,
    feedInput: inputs.feedInput ?? undefined,
    budgetInput: inputs.budgetInput ?? undefined,
    messages: ["Запуск факторного аналізу через LangGraph..."],
    errors: [],
  };

  const app = getCompiledGraph();
  const finalState = await app.invoke(initialState);

  return {
    eggInput: finalState.eggInput,
    feedInput: finalState.feedInput,
    budgetInput: finalState.budgetInput,
    eggAnalysis: finalState.eggAnalysis,
    feedAnalysis: finalState.feedAnalysis,
    budgetAnalysis: finalState.budgetAnalysis,
    summaryAnalysis: finalState.summaryAnalysis,
    messages: finalState.messages ?? [],
    errors: finalState.errors ?? [],
    currentStep: finalState.currentStep,
  };
}
