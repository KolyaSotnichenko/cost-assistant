/**
 * Агент 1: Аналіз вартості яйця в собівартості тушки
 * Спрощена версія без StateGraph - пряме виконання
 */

import { getLLM } from "../lib/llm";
import { EGG_AGENT_PROMPT } from "../lib/prompts";
import { analyzeEggCost, generateConclusion, generateRecommendations } from "../lib/calculations";
import type { EggInput, EggAnalysis } from "../lib/types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Запуск агента аналізу яйця
 */
export async function runEggAgent(input: EggInput): Promise<{
  eggAnalysis?: EggAnalysis;
  messages?: string[];
  errors?: string[];
}> {
  const errors: string[] = [];
  const messages: string[] = [];

  try {
    // Валідація
    if (!input) {
      return { errors: ["Вхідні дані для аналізу яйця не надані"] };
    }

    // Перевірка на від'ємні значення
    if (input.eggPrice.plan < 0 || input.eggPrice.fact < 0) errors.push("Ціна яйця не може бути від'ємною");
    if (input.sorting.plan < 0 || input.sorting.fact < 0) errors.push("Сортування не може бути від'ємним");
    if (input.hatchability.plan < 0 || input.hatchability.fact < 0) errors.push("Вивід не може бути від'ємним");
    if (input.survivability.plan < 0 || input.survivability.fact < 0) errors.push("Збереженість не може бути від'ємною");
    if (input.liveWeight.plan <= 0 || input.liveWeight.fact <= 0) errors.push("Жива вага має бути додатною");
    if (input.carcassYield.plan <= 0 || input.carcassYield.fact <= 0) errors.push("Вихід тушки має бути додатним");

    if (errors.length > 0) {
      return { errors };
    }

    messages.push("Вхідні дані валідовано");

    // Виконуємо розрахунок
    const analysis = analyzeEggCost(input);
    messages.push("Розрахунок виконано");

    // Генеруємо висновок та рекомендації
    const conclusion = generateConclusion(
      analysis.factors,
      analysis.totalDeviation,
      "Вартість яйця"
    );
    const recommendations = generateRecommendations(analysis.factors);

    const eggAnalysis: EggAnalysis = {
      eggCostPerKgCarcass: {
        plan: analysis.eggCostPerKg.plan,
        fact: analysis.eggCostPerKg.fact,
        deviation: analysis.eggCostPerKg.deviation,
      },
      planValue: analysis.planValue,
      factValue: analysis.factValue,
      totalDeviation: analysis.totalDeviation,
      factors: analysis.factors,
      validation: analysis.validation,
      conclusion,
      recommendations,
    };

    messages.push("Аналіз вартості яйця завершено");

    // Генерація звіту через LLM (опціонально)
    let llmReport: string | undefined;
    const llmInstance = getLLM();
    if (llmInstance) {
      try {
        const systemMessage = new SystemMessage(EGG_AGENT_PROMPT);
        const userData = { input, analysis: eggAnalysis };
        const humanMessage = new HumanMessage(
          `Виконай факторний аналіз на основі цих даних:\n\n${JSON.stringify(userData, null, 2)}\n\nПоверни результат у форматі JSON.`
        );
        const response = await llmInstance.invoke([systemMessage, humanMessage]);
        llmReport = typeof response === "string" ? response : JSON.stringify(response);
        messages.push("Звіт LLM згенеровано");
      } catch (llmError) {
        messages.push(`LLM звіт не згенеровано: ${llmError}`);
      }
    } else {
      messages.push("LLM недоступний - звіт не згенеровано");
    }

    return {
      eggAnalysis: {
        ...eggAnalysis,
        llmReport,
      },
      messages,
    };
  } catch (error) {
    return {
      errors: [`Error calculating egg cost: ${error}`],
      messages,
    };
  }
}
