/**
 * Агент 6: Зведений факторний аналіз
 * Спрощена версія без StateGraph
 */

import { getLLM } from "../lib/llm";
import { SUMMARY_AGENT_PROMPT } from "../lib/prompts";
import type {
  AgentState,
  SummaryAnalysis,
  WaterfallItem,
  FactorImpact,
} from "../lib/types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Запуск агента зведеного аналізу
 */
export async function runSummaryAgent(
  eggAnalysis?: AgentState["eggAnalysis"],
  feedAnalysis?: AgentState["feedAnalysis"],
  budgetAnalysis?: AgentState["budgetAnalysis"]
): Promise<{
  summaryAnalysis?: SummaryAnalysis;
  messages?: string[];
  errors?: string[];
}> {
  const errors: string[] = [];
  const messages: string[] = [];

  try {
    if (!eggAnalysis && !feedAnalysis && !budgetAnalysis) {
      return { errors: ["Необхідні дані хоча б одного з попередніх аналізів"] };
    }

    messages.push("Вхідні дані для зведеного аналізу отримано");

    // Розрахунок загальної собівартості
    const planTotal =
      (eggAnalysis?.planValue || 0) +
      (feedAnalysis?.planValue || 0) +
      (budgetAnalysis?.directions.incubation.total.plan || 0) +
      (budgetAnalysis?.directions.growing.total.plan || 0) +
      (budgetAnalysis?.directions.slaughter.total.plan || 0) +
      (budgetAnalysis?.directions.ctf.total.plan || 0);

    const factTotal =
      (eggAnalysis?.factValue || 0) +
      (feedAnalysis?.factValue || 0) +
      (budgetAnalysis?.directions.incubation.total.fact || 0) +
      (budgetAnalysis?.directions.growing.total.fact || 0) +
      (budgetAnalysis?.directions.slaughter.total.fact || 0) +
      (budgetAnalysis?.directions.ctf.total.fact || 0);

    const totalDeviation = factTotal - planTotal;

    messages.push("Розрахунок загальної собівартості виконано");

    // Побудова водоспаду
    const waterfall: WaterfallItem[] = [];
    let cumulative = planTotal;

    waterfall.push({
      name: "Планова СВ",
      value: planTotal,
      cumulative: planTotal,
      type: "positive",
    });

    if (eggAnalysis) {
      const eggDeviation = eggAnalysis.totalDeviation;
      cumulative += eggDeviation;
      waterfall.push({
        name: "Яйце",
        value: eggDeviation,
        cumulative,
        type: eggDeviation > 0 ? "negative" : "positive",
      });
    }

    if (feedAnalysis) {
      const feedDeviation = feedAnalysis.totalDeviation;
      cumulative += feedDeviation;
      waterfall.push({
        name: "Корм",
        value: feedDeviation,
        cumulative,
        type: feedDeviation > 0 ? "negative" : "positive",
      });
    }

    if (budgetAnalysis?.directions.incubation) {
      const incDeviation = budgetAnalysis.directions.incubation.deviation;
      cumulative += incDeviation;
      waterfall.push({
        name: "Інкубація",
        value: incDeviation,
        cumulative,
        type: incDeviation > 0 ? "negative" : "positive",
      });
    }

    if (budgetAnalysis?.directions.growing) {
      const growDeviation = budgetAnalysis.directions.growing.deviation;
      cumulative += growDeviation;
      waterfall.push({
        name: "Вирощування",
        value: growDeviation,
        cumulative,
        type: growDeviation > 0 ? "negative" : "positive",
      });
    }

    if (budgetAnalysis?.directions.slaughter) {
      const slaughterDeviation = budgetAnalysis.directions.slaughter.deviation;
      cumulative += slaughterDeviation;
      waterfall.push({
        name: "Забій",
        value: slaughterDeviation,
        cumulative,
        type: slaughterDeviation > 0 ? "negative" : "positive",
      });
    }

    if (budgetAnalysis?.directions.ctf) {
      const ctfDeviation = budgetAnalysis.directions.ctf.deviation;
      cumulative += ctfDeviation;
      waterfall.push({
        name: "ЦТФ",
        value: ctfDeviation,
        cumulative,
        type: ctfDeviation > 0 ? "negative" : "positive",
      });
    }

    waterfall.push({
      name: "Фактична СВ",
      value: factTotal,
      cumulative: factTotal,
      type: "positive",
    });

    messages.push("Водоспад відхилень побудовано");

    // Збір усіх факторів для ТОП
    const allFactors: FactorImpact[] = [
      ...(eggAnalysis?.factors || []),
      ...(feedAnalysis?.factors || []),
      ...(budgetAnalysis?.top5Factors || []),
    ];

    allFactors.sort((a, b) => Math.abs(b.impactUahPerKg) - Math.abs(a.impactUahPerKg));

    const top3Negative = allFactors
      .filter((f) => f.evaluation === "negative")
      .slice(0, 3)
      .map((f) => ({ ...f, evaluation: "negative" as const }));

    const top3Positive = allFactors
      .filter((f) => f.evaluation === "positive")
      .slice(0, 3)
      .map((f) => ({ ...f, evaluation: "positive" as const }));

    // Розподіл на зовнішні та внутрішні фактори
    const externalFactorsList = ["ціна", "тариф", "вартість", "закупівельна"];
    const internalFactorsList = ["фцр", "вивід", "збереженість", "сортування", "споживання", "відхід", "продуктивність"];

    let externalTotal = 0;
    let internalTotal = 0;

    allFactors.forEach((f) => {
      const factorLower = f.factor.toLowerCase();
      const isExternal = externalFactorsList.some((keyword) => factorLower.includes(keyword));
      const isInternal = internalFactorsList.some((keyword) => factorLower.includes(keyword));

      if (isExternal) {
        externalTotal += Math.abs(f.impactUahPerKg);
      } else if (isInternal) {
        internalTotal += Math.abs(f.impactUahPerKg);
      }
    });

    messages.push("Фактори розподілено на зовнішні та внутрішні");

    // Управлінський висновок
    const deviationPercent = planTotal > 0 ? (totalDeviation / planTotal) * 100 : 0;

    const priorities = [...top3Negative, ...top3Positive].slice(0, 5).map((f) => ({
      factor: f.factor,
      impact: Math.abs(f.impactUahPerKg),
      responsible: determineResponsible(f.factor),
    }));

    const summaryAnalysis: SummaryAnalysis = {
      totalCostPerKg: {
        plan: planTotal,
        fact: factTotal,
        deviation: totalDeviation,
      },
      waterfall,
      top3Negative,
      top3Positive,
      factorNature: {
        external: externalTotal,
        internal: internalTotal,
      },
      managementConclusion: {
        totalDeviation,
        deviationPercent,
        externalFactors: externalTotal,
        internalFactors: internalTotal,
        priorities,
      },
    };

    messages.push("Зведений аналіз завершено");

    // LLM звіт
    let llmReport: string | undefined;
    const llmInstance = getLLM();
    if (llmInstance) {
      try {
        const systemMessage = new SystemMessage(SUMMARY_AGENT_PROMPT);
        const userData = { analysis: summaryAnalysis };
        const humanMessage = new HumanMessage(
          `Зроби управлінський висновок на основі зведеного аналізу:\n\n${JSON.stringify(userData, null, 2)}\n\nПоверни результат у форматі JSON.`
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
      summaryAnalysis: {
        ...summaryAnalysis,
        llmReport,
      },
      messages,
    };
  } catch (error) {
    return {
      errors: [`Error aggregating summary: ${error}`],
      messages,
    };
  }
}

/**
 * Визначення відповідального підрозділу за фактором
 */
function determineResponsible(factor: string): string {
  const factorLower = factor.toLowerCase();

  if (factorLower.includes("яйц") || factorLower.includes("бс")) {
    return "Батьківське стадо";
  }
  if (factorLower.includes("корм") || factorLower.includes("фцр") || factorLower.includes("рецепт")) {
    return "Відділ годівлі / ККЗ";
  }
  if (factorLower.includes("вивід") || factorLower.includes("інкубац")) {
    return "Інкубаційний цех";
  }
  if (factorLower.includes("забій") || factorLower.includes("цтф")) {
    return "Цех забою / ЦТФ";
  }
  if (factorLower.includes("газ") || factorLower.includes("електр") || factorLower.includes("енерг")) {
    return "Головний енергетик";
  }
  if (factorLower.includes("оплат") || factorLower.includes("прац")) {
    return "Відділ кадрів";
  }
  if (factorLower.includes("вет")) {
    return "Ветеринарна служба";
  }

  return "Керівництво";
}
