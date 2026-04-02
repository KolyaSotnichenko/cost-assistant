/**
 * API Route для запуску повного факторного аналізу
 * POST /api/analyze
 */

import { NextRequest, NextResponse } from "next/server";
import { runFullAnalysis } from "@/agents/orchestrator";
import type { EggInput, FeedInput, BudgetInput } from "@/lib/types";

export interface AnalyzeRequest {
  eggInput?: EggInput;
  feedInput?: FeedInput;
  budgetInput?: BudgetInput;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: {
    eggAnalysis?: any;
    feedAnalysis?: any;
    budgetAnalysis?: any;
    summaryAnalysis?: any;
    messages: string[];
  };
  error?: string;
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eggInput, feedInput, budgetInput } = body as AnalyzeRequest;

    // Валідація наявності хоча б одного входу
    if (!eggInput && !feedInput && !budgetInput) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: "Необхідно надати хоча б один набір вхідних даних (eggInput, feedInput або budgetInput)",
        },
        { status: 400 }
      );
    }

    // Запуск повного аналізу
    const result = await runFullAnalysis({
      eggInput: eggInput || null,
      feedInput: feedInput || null,
      budgetInput: budgetInput || null,
    });

    // Перевірка на помилки
    if (result.errors && result.errors.length > 0) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: "Помилки під час аналізу",
          errors: result.errors,
        },
        { status: 500 }
      );
    }

    // Формування відповіді
    const response: AnalyzeResponse = {
      success: true,
      data: {
        eggAnalysis: result.eggAnalysis,
        feedAnalysis: result.feedAnalysis,
        budgetAnalysis: result.budgetAnalysis,
        summaryAnalysis: result.summaryAnalysis,
        messages: result.messages || [],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API /api/analyze error:", error);
    
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Невідома помилка",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - інформація про API
 */
export async function GET() {
  return NextResponse.json({
    name: "Cost Assistant API",
    description: "Система факторного аналізу собівартості бройлера",
    endpoints: {
      "POST /api/analyze": {
        description: "Запуск факторного аналізу",
        body: {
          eggInput: "Об'єкт з даними для аналізу яйця (опціонально)",
          feedInput: "Об'єкт з даними для аналізу корму (опціонально)",
          budgetInput: "Об'єкт з даними для аналізу бюджету (опціонально)",
        },
      },
    },
    agents: [
      { name: "Egg Agent", description: "Аналіз вартості яйця в собівартості тушки" },
      { name: "Feed Agent", description: "Аналіз вартості корму в собівартості тушки" },
      { name: "Budget Agent", description: "Аналіз бюджету витрат по напрямках" },
      { name: "Summary Agent", description: "Зведений факторний аналіз" },
    ],
  });
}
