/**
 * Бібліотека розрахунків для факторного аналізу
 * Використовує метод ланцюгових підстановок
 */

import type {
  PlanFact,
  FactorImpact,
  EggInput,
  FeedInput,
  EnergyCarrier,
} from "./types";

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================

/**
 * Розрахунок відхилення
 */
export function calculateDeviation(plan: number, fact: number): number {
  return fact - plan;
}

/**
 * Розрахунок відхилення у відсотках
 */
export function calculateDeviationPercent(
  plan: number,
  fact: number,
  base?: number
): number {
  const baseValue = base ?? plan;
  if (baseValue === 0) return 0;
  return ((fact - plan) / Math.abs(baseValue)) * 100;
}

/**
 * Визначення оцінки фактору (позитивний/негативний)
 * Для витрат: збільшення = негативний, зменшення = позитивний
 */
export function evaluateFactor(
  impact: number,
  isCost: boolean = true
): "positive" | "negative" | "neutral" {
  if (Math.abs(impact) < 0.0001) return "neutral";
  if (isCost) {
    return impact > 0 ? "negative" : "positive";
  }
  return impact > 0 ? "positive" : "negative";
}

// ==================== МЕТОД ЛАНЦЮГОВИХ ПІДСТАНОВОК ====================

/**
 * Класичний метод ланцюгових підстановок
 *
 * Формула: Y = a × b × c × d
 *
 * Базове значення: Y0 = a0 × b0 × c0 × d0
 * Фактичне значення: Y1 = a1 × b1 × c1 × d1
 *
 * Вплив факторів:
 * ∆a = a1 × b0 × c0 × d0 - Y0
 * ∆b = a1 × b1 × c0 × d0 - a1 × b0 × c0 × d0
 * ∆c = a1 × b1 × c1 × d0 - a1 × b1 × c0 × d0
 * ∆d = a1 × b1 × c1 × d1 - a1 × b1 × c1 × d0 = Y1 - попереднє
 */

export interface ChainSubstitutionFactor {
  name: string;
  planValue: number;
  factValue: number;
}

export interface ChainSubstitutionResult {
  baseValue: number;
  factValue: number;
  totalDeviation: number;
  factors: Array<{
    name: string;
    impact: number;
    impactPercent: number;
  }>;
  validation: {
    sumOfFactors: number;
    difference: number;
    isValid: boolean;
  };
}

/**
 * Виконує розклад методом ланцюгових підстановок
 * @param factors Масив факторів з плановими та фактичними значеннями
 * @param computeFunction Функція обчислення результату з масиву значень
 */
export function chainSubstitution(
  factors: ChainSubstitutionFactor[],
  computeFunction: (values: number[]) => number
): ChainSubstitutionResult {
  const planValues = factors.map((f) => f.planValue);
  const factValues = factors.map((f) => f.factValue);

  const baseValue = computeFunction(planValues);
  const factValue = computeFunction(factValues);
  const totalDeviation = factValue - baseValue;

  const factorImpacts: Array<{ name: string; impact: number }> = [];

  // Базове значення
  let previousValue = baseValue;

  for (let i = 0; i < factors.length; i++) {
    // Створюємо проміжний набір значень
    const intermediateValues = [
      ...factValues.slice(0, i + 1),
      ...planValues.slice(i + 1),
    ];

    const currentValue = computeFunction(intermediateValues);
    const impact = currentValue - previousValue;

    factorImpacts.push({
      name: factors[i].name,
      impact,
    });

    previousValue = currentValue;
  }

  // Розрахунок відсотків
  const factorsWithPercent = factorImpacts.map((f) => ({
    ...f,
    impactPercent: totalDeviation !== 0 ? (f.impact / totalDeviation) * 100 : 0,
  }));

  const sumOfFactors = factorImpacts.reduce((sum, f) => sum + f.impact, 0);
  const difference = Math.abs(totalDeviation - sumOfFactors);

  return {
    baseValue,
    factValue,
    totalDeviation,
    factors: factorsWithPercent,
    validation: {
      sumOfFactors,
      difference,
      isValid: difference < 0.0001,
    },
  };
}

// ==================== БЛОК 1: ЯЙЦЕ В СОБІВАРТОСТІ ТУШКИ ====================

/**
 * Розрахунок вартості яйця на 1 кг тушки
 *
 * Формула:
 * Вартість яйця на 1 кг тушки =
 *   Ціна 1 яйця ÷ Сортування (%) ÷ Вивід (%) ÷ Збереженість (%)
 *   ÷ Жива вага при забої (кг) × Вихід тушки (%)
 */
export function calculateEggCostPerKg(
  eggPrice: number,
  sorting: number,
  hatchability: number,
  survivability: number,
  liveWeight: number,
  carcassYield: number
): number {
  // Переводимо відсотки в коефіцієнти
  const sortingCoef = sorting / 100;
  const hatchabilityCoef = hatchability / 100;
  const survivabilityCoef = survivability / 100;
  const carcassYieldCoef = carcassYield / 100;

  return (
    (eggPrice /
      sortingCoef /
      hatchabilityCoef /
      survivabilityCoef /
      liveWeight) *
    carcassYieldCoef
  );
}

/**
 * Факторний аналіз вартості яйця методом ланцюгових підстановок
 */
export function analyzeEggCost(input: EggInput) {
  const factors: ChainSubstitutionFactor[] = [
    { name: "Ціна яйця", planValue: input.eggPrice.plan, factValue: input.eggPrice.fact },
    { name: "Сортування", planValue: input.sorting.plan, factValue: input.sorting.fact },
    { name: "Вивід", planValue: input.hatchability.plan, factValue: input.hatchability.fact },
    { name: "Збереженість", planValue: input.survivability.plan, factValue: input.survivability.fact },
    { name: "Жива вага", planValue: input.liveWeight.plan, factValue: input.liveWeight.fact },
    { name: "Вихід тушки", planValue: input.carcassYield.plan, factValue: input.carcassYield.fact },
  ];

  const result = chainSubstitution(factors, (values) => {
    const [eggPrice, sorting, hatchability, survivability, liveWeight, carcassYield] = values;
    return calculateEggCostPerKg(
      eggPrice,
      sorting,
      hatchability,
      survivability,
      liveWeight,
      carcassYield
    );
  });

  const eggCostPerKg: PlanFact = {
    plan: result.baseValue,
    fact: result.factValue,
    deviation: result.totalDeviation,
  };

  const factorImpacts: FactorImpact[] = result.factors.map((f) => ({
    factor: f.name,
    impactUahPerKg: f.impact,
    impactPercent: f.impactPercent,
    evaluation: evaluateFactor(f.impact),
  }));

  // Сортування за впливом
  factorImpacts.sort((a, b) => Math.abs(b.impactUahPerKg) - Math.abs(a.impactUahPerKg));

  return {
    eggCostPerKg,
    planValue: result.baseValue,
    factValue: result.factValue,
    totalDeviation: result.totalDeviation,
    factors: factorImpacts,
    validation: result.validation,
  };
}

// ==================== БЛОК 2: КОРМ В СОБІВАРТОСТІ ТУШКИ ====================

/**
 * Розрахунок зваженої вартості корму по фазах
 */
export function calculateWeightedFeedPrice(
  prices: { start: number; growth: number; finish: number },
  consumption: { start: number; growth: number; finish: number }
): number {
  const totalConsumption = consumption.start + consumption.growth + consumption.finish;
  if (totalConsumption === 0) return 0;

  return (
    (prices.start * consumption.start +
      prices.growth * consumption.growth +
      prices.finish * consumption.finish) /
    totalConsumption
  );
}

/**
 * Розрахунок вартості корму на 1 кг тушки
 *
 * Формула:
 * Вартість корму на 1 кг тушки =
 *   Вартість 1 кг корму (зважена) × FCR ÷ Вихід тушки (%)
 */
export function calculateFeedCostPerKg(
  weightedFeedPrice: number,
  fcr: number,
  carcassYield: number
): number {
  const carcassYieldCoef = carcassYield / 100;
  return (weightedFeedPrice * fcr) / carcassYieldCoef;
}

/**
 * Факторний аналіз вартості корму
 */
export function analyzeFeedCost(input: FeedInput) {
  // Розрахунок зваженої вартості корму
  const planWeightedPrice = calculateWeightedFeedPrice(
    {
      start: input.feedPrice.start.plan,
      growth: input.feedPrice.growth.plan,
      finish: input.feedPrice.finish.plan,
    },
    {
      start: input.feedConsumption.start.plan,
      growth: input.feedConsumption.growth.plan,
      finish: input.feedConsumption.finish.plan,
    }
  );

  const factWeightedPrice = calculateWeightedFeedPrice(
    {
      start: input.feedPrice.start.fact,
      growth: input.feedPrice.growth.fact,
      finish: input.feedPrice.finish.fact,
    },
    {
      start: input.feedConsumption.start.fact,
      growth: input.feedConsumption.growth.fact,
      finish: input.feedConsumption.finish.fact,
    }
  );

  // Фактори для ланцюгових підстановок
  const factors: ChainSubstitutionFactor[] = [
    { name: "Ціна корму (зважена)", planValue: planWeightedPrice, factValue: factWeightedPrice },
    { name: "FCR", planValue: input.fcr.plan, factValue: input.fcr.fact },
    { name: "Вихід тушки", planValue: input.carcassYield.plan, factValue: input.carcassYield.fact },
  ];

  const result = chainSubstitution(factors, (values) => {
    const [weightedPrice, fcr, carcassYield] = values;
    return calculateFeedCostPerKg(weightedPrice, fcr, carcassYield);
  });

  const feedCostPerKg: PlanFact = {
    plan: result.baseValue,
    fact: result.factValue,
    deviation: result.totalDeviation,
  };

  const factorImpacts: FactorImpact[] = result.factors.map((f) => ({
    factor: f.name,
    impactUahPerKg: f.impact,
    impactPercent: f.impactPercent,
    evaluation: evaluateFactor(f.impact),
  }));

  // Додаємо вплив цін по фазах окремо
  const phasePriceImpacts = calculateFeedPhasePriceImpact(input);
  phasePriceImpacts.forEach((impact) => factorImpacts.push(impact));

  factorImpacts.sort((a, b) => Math.abs(b.impactUahPerKg) - Math.abs(a.impactUahPerKg));

  return {
    feedCostPerKg,
    weightedFeedPrice: {
      plan: planWeightedPrice,
      fact: factWeightedPrice,
      deviation: factWeightedPrice - planWeightedPrice,
    },
    planValue: result.baseValue,
    factValue: result.factValue,
    totalDeviation: result.totalDeviation,
    factors: factorImpacts,
    validation: result.validation,
  };
}

/**
 * Розрахунок впливу цін корму по фазах
 */
function calculateFeedPhasePriceImpact(input: FeedInput): FactorImpact[] {
  const totalConsumptionPlan =
    input.feedConsumption.start.plan +
    input.feedConsumption.growth.plan +
    input.feedConsumption.finish.plan;

  const totalConsumptionFact =
    input.feedConsumption.start.fact +
    input.feedConsumption.growth.fact +
    input.feedConsumption.finish.fact;

  const avgConsumption = (totalConsumptionPlan + totalConsumptionFact) / 2;
  if (avgConsumption === 0) return [];

  const impacts: FactorImpact[] = [];

  // Старт
  const startPriceImpact =
    (input.feedPrice.start.fact - input.feedPrice.start.plan) *
    (input.feedConsumption.start.fact / avgConsumption);
  impacts.push({
    factor: "Ціна корму - Старт",
    impactUahPerKg: startPriceImpact,
    impactPercent: 0,
    evaluation: evaluateFactor(startPriceImpact),
  });

  // Ріст
  const growthPriceImpact =
    (input.feedPrice.growth.fact - input.feedPrice.growth.plan) *
    (input.feedConsumption.growth.fact / avgConsumption);
  impacts.push({
    factor: "Ціна корму - Ріст",
    impactUahPerKg: growthPriceImpact,
    impactPercent: 0,
    evaluation: evaluateFactor(growthPriceImpact),
  });

  // Фініш
  const finishPriceImpact =
    (input.feedPrice.finish.fact - input.feedPrice.finish.plan) *
    (input.feedConsumption.finish.fact / avgConsumption);
  impacts.push({
    factor: "Ціна корму - Фініш",
    impactUahPerKg: finishPriceImpact,
    impactPercent: 0,
    evaluation: evaluateFactor(finishPriceImpact),
  });

  return impacts;
}

// ==================== БЛОК 3: ЕНЕРГОНОСІЇ ====================

/**
 * Розклад відхилення енергоносія на ціну та споживання
 *
 * ∆ = ∆Ціна × Факт.споживання + ∆Споживання × План.ціна
 */
export function analyzeEnergyCarrier(
  pricePlan: number,
  priceFact: number,
  consumptionPlan: number,
  consumptionFact: number
): {
  totalDeviation: number;
  priceImpact: number;
  consumptionImpact: number;
} {
  const priceDeviation = priceFact - pricePlan;
  const consumptionDeviation = consumptionFact - consumptionPlan;

  const priceImpact = priceDeviation * consumptionFact;
  const consumptionImpact = consumptionDeviation * pricePlan;
  const totalDeviation = priceImpact + consumptionImpact;

  return {
    totalDeviation,
    priceImpact,
    consumptionImpact,
  };
}

/**
 * Аналіз енергоносіїв для бюджету
 */
export function analyzeBudgetEnergy(energy: EnergyCarrier): {
  gas: { total: number; priceImpact: number; consumptionImpact: number };
  electricity: { total: number; priceImpact: number; consumptionImpact: number };
  fuel: { total: number; priceImpact: number; consumptionImpact: number };
} {
  const gasAnalysis = analyzeEnergyCarrier(
    energy.gas.price.plan,
    energy.gas.price.fact,
    energy.gas.consumption.plan,
    energy.gas.consumption.fact
  );

  const electricityAnalysis = analyzeEnergyCarrier(
    energy.electricity.price.plan,
    energy.electricity.price.fact,
    energy.electricity.consumption.plan,
    energy.electricity.consumption.fact
  );

  const fuelAnalysis = analyzeEnergyCarrier(
    energy.fuel.price.plan,
    energy.fuel.price.fact,
    energy.fuel.consumption.plan,
    energy.fuel.consumption.fact
  );

  return {
    gas: {
      total: gasAnalysis.totalDeviation,
      priceImpact: gasAnalysis.priceImpact,
      consumptionImpact: gasAnalysis.consumptionImpact,
    },
    electricity: {
      total: electricityAnalysis.totalDeviation,
      priceImpact: electricityAnalysis.priceImpact,
      consumptionImpact: electricityAnalysis.consumptionImpact,
    },
    fuel: {
      total: fuelAnalysis.totalDeviation,
      priceImpact: fuelAnalysis.priceImpact,
      consumptionImpact: fuelAnalysis.consumptionImpact,
    },
  };
}

// ==================== БЛОК 5: КОМБІКОМБИ ====================

/**
 * Розрахунок вартості 1 кг комбікорму за рецептурою
 */
export function calculateFeedRecipeCost(
  ingredients: Array<{ price: number; share: number }>
): number {
  return ingredients.reduce((sum, ing) => {
    const shareCoef = ing.share / 100;
    return sum + ing.price * shareCoef;
  }, 0);
}

/**
 * Аналіз впливу ціни та рецептури по кожному інгредієнту
 *
 * ∆ по інгредієнту = ∆Ціна × Факт.питома вага + ∆Питома вага × План.ціна
 */
export function analyzeIngredientImpact(
  pricePlan: number,
  priceFact: number,
  sharePlan: number,
  shareFact: number
): {
  totalImpact: number;
  priceImpact: number;
  recipeImpact: number;
} {
  const priceDeviation = priceFact - pricePlan;
  const shareDeviation = shareFact - sharePlan;

  const priceImpact = priceDeviation * (shareFact / 100);
  const recipeImpact = shareDeviation * (pricePlan / 100);
  const totalImpact = priceImpact + recipeImpact;

  return {
    totalImpact,
    priceImpact,
    recipeImpact,
  };
}

// ==================== УЗАГАЛЬНЕНІ ФУНКЦІЇ ====================

/**
 * Генерація висновку на основі факторів
 */
export function generateConclusion(
  factors: FactorImpact[],
  totalDeviation: number,
  itemName: string
): string {
  if (factors.length === 0) {
    return "Недостатньо даних для аналізу.";
  }

  const topNegative = factors
    .filter((f) => f.evaluation === "negative")
    .slice(0, 2);
  const topPositive = factors
    .filter((f) => f.evaluation === "positive")
    .slice(0, 2);

  let conclusion = `${itemName}: загальне відхилення ${totalDeviation >= 0 ? "+" : ""}${totalDeviation.toFixed(4)} грн/кг. `;

  if (topNegative.length > 0) {
    conclusion += `Основні негативні фактори: ${topNegative
      .map((f) => `${f.factor} (${f.impactUahPerKg.toFixed(4)} грн/кг)`).join(", ")}. `;
  }

  if (topPositive.length > 0) {
    conclusion += `Позитивно вплинули: ${topPositive
      .map((f) => `${f.factor} (${Math.abs(f.impactUahPerKg).toFixed(4)} грн/кг)`).join(", ")}.`;
  }

  return conclusion;
}

/**
 * Генерація рекомендацій на основі факторів
 */
export function generateRecommendations(factors: FactorImpact[]): string[] {
  const recommendations: string[] = [];

  factors
    .filter((f) => f.evaluation === "negative")
    .slice(0, 3)
    .forEach((f) => {
      recommendations.push(generateRecommendationForFactor(f));
    });

  return recommendations;
}

/**
 * Генерація рекомендації для конкретного фактору
 */
function generateRecommendationForFactor(factor: FactorImpact): string {
  const factorLower = factor.factor.toLowerCase();

  if (factorLower.includes("ціна")) {
    return `Оптимізувати закупівельну ціну: ${factor.factor} - переглянути умови постачання або знайти альтернативних постачальників. Очікуваний ефект: ${Math.abs(factor.impactUahPerKg).toFixed(4)} грн/кг.`;
  }

  if (factorLower.includes("фцр") || factorLower.includes("конверсі")) {
    return `Покращити FCR: переглянути програму годівлі, контролювати умови утримання. Очікуваний ефект: ${Math.abs(factor.impactUahPerKg).toFixed(4)} грн/кг.`;
  }

  if (factorLower.includes("вивід") || factorLower.includes("сортуванн")) {
    return `Покращити показники інкубації: контролювати параметри інкубації, якість яйця. Очікуваний ефект: ${Math.abs(factor.impactUahPerKg).toFixed(4)} грн/кг.`;
  }

  if (factorLower.includes("збереженіст") || factorLower.includes("відхід")) {
    return `Зменшити відхід: посилити ветеринарний контроль, оптимізувати умови утримання. Очікуваний ефект: ${Math.abs(factor.impactUahPerKg).toFixed(4)} грн/кг.`;
  }

  if (factorLower.includes("споживанн")) {
    return `Зменшити споживання ресурсу: впровадити енергозберігаючі технології, контролювати режими роботи. Очікуваний ефект: ${Math.abs(factor.impactUahPerKg).toFixed(4)} грн/кг.`;
  }

  return `Оптимізувати ${factor.factor.toLowerCase()}: переглянути процеси та виявити резерви. Очікуваний ефект: ${Math.abs(factor.impactUahPerKg).toFixed(4)} грн/кг.`;
}
