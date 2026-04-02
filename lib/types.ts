/**
 * Типи для системи факторного аналізу собівартості бройлера
 */

// ==================== СПІЛЬНІ ТИПИ ====================

export interface PlanFact<T = number> {
  plan: T;
  fact: T;
  deviation?: T;
}

export interface FactorImpact {
  factor: string;
  impactUahPerKg: number;
  impactPercent: number;
  evaluation: "positive" | "negative" | "neutral";
}

export interface AnalysisResult {
  planValue: number;
  factValue: number;
  totalDeviation: number;
  factors: FactorImpact[];
  validation: {
    sumOfFactors: number;
    isValid: boolean;
  };
  conclusion: string;
  recommendations: string[];
}

// ==================== БЛОК 1: ЯЙЦЕ В СОБІВАРТОСТІ ТУШКИ ====================

export interface EggInput {
  eggPrice: PlanFact; // Ціна 1 яйця (грн)
  sorting: PlanFact; // Сортування (%)
  hatchability: PlanFact; // Вивід (%)
  survivability: PlanFact; // Збереженість (%)
  liveWeight: PlanFact; // Жива вага при забої (кг)
  carcassYield: PlanFact; // Вихід тушки (%)
}

export interface EggAnalysis extends AnalysisResult {
  eggCostPerKgCarcass: PlanFact; // Вартість яйця на 1 кг тушки
  llmReport?: string; // Звіт від LLM
}

// ==================== БЛОК 2: КОРМ В СОБІВАРТОСТІ ТУШКИ ====================

export interface FeedPhaseData {
  start: PlanFact; // Старт
  growth: PlanFact; // Ріст
  finish: PlanFact; // Фініш
}

export interface FeedInput {
  feedPrice: FeedPhaseData; // Вартість 1 кг корму по фазах (грн)
  feedConsumption: FeedPhaseData; // Витрати корму (кг/гол) по фазах
  fcr: PlanFact; // FCR загальний
  liveWeight: PlanFact; // Жива вага при забої (кг)
  carcassYield: PlanFact; // Вихід тушки (%)
  // Додаткові фактори для розкладу FCR
  geneticPotential?: PlanFact; // Генетичний потенціал
  feedQuality?: PlanFact; // Якість корму
  housingConditions?: PlanFact; // Умови утримання
  diseaseRate?: PlanFact; // Захворюваність
}

export interface FeedAnalysis extends AnalysisResult {
  feedCostPerKgCarcass: PlanFact; // Вартість корму на 1 кг тушки
  weightedFeedPrice: PlanFact; // Зважена вартість 1 кг корму
  fcrBreakdown?: {
    genetic: number;
    feedQuality: number;
    housing: number;
    disease: number;
  };
  llmReport?: string; // Звіт від LLM
}

// ==================== БЛОК 3: БЮДЖЕТ ВИТРАТ ПО НАПРЯМКАХ ====================

export type BudgetDirection = "incubation" | "growing" | "slaughter" | "ctf";

export interface EnergyCarrierData {
  price: PlanFact;
  consumption: PlanFact;
}

export interface EnergyCarrier {
  gas: EnergyCarrierData;
  electricity: EnergyCarrierData;
  fuel: EnergyCarrierData;
}

export interface BudgetDirectionInput {
  salary: PlanFact; // Оплата праці з нарахуваннями
  energy: EnergyCarrier;
  logistics: PlanFact; // Логістика
  vetPreparations: PlanFact; // Вет.препарати + деззасоби
  repairs: PlanFact; // Поточні ремонти
  other: PlanFact; // Інші витрати
  ctfIncome?: {
    flour: PlanFact; // Доходи від борошна
    fat: PlanFact; // Доходи від жиру
  };
}

export interface BudgetInput {
  incubation: BudgetDirectionInput;
  growing: BudgetDirectionInput;
  slaughter: BudgetDirectionInput;
  ctf: BudgetDirectionInput;
  productionVolume: PlanFact; // Обсяг виробництва (кг)
}

export interface BudgetAnalysis {
  directions: {
    [key in BudgetDirection]: {
      total: PlanFact;
      deviation: number;
      mainFactor: string;
      energyBreakdown: {
        gas: { priceImpact: number; consumptionImpact: number };
        electricity: { priceImpact: number; consumptionImpact: number };
        fuel: { priceImpact: number; consumptionImpact: number };
      };
    };
  };
  top5Factors: FactorImpact[];
  conclusion: string;
  recommendations: string[];
  llmReport?: string; // Звіт від LLM
}

// ==================== БЛОК 4: ВАРТІСТЬ 1 ІНКУБАЦІЙНОГО ЯЙЦЯ (БС) ====================

export interface ParentFlockProductivity {
  flockSize: PlanFact; // Поголів'я БС (кур-несучок)
  eggProduction: PlanFact; // Яєценосність (яєць/несучку за міс.)
  totalEggs: PlanFact; // Загальна кількість яєць
  mortality: PlanFact; // Відхід БС (%)
  fcr: PlanFact; // FCR батьківського стада
}

export interface ParentFlockCosts {
  dayOldChick: PlanFact & { quantity: PlanFact; price: PlanFact }; // Добове курча БС
  feed: PlanFact & { quantity: PlanFact; price: PlanFact }; // Комбікорм БС
  salary: PlanFact; // Оплата праці
  energy: EnergyCarrier;
  vetPreparations: PlanFact;
  logistics: PlanFact;
  repairs: PlanFact;
  other: PlanFact;
  cullingIncome: PlanFact; // Доходи від вибракування
  amortization: PlanFact; // Амортизація
}

export interface EggCostInput {
  productivity: ParentFlockProductivity;
  costs: ParentFlockCosts;
}

export interface EggCostAnalysis extends AnalysisResult {
  costPerEgg: PlanFact; // Собівартість 1 яйця
  totalFlockCost: PlanFact; // Всі витрати на утримання БС
}

// ==================== БЛОК 5: ВАРТІСТЬ КОМБІКОРМУ ====================

export interface Ingredient {
  name: string;
  price: PlanFact;
  share: PlanFact; // Частка % в рецептурі
  impact: {
    price: number;
    recipe: number;
    total: number;
  };
}

export interface FeedMillInput {
  feedType: "parent_flock" | "broiler_start" | "broiler_growth" | "broiler_finish";
  ingredients: Ingredient[];
  feedMillCosts: {
    salary: PlanFact;
    energy: EnergyCarrier;
    logistics: PlanFact;
    repairs: PlanFact;
    other: PlanFact;
  };
}

export interface FeedMillAnalysis extends AnalysisResult {
  costPerKgFeed: PlanFact; // Вартість 1 кг комбікорму
  rawMaterialCost: PlanFact; // Вартість сировини
  feedMillCost: PlanFact; // Витрати ККЗ
  recipeChangeAnalysis: {
    changed: boolean;
    description: string;
    fcrImpact: string;
  };
}

// ==================== БЛОК 6: ЗВЕДЕНИЙ АНАЛІЗ ====================

export interface WaterfallItem {
  name: string;
  value: number;
  cumulative: number;
  type: "positive" | "negative";
}

export interface CrossCuttingFactors {
  liveWeight: PlanFact; // Жива вага при забої (кг)
  carcassYield: PlanFact; // Вихід тушки (%)
  productionVolume: PlanFact; // Обсяг виробництва (кг)
}

export interface SummaryInput {
  egg: {
    total: PlanFact;
    factors: {
      price: number;
      sorting: number;
      hatchability: number;
      survivability: number;
    };
  };
  feed: {
    total: PlanFact;
    factors: {
      price: number;
      fcr: number;
      recipe: number;
    };
  };
  incubation: {
    total: PlanFact;
    factors: {
      electricityPrice: number;
      electricityConsumption: number;
      gasPrice: number;
      gasConsumption: number;
    };
  };
  growing: {
    total: PlanFact;
    factors: {
      electricityPrice: number;
      electricityConsumption: number;
      gasPrice: number;
      gasConsumption: number;
      fuelPrice: number;
      fuelConsumption: number;
    };
  };
  slaughter: {
    total: PlanFact;
    factors: {
      energy: number;
      other: number;
    };
  };
  ctf: {
    total: PlanFact;
    factors: {
      costs: number;
      income: number;
    };
  };
  crossCutting: CrossCuttingFactors;
}

export interface SummaryAnalysis {
  totalCostPerKg: PlanFact; // Собівартість 1 кг тушки
  waterfall: WaterfallItem[];
  top3Negative: FactorImpact[];
  top3Positive: FactorImpact[];
  factorNature: {
    external: number; // Зовнішні (не контролюємо)
    internal: number; // Внутрішні (контролюємо)
  };
  managementConclusion: {
    totalDeviation: number;
    deviationPercent: number;
    externalFactors: number;
    internalFactors: number;
    priorities: Array<{
      factor: string;
      impact: number;
      responsible: string;
    }>;
  };
  llmReport?: string; // Звіт від LLM
}

// ==================== ТИПИ ДЛЯ LANGGRAPH ====================

export interface AgentState {
  // Вхідні дані
  eggInput?: EggInput;
  feedInput?: FeedInput;
  budgetInput?: BudgetInput;
  eggCostInput?: EggCostInput;
  feedMillInput?: FeedMillInput;
  
  // Результати аналізу
  eggAnalysis?: EggAnalysis;
  feedAnalysis?: FeedAnalysis;
  budgetAnalysis?: BudgetAnalysis;
  eggCostAnalysis?: EggCostAnalysis;
  feedMillAnalysis?: FeedMillAnalysis;
  summaryAnalysis?: SummaryAnalysis;
  
  // Проміжні дані для передачі між агентами
  messages?: string[];
  currentStep?: string;
  errors?: string[];
}

export type AgentName = 
  | "egg" 
  | "feed" 
  | "budget" 
  | "egg_cost" 
  | "feed_mill" 
  | "summary";
