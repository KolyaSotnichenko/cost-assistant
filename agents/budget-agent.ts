/**
 * Агент 3: Аналіз бюджету витрат по напрямках
 * Спрощена версія без StateGraph
 */

import { getLLM } from "../lib/llm";
import { BUDGET_AGENT_PROMPT } from "../lib/prompts";
import { analyzeBudgetEnergy, generateConclusion, generateRecommendations } from "../lib/calculations";
import type {
  BudgetInput,
  BudgetAnalysis,
  BudgetDirection,
  BudgetDirectionInput,
  PlanFact,
  FactorImpact,
} from "../lib/types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Запуск агента аналізу бюджету
 */
export async function runBudgetAgent(input: BudgetInput): Promise<{
  budgetAnalysis?: BudgetAnalysis;
  messages?: string[];
  errors?: string[];
}> {
  const errors: string[] = [];
  const messages: string[] = [];

  try {
    if (!input) {
      return { errors: ["Вхідні дані для аналізу бюджету не надані"] };
    }

    if (input.productionVolume.plan <= 0 || input.productionVolume.fact <= 0) {
      errors.push("Обсяг виробництва має бути додатним");
    }

    if (errors.length > 0) {
      return { errors };
    }

    messages.push("Вхідні дані валідовано");

    const directions: BudgetDirection[] = ["incubation", "growing", "slaughter", "ctf"];
    const directionResults: Record<BudgetDirection, any> = {
      incubation: processDirection(input.incubation, input.productionVolume),
      growing: processDirection(input.growing, input.productionVolume),
      slaughter: processDirection(input.slaughter, input.productionVolume),
      ctf: processDirection(input.ctf, input.productionVolume, true),
    };

    // Збираємо всі фактори для ТОП-5
    const allFactors: Array<{ factor: string; impact: number }> = [];
    
    directions.forEach((dir) => {
      const result = directionResults[dir];
      allFactors.push({ factor: `${dir} - Оплата праці`, impact: result.salaryImpact });
      allFactors.push({ factor: `${dir} - Газ`, impact: result.gasImpact });
      allFactors.push({ factor: `${dir} - Електроенергія`, impact: result.electricityImpact });
      allFactors.push({ factor: `${dir} - ПММ`, impact: result.fuelImpact });
    });

    allFactors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    const top5Factors: FactorImpact[] = allFactors.slice(0, 5).map((f) => ({
      factor: f.factor,
      impactUahPerKg: f.impact,
      impactPercent: 0,
      evaluation: f.impact > 0 ? "positive" as const : "negative" as const,
    }));

    const conclusion = `Бюджетний аналіз завершено. 
      Загальне відхилення по всіх напрямках: ${Object.values(directionResults)
        .reduce((sum, r) => sum + r.totalDeviation, 0)
        .toFixed(4)} грн/кг.
      Найбільший вплив мали: ${top5Factors.slice(0, 3).map(f => f.factor).join(", ")}.`;

    const recommendations = top5Factors
      .filter(f => f.evaluation === "negative")
      .map(f => `Оптимізувати ${f.factor}: очікуваний ефект ${Math.abs(f.impactUahPerKg).toFixed(4)} грн/кг`);

    const budgetAnalysis: BudgetAnalysis = {
      directions: {
        incubation: {
          total: directionResults.incubation.total,
          deviation: directionResults.incubation.totalDeviation,
          mainFactor: directionResults.incubation.mainFactor,
          energyBreakdown: directionResults.incubation.energyBreakdown,
        },
        growing: {
          total: directionResults.growing.total,
          deviation: directionResults.growing.totalDeviation,
          mainFactor: directionResults.growing.mainFactor,
          energyBreakdown: directionResults.growing.energyBreakdown,
        },
        slaughter: {
          total: directionResults.slaughter.total,
          deviation: directionResults.slaughter.totalDeviation,
          mainFactor: directionResults.slaughter.mainFactor,
          energyBreakdown: directionResults.slaughter.energyBreakdown,
        },
        ctf: {
          total: directionResults.ctf.total,
          deviation: directionResults.ctf.totalDeviation,
          mainFactor: directionResults.ctf.mainFactor,
          energyBreakdown: directionResults.ctf.energyBreakdown,
        },
      },
      top5Factors,
      conclusion,
      recommendations,
    };

    messages.push("Аналіз бюджету завершено");

    // LLM звіт
    let llmReport: string | undefined;
    const llmInstance = getLLM();
    if (llmInstance) {
      try {
        const systemMessage = new SystemMessage(BUDGET_AGENT_PROMPT);
        const userData = { input, analysis: budgetAnalysis };
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
      budgetAnalysis: {
        ...budgetAnalysis,
        llmReport,
      },
      messages,
    };
  } catch (error) {
    return {
      errors: [`Error calculating budget: ${error}`],
      messages,
    };
  }
}

/**
 * Розрахунок загальних витрат напрямку
 */
function calculateDirectionTotal(input: BudgetDirectionInput): PlanFact {
  const planTotal =
    input.salary.plan +
    input.energy.gas.price.plan * input.energy.gas.consumption.plan +
    input.energy.electricity.price.plan * input.energy.electricity.consumption.plan +
    input.energy.fuel.price.plan * input.energy.fuel.consumption.plan +
    input.logistics.plan +
    input.vetPreparations.plan +
    input.repairs.plan +
    input.other.plan;

  const factTotal =
    input.salary.fact +
    input.energy.gas.price.fact * input.energy.gas.consumption.fact +
    input.energy.electricity.price.fact * input.energy.electricity.consumption.fact +
    input.energy.fuel.price.fact * input.energy.fuel.consumption.fact +
    input.logistics.fact +
    input.vetPreparations.fact +
    input.repairs.fact +
    input.other.fact;

  return {
    plan: planTotal,
    fact: factTotal,
    deviation: factTotal - planTotal,
  };
}

/**
 * Визначення головного фактору відхилення
 */
function determineMainFactor(input: BudgetDirectionInput): string {
  const deviations = {
    salary: Math.abs(input.salary.fact - input.salary.plan),
    gas: Math.abs(
      input.energy.gas.price.fact * input.energy.gas.consumption.fact -
      input.energy.gas.price.plan * input.energy.gas.consumption.plan
    ),
    electricity: Math.abs(
      input.energy.electricity.price.fact * input.energy.electricity.consumption.fact -
      input.energy.electricity.price.plan * input.energy.electricity.consumption.plan
    ),
    fuel: Math.abs(
      input.energy.fuel.price.fact * input.energy.fuel.consumption.fact -
      input.energy.fuel.price.plan * input.energy.fuel.consumption.plan
    ),
    logistics: Math.abs(input.logistics.fact - input.logistics.plan),
    vet: Math.abs(input.vetPreparations.fact - input.vetPreparations.plan),
    repairs: Math.abs(input.repairs.fact - input.repairs.plan),
    other: Math.abs(input.other.fact - input.other.plan),
  };

  const maxFactor = Object.entries(deviations).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  const factorNames: Record<string, string> = {
    salary: "Оплата праці",
    gas: "Газ",
    electricity: "Електроенергія",
    fuel: "ПММ",
    logistics: "Логістика",
    vet: "Ветпрепарати",
    repairs: "Ремонти",
    other: "Інші витрати",
  };

  return factorNames[maxFactor] || "Невідомо";
}

/**
 * Обробка одного напрямку бюджету
 */
function processDirection(
  input: BudgetDirectionInput,
  productionVolume: PlanFact,
  hasCtfIncome: boolean = false
) {
  const total = calculateDirectionTotal(input);
  const mainFactor = determineMainFactor(input);

  const totalPerKg = {
    plan: total.plan / productionVolume.plan,
    fact: total.fact / productionVolume.fact,
  };
  const totalDeviation = totalPerKg.fact - totalPerKg.plan;

  const salaryImpact = (input.salary.fact - input.salary.plan) / productionVolume.fact;
  
  const energyBreakdown = analyzeBudgetEnergy(input.energy);
  const gasImpact = energyBreakdown.gas.total / productionVolume.fact;
  const electricityImpact = energyBreakdown.electricity.total / productionVolume.fact;
  const fuelImpact = energyBreakdown.fuel.total / productionVolume.fact;

  return {
    total,
    totalDeviation,
    mainFactor,
    energyBreakdown: {
      gas: {
        priceImpact: energyBreakdown.gas.priceImpact / productionVolume.fact,
        consumptionImpact: energyBreakdown.gas.consumptionImpact / productionVolume.fact,
      },
      electricity: {
        priceImpact: energyBreakdown.electricity.priceImpact / productionVolume.fact,
        consumptionImpact: energyBreakdown.electricity.consumptionImpact / productionVolume.fact,
      },
      fuel: {
        priceImpact: energyBreakdown.fuel.priceImpact / productionVolume.fact,
        consumptionImpact: energyBreakdown.fuel.consumptionImpact / productionVolume.fact,
      },
    },
    salaryImpact,
    gasImpact,
    electricityImpact,
    fuelImpact,
  };
}
