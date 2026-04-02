/**
 * API Route для запуску окремих агентів
 * POST /api/analyze/egg - аналіз яйця
 * POST /api/analyze/feed - аналіз корму
 * POST /api/analyze/budget - аналіз бюджету
 */

import { NextRequest, NextResponse } from "next/server";
import { runEggAgent } from "@/agents/egg-agent";
import { runFeedAgent } from "@/agents/feed-agent";
import { runBudgetAgent } from "@/agents/budget-agent";
import type { EggInput, FeedInput, BudgetInput } from "@/lib/types";

interface SingleAgentRequest<T> {
  input: T;
}

interface AgentResponse {
  success: boolean;
  data?: any;
  messages?: string[];
  error?: string;
  errors?: string[];
}

/**
 * POST /api/analyze/egg
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, agent } = body;

    if (!input) {
      return NextResponse.json<AgentResponse>(
        {
          success: false,
          error: "Вхідні дані (input) є обов'язковими",
        },
        { status: 400 }
      );
    }

    let response: AgentResponse;

    // Визначаємо якого агента запускати
    switch (agent) {
      case "egg": {
        const result = await runEggAgent(input as EggInput);
        if (result.errors && result.errors.length > 0) {
          return NextResponse.json<AgentResponse>(
            { success: false, error: "Помилки під час аналізу", errors: result.errors },
            { status: 500 }
          );
        }
        response = { success: true, data: result.eggAnalysis, messages: result.messages };
        break;
      }
      case "feed": {
        const result = await runFeedAgent(input as FeedInput);
        if (result.errors && result.errors.length > 0) {
          return NextResponse.json<AgentResponse>(
            { success: false, error: "Помилки під час аналізу", errors: result.errors },
            { status: 500 }
          );
        }
        response = { success: true, data: result.feedAnalysis, messages: result.messages };
        break;
      }
      case "budget": {
        const result = await runBudgetAgent(input as BudgetInput);
        if (result.errors && result.errors.length > 0) {
          return NextResponse.json<AgentResponse>(
            { success: false, error: "Помилки під час аналізу", errors: result.errors },
            { status: 500 }
          );
        }
        response = { success: true, data: result.budgetAnalysis, messages: result.messages };
        break;
      }
      default:
        return NextResponse.json<AgentResponse>(
          { success: false, error: "Невідомий агент. Доступні: egg, feed, budget" },
          { status: 400 }
        );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("API /api/analyze/* error:", error);
    
    return NextResponse.json<AgentResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Невідома помилка",
      },
      { status: 500 }
    );
  }
}
