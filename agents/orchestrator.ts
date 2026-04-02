/**
 * Головний оркестратор для запуску факторного аналізу
 * Координує роботу всіх агентів
 * 
 * Потік даних:
 * 1. Egg Agent (яйце в СВ тушки)
 * 2. Feed Agent (корм в СВ тушки)
 * 3. Budget Agent (витрати по напрямках)
 * 4. Summary Agent (зведений аналіз)
 */

import { runEggAgent } from "./egg-agent";
import { runFeedAgent } from "./feed-agent";
import { runBudgetAgent } from "./budget-agent";
import { runSummaryAgent } from "./summary-agent";
import type { AgentState, EggInput, FeedInput, BudgetInput } from "../lib/types";

/**
 * Запуск повного аналізу з усіма агентами
 */
export async function runFullAnalysis(inputs: {
  eggInput?: EggInput | null;
  feedInput?: FeedInput | null;
  budgetInput?: BudgetInput | null;
}): Promise<AgentState> {
  const messages: string[] = ["🚀 Запуск факторного аналізу..."];
  const errors: string[] = [];

  let eggAnalysis: AgentState["eggAnalysis"];
  let feedAnalysis: AgentState["feedAnalysis"];
  let budgetAnalysis: AgentState["budgetAnalysis"];
  let summaryAnalysis: AgentState["summaryAnalysis"];

  // Запуск агента яйця
  if (inputs.eggInput) {
    messages.push("🥚 Запуск агента аналізу яйця...");
    const eggResult = await runEggAgent(inputs.eggInput);
    if (eggResult.errors) errors.push(...eggResult.errors);
    if (eggResult.messages) messages.push(...eggResult.messages);
    eggAnalysis = eggResult.eggAnalysis;
  }

  // Запуск агента корму
  if (inputs.feedInput) {
    messages.push("🌾 Запуск агента аналізу корму...");
    const feedResult = await runFeedAgent(inputs.feedInput);
    if (feedResult.errors) errors.push(...feedResult.errors);
    if (feedResult.messages) messages.push(...feedResult.messages);
    feedAnalysis = feedResult.feedAnalysis;
  }

  // Запуск агента бюджету
  if (inputs.budgetInput) {
    messages.push("💰 Запуск агента аналізу бюджету...");
    const budgetResult = await runBudgetAgent(inputs.budgetInput);
    if (budgetResult.errors) errors.push(...budgetResult.errors);
    if (budgetResult.messages) messages.push(...budgetResult.messages);
    budgetAnalysis = budgetResult.budgetAnalysis;
  }

  // Запуск зведеного аналізу
  if (eggAnalysis || feedAnalysis || budgetAnalysis) {
    messages.push("📊 Запуск зведеного аналізу...");
    const summaryResult = await runSummaryAgent(eggAnalysis, feedAnalysis, budgetAnalysis);
    if (summaryResult.errors) errors.push(...summaryResult.errors);
    if (summaryResult.messages) messages.push(...summaryResult.messages);
    summaryAnalysis = summaryResult.summaryAnalysis;
  }

  return {
    eggInput: inputs.eggInput || undefined,
    feedInput: inputs.feedInput || undefined,
    budgetInput: inputs.budgetInput || undefined,
    eggAnalysis,
    feedAnalysis,
    budgetAnalysis,
    summaryAnalysis,
    messages,
    errors,
    currentStep: errors.length > 0 ? "completed_with_errors" : "completed",
  };
}
