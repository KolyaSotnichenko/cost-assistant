# Тестові дані для API Cost Assistant

## Приклад 1: Аналіз яйця

```json
{
  "eggInput": {
    "eggPrice": { "plan": 2.50, "fact": 2.75 },
    "sorting": { "plan": 95.0, "fact": 93.5 },
    "hatchability": { "plan": 85.0, "fact": 83.5 },
    "survivability": { "plan": 98.0, "fact": 97.2 },
    "liveWeight": { "plan": 2.50, "fact": 2.58 },
    "carcassYield": { "plan": 75.0, "fact": 74.2 }
  }
}
```

**Очікуваний результат:**
- Планова вартість яйця: ~0.088 грн/кг
- Фактична вартість яйця: ~0.098 грн/кг
- Відхилення: +0.010 грн/кг

---

## Приклад 2: Аналіз корму

```json
{
  "feedInput": {
    "feedPrice": {
      "start": { "plan": 18.50, "fact": 19.20 },
      "growth": { "plan": 16.00, "fact": 16.50 },
      "finish": { "plan": 14.50, "fact": 14.80 }
    },
    "feedConsumption": {
      "start": { "plan": 0.45, "fact": 0.48 },
      "growth": { "plan": 1.20, "fact": 1.25 },
      "finish": { "plan": 2.80, "fact": 2.75 }
    },
    "fcr": { "plan": 1.70, "fact": 1.75 },
    "liveWeight": { "plan": 2.50, "fact": 2.58 },
    "carcassYield": { "plan": 75.0, "fact": 74.2 }
  }
}
```

**Очікуваний результат:**
- Планова вартість корму: ~6.10 грн/кг
- Фактична вартість корму: ~6.45 грн/кг
- Відхилення: +0.35 грн/кг

---

## Приклад 3: Повний аналіз (яйце + корм + бюджет)

```json
{
  "eggInput": {
    "eggPrice": { "plan": 2.50, "fact": 2.75 },
    "sorting": { "plan": 95.0, "fact": 93.5 },
    "hatchability": { "plan": 85.0, "fact": 83.5 },
    "survivability": { "plan": 98.0, "fact": 97.2 },
    "liveWeight": { "plan": 2.50, "fact": 2.58 },
    "carcassYield": { "plan": 75.0, "fact": 74.2 }
  },
  "feedInput": {
    "feedPrice": {
      "start": { "plan": 18.50, "fact": 19.20 },
      "growth": { "plan": 16.00, "fact": 16.50 },
      "finish": { "plan": 14.50, "fact": 14.80 }
    },
    "feedConsumption": {
      "start": { "plan": 0.45, "fact": 0.48 },
      "growth": { "plan": 1.20, "fact": 1.25 },
      "finish": { "plan": 2.80, "fact": 2.75 }
    },
    "fcr": { "plan": 1.70, "fact": 1.75 },
    "liveWeight": { "plan": 2.50, "fact": 2.58 },
    "carcassYield": { "plan": 75.0, "fact": 74.2 }
  },
  "budgetInput": {
    "productionVolume": { "plan": 500000, "fact": 515000 },
    "incubation": {
      "salary": { "plan": 450000, "fact": 470000 },
      "energy": {
        "gas": {
          "price": { "plan": 8.50, "fact": 9.20 },
          "consumption": { "plan": 32941, "fact": 33696 }
        },
        "electricity": {
          "price": { "plan": 4.20, "fact": 4.50 },
          "consumption": { "plan": 42857, "fact": 43333 }
        },
        "fuel": {
          "price": { "plan": 42.00, "fact": 45.00 },
          "consumption": { "plan": 2024, "fact": 2044 }
        }
      },
      "logistics": { "plan": 120000, "fact": 125000 },
      "vetPreparations": { "plan": 80000, "fact": 85000 },
      "repairs": { "plan": 50000, "fact": 65000 },
      "other": { "plan": 35000, "fact": 38000 }
    },
    "growing": {
      "salary": { "plan": 1200000, "fact": 1250000 },
      "energy": {
        "gas": {
          "price": { "plan": 8.50, "fact": 9.20 },
          "consumption": { "plan": 211765, "fact": 228261 }
        },
        "electricity": {
          "price": { "plan": 4.20, "fact": 4.50 },
          "consumption": { "plan": 154762, "fact": 160000 }
        },
        "fuel": {
          "price": { "plan": 42.00, "fact": 45.00 },
          "consumption": { "plan": 7619, "fact": 7778 }
        }
      },
      "logistics": { "plan": 280000, "fact": 295000 },
      "vetPreparations": { "plan": 450000, "fact": 520000 },
      "repairs": { "plan": 180000, "fact": 195000 },
      "other": { "plan": 120000, "fact": 135000 }
    },
    "slaughter": {
      "salary": { "plan": 850000, "fact": 900000 },
      "energy": {
        "gas": {
          "price": { "plan": 8.50, "fact": 9.20 },
          "consumption": { "plan": 49412, "fact": 52174 }
        },
        "electricity": {
          "price": { "plan": 4.20, "fact": 4.50 },
          "consumption": { "plan": 90476, "fact": 93333 }
        },
        "fuel": {
          "price": { "plan": 42.00, "fact": 45.00 },
          "consumption": { "plan": 3571, "fact": 3667 }
        }
      },
      "logistics": { "plan": 180000, "fact": 195000 },
      "vetPreparations": { "plan": 95000, "fact": 105000 },
      "repairs": { "plan": 75000, "fact": 82000 },
      "other": { "plan": 65000, "fact": 72000 }
    },
    "ctf": {
      "salary": { "plan": 280000, "fact": 300000 },
      "energy": {
        "gas": {
          "price": { "plan": 8.50, "fact": 9.20 },
          "consumption": { "plan": 21176, "fact": 21739 }
        },
        "electricity": {
          "price": { "plan": 4.20, "fact": 4.50 },
          "consumption": { "plan": 52381, "fact": 54444 }
        },
        "fuel": {
          "price": { "plan": 42.00, "fact": 45.00 },
          "consumption": { "plan": 2262, "fact": 2333 }
        }
      },
      "logistics": { "plan": 120000, "fact": 130000 },
      "vetPreparations": { "plan": 35000, "fact": 38000 },
      "repairs": { "plan": 45000, "fact": 52000 },
      "other": { "plan": 25000, "fact": 28000 },
      "ctfIncome": {
        "flour": { "plan": 450000, "fact": 480000 },
        "fat": { "plan": 680000, "fact": 720000 }
      }
    }
  }
}
```

---

## curl приклади

### Тест 1: Аналіз яйця

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "eggInput": {
      "eggPrice": {"plan": 2.5, "fact": 2.75},
      "sorting": {"plan": 95, "fact": 93.5},
      "hatchability": {"plan": 85, "fact": 83.5},
      "survivability": {"plan": 98, "fact": 97.2},
      "liveWeight": {"plan": 2.5, "fact": 2.58},
      "carcassYield": {"plan": 75, "fact": 74.2}
    }
  }'
```

### Тест 2: Повний аналіз

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d @test-full-analysis.json
```

---

## Опис полів

### Яйце (EggInput)
| Поле | Опис | Одиниця |
|------|------|---------|
| eggPrice | Ціна 1 яйця | грн |
| sorting | Сортування придатних яєць | % |
| hatchability | Вивід молодняку | % |
| survivability | Збереженість поголів'я | % |
| liveWeight | Жива вага при забої | кг |
| carcassYield | Вихід тушки | % |

### Корм (FeedInput)
| Поле | Опис | Одиниця |
|------|------|---------|
| feedPrice.start | Ціна корму Старт | грн/кг |
| feedPrice.growth | Ціна корму Ріст | грн/кг |
| feedPrice.finish | Ціна корму Фініш | грн/кг |
| feedConsumption.* | Витрати корму по фазах | кг/гол |
| fcr | Конверсія корму | кг корму/кг ваги |
| liveWeight | Жива вага при забої | кг |
| carcassYield | Вихід тушки | % |

### Бюджет (BudgetInput)
| Поле | Опис | Одиниця |
|------|------|---------|
| productionVolume | Обсяг виробництва | кг |
| *.salary | Оплата праці | грн |
| *.energy.gas.price | Ціна газу | грн/м³ |
| *.energy.gas.consumption | Споживання газу | м³ |
| *.energy.electricity.* | Електроенергія | грн/кВт, кВт |
| *.energy.fuel.* | ПММ | грн/л, л |
| *.logistics | Логістика | грн |
| *.vetPreparations | Ветпрепарати | грн |
| *.repairs | Ремонти | грн |
| *.other | Інші витрати | грн |
| ctf.ctfIncome | Доходи ЦТФ | грн |
