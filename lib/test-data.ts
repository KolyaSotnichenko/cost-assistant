/**
 * Тестові дані для системи факторного аналізу собівартості бройлера
 * Використовуйте ці дані для тестування API або UI
 */

import type { EggInput, FeedInput, BudgetInput } from "@/lib/types";

// ==================== БЛОК 1: ЯЙЦЕ В СОБІВАРТОСТІ ТУШКИ ====================

export const eggTestData: EggInput = {
  eggPrice: { 
    plan: 2.50,  // Ціна 1 яйця (грн)
    fact: 2.75 
  },
  sorting: { 
    plan: 95.0,  // Сортування (%)
    fact: 93.5 
  },
  hatchability: { 
    plan: 85.0,  // Вивід (%)
    fact: 83.5 
  },
  survivability: { 
    plan: 98.0,  // Збереженість (%)
    fact: 97.2 
  },
  liveWeight: { 
    plan: 2.50,  // Жива вага при забої (кг)
    fact: 2.58 
  },
  carcassYield: { 
    plan: 75.0,  // Вихід тушки (%)
    fact: 74.2 
  },
};

// ==================== БЛОК 2: КОРМ В СОБІВАРТОСТІ ТУШКИ ====================

export const feedTestData: FeedInput = {
  feedPrice: {
    start: { 
      plan: 18.50,  // Вартість 1 кг корму - Старт (грн)
      fact: 19.20 
    },
    growth: { 
      plan: 16.00,  // Вартість 1 кг корму - Ріст (грн)
      fact: 16.50 
    },
    finish: { 
      plan: 14.50,  // Вартість 1 кг корму - Фініш (грн)
      fact: 14.80 
    },
  },
  feedConsumption: {
    start: { 
      plan: 0.45,  // Витрати корму Старт (кг/гол)
      fact: 0.48 
    },
    growth: { 
      plan: 1.20,  // Витрати корму Ріст (кг/гол)
      fact: 1.25 
    },
    finish: { 
      plan: 2.80,  // Витрати корму Фініш (кг/гол)
      fact: 2.75 
    },
  },
  fcr: { 
    plan: 1.70,  // FCR загальний
    fact: 1.75 
  },
  liveWeight: { 
    plan: 2.50,  // Жива вага при забої (кг)
    fact: 2.58 
  },
  carcassYield: { 
    plan: 75.0,  // Вихід тушки (%)
    fact: 74.2 
  },
  // Додаткові фактори для розкладу FCR
  geneticPotential: { plan: 1.65, fact: 1.65 },
  feedQuality: { plan: 1.0, fact: 1.05 },
  housingConditions: { plan: 1.0, fact: 1.03 },
  diseaseRate: { plan: 1.0, fact: 1.02 },
};

// ==================== БЛОК 3: БЮДЖЕТ ВИТРАТ ====================

export const budgetTestData: BudgetInput = {
  productionVolume: {
    plan: 500000,  // Обсяг виробництва (кг)
    fact: 515000,
  },

  // Інкубація
  incubation: {
    salary: { plan: 450000, fact: 470000 },  // Оплата праці з нарахуваннями
    energy: {
      gas: { 
        price: { plan: 8.50, fact: 9.20 },  // Ціна газу (грн/м³)
        consumption: { plan: 32941, fact: 33696 },  // Споживання (м³)
      },
      electricity: {
        price: { plan: 4.20, fact: 4.50 },  // Ціна електроенергії (грн/кВт)
        consumption: { plan: 42857, fact: 43333 },  // Споживання (кВт)
      },
      fuel: {
        price: { plan: 42.00, fact: 45.00 },  // Ціна ПММ (грн/л)
        consumption: { plan: 2024, fact: 2044 },  // Споживання (л)
      },
    },
    logistics: { plan: 120000, fact: 125000 },
    vetPreparations: { plan: 80000, fact: 85000 },
    repairs: { plan: 50000, fact: 65000 },
    other: { plan: 35000, fact: 38000 },
  },

  // Вирощування
  growing: {
    salary: { plan: 1200000, fact: 1250000 },
    energy: {
      gas: { 
        price: { plan: 8.50, fact: 9.20 },
        consumption: { plan: 211765, fact: 228261 },
      },
      electricity: {
        price: { plan: 4.20, fact: 4.50 },
        consumption: { plan: 154762, fact: 160000 },
      },
      fuel: {
        price: { plan: 42.00, fact: 45.00 },
        consumption: { plan: 7619, fact: 7778 },
      },
    },
    logistics: { plan: 280000, fact: 295000 },
    vetPreparations: { plan: 450000, fact: 520000 },
    repairs: { plan: 180000, fact: 195000 },
    other: { plan: 120000, fact: 135000 },
  },

  // Забій
  slaughter: {
    salary: { plan: 850000, fact: 900000 },
    energy: {
      gas: { 
        price: { plan: 8.50, fact: 9.20 },
        consumption: { plan: 49412, fact: 52174 },
      },
      electricity: {
        price: { plan: 4.20, fact: 4.50 },
        consumption: { plan: 90476, fact: 93333 },
      },
      fuel: {
        price: { plan: 42.00, fact: 45.00 },
        consumption: { plan: 3571, fact: 3667 },
      },
    },
    logistics: { plan: 180000, fact: 195000 },
    vetPreparations: { plan: 95000, fact: 105000 },
    repairs: { plan: 75000, fact: 82000 },
    other: { plan: 65000, fact: 72000 },
  },

  // ЦТФ (Цех технічних жирів)
  ctf: {
    salary: { plan: 280000, fact: 300000 },
    energy: {
      gas: { 
        price: { plan: 8.50, fact: 9.20 },
        consumption: { plan: 21176, fact: 21739 },
      },
      electricity: {
        price: { plan: 4.20, fact: 4.50 },
        consumption: { plan: 52381, fact: 54444 },
      },
      fuel: {
        price: { plan: 42.00, fact: 45.00 },
        consumption: { plan: 2262, fact: 2333 },
      },
    },
    logistics: { plan: 120000, fact: 130000 },
    vetPreparations: { plan: 35000, fact: 38000 },
    repairs: { plan: 45000, fact: 52000 },
    other: { plan: 25000, fact: 28000 },
    // Доходи ЦТФ (мінус витрати)
    ctfIncome: {
      flour: { 
        plan: 450000,  // Доходи від борошна
        fact: 480000 
      },
      fat: { 
        plan: 680000,  // Доходи від жиру
        fact: 720000 
      },
    },
  },
};

// ==================== КОМПЛЕКТ ДЛЯ ПОВНОГО АНАЛІЗУ ====================

export const fullAnalysisTestData = {
  eggInput: eggTestData,
  feedInput: feedTestData,
  budgetInput: budgetTestData,
};

// ==================== ПРИКЛАД ЗАПИТУ ДЛЯ API ====================

/**
 * Приклад curl запиту:
 * 
 * curl -X POST http://localhost:3000/api/analyze \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "eggInput": {
 *       "eggPrice": { "plan": 2.5, "fact": 2.75 },
 *       "sorting": { "plan": 95, "fact": 93.5 },
 *       "hatchability": { "plan": 85, "fact": 83.5 },
 *       "survivability": { "plan": 98, "fact": 97.2 },
 *       "liveWeight": { "plan": 2.5, "fact": 2.58 },
 *       "carcassYield": { "plan": 75, "fact": 74.2 }
 *     }
 *   }'
 */

// ==================== ОЧІКУВАНІ РЕЗУЛЬТАТИ (орієнтовно) ====================

/**
 * Для яйця:
 * - Планова вартість яйця на 1 кг тушки: ~0.088 грн/кг
 * - Фактична вартість яйця на 1 кг тушки: ~0.098 грн/кг
 * - Відхилення: +0.010 грн/кг (негативний вплив)
 * - Основні фактори: зростання ціни яйця, погіршення виводу
 *
 * Для корму:
 * - Планова вартість корму на 1 кг тушки: ~6.10 грн/кг
 * - Фактична вартість корму на 1 кг тушки: ~6.45 грн/кг
 * - Відхилення: +0.35 грн/кг (негативний вплив)
 * - Основні фактори: зростання цін на корм, погіршення FCR
 *
 * Для бюджету:
 * - Загальне відхилення: ~+0.15 грн/кг
 * - Основні фактори: зростання цін на енергоносії
 */
