/**
 * Агент 2: Аналіз вартості корму в собівартості тушки
 * Спрощена версія без StateGraph
 */

import { getLLM } from "../lib/llm";
import { FEED_AGENT_PROMPT } from "../lib/prompts";
import { analyzeFeedCost, generateConclusion, generateRecommendations } from "../lib/calculations";
import type { FeedInput, FeedAnalysis } from "../lib/types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Запуск агента аналізу корму
 */
export async function runFeedAgent(input: FeedInput): Promise<{
  feedAnalysis?: FeedAnalysis;
  messages?: string[];
  errors?: string[];
}> {
  const errors: string[] = [];
  const messages: string[] = [];

  try {
    if (!input) {
      return { errors: ["Вхідні дані для аналізу корму не надані"] };
    }

    // Валідація
    const feedPrices = [
      input.feedPrice.start.plan, input.feedPrice.start.fact,
      input.feedPrice.growth.plan, input.feedPrice.growth.fact,
      input.feedPrice.finish.plan, input.feedPrice.finish.fact,
    ];
    
    if (feedPrices.some(p => p < 0)) errors.push("Ціна корму не може бути від'ємною");
    if (input.fcr.plan <= 0 || input.fcr.fact <= 0) errors.push("FCR має бути додатним");
    if (input.fcr.plan > 3 || input.fcr.fact > 3) errors.push("FCR > 3 є аномально високим");
    if (input.liveWeight.plan <= 0 || input.liveWeight.fact <= 0) errors.push("Жива вага має бути додатною");
    if (input.carcassYield.plan <= 0 || input.carcassYield.fact <= 0) errors.push("Вихід тушки має бути додатним");

    if (errors.length > 0) {
      return { errors };
    }

    messages.push("Вхідні дані валідовано");

    const analysis = analyzeFeedCost(input);
    messages.push("Розрахунок виконано");

    const conclusion = generateConclusion(analysis.factors, analysis.totalDeviation, "Вартість корму");
    const recommendations = generateRecommendations(analysis.factors);

    const feedAnalysis: FeedAnalysis = {
      feedCostPerKgCarcass: {
        plan: analysis.feedCostPerKg.plan,
        fact: analysis.feedCostPerKg.fact,
        deviation: analysis.feedCostPerKg.deviation,
      },
      weightedFeedPrice: {
        plan: analysis.weightedFeedPrice.plan,
        fact: analysis.weightedFeedPrice.fact,
        deviation: analysis.weightedFeedPrice.deviation,
      },
      planValue: analysis.planValue,
      factValue: analysis.factValue,
      totalDeviation: analysis.totalDeviation,
      factors: analysis.factors,
      validation: analysis.validation,
      conclusion,
      recommendations,
      fcrBreakdown: {
        genetic: input.geneticPotential ? (input.geneticPotential.fact - input.geneticPotential.plan) * 0.01 : 0,
        feedQuality: input.feedQuality ? (input.feedQuality.fact - input.feedQuality.plan) * 0.02 : 0,
        housing: input.housingConditions ? (input.housingConditions.fact - input.housingConditions.plan) * 0.015 : 0,
        disease: input.diseaseRate ? (input.diseaseRate.fact - input.diseaseRate.plan) * 0.025 : 0,
      },
    };

    messages.push("Аналіз вартості корму завершено");

    // LLM звіт
    let llmReport: string | undefined;
    const llmInstance = getLLM();
    if (llmInstance) {
      try {
        const systemMessage = new SystemMessage(FEED_AGENT_PROMPT);
        const userData = { input, analysis: feedAnalysis };
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
      feedAnalysis: {
        ...feedAnalysis,
        llmReport,
      },
      messages,
    };
  } catch (error) {
    return {
      errors: [`Error calculating feed cost: ${error}`],
      messages,
    };
  }
}
