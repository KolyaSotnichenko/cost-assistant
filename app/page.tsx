"use client";

import { useState } from "react";
import { EggForm } from "@/components/forms/egg-form";
import { FeedForm } from "@/components/forms/feed-form";
import { AnalysisResults } from "@/components/results/analysis-results";
import { Button } from "@/components/ui/button";
import { eggTestData, feedTestData, budgetTestData } from "@/lib/test-data";
import type { EggInput, FeedInput, BudgetInput } from "@/lib/types";
import type { AnalyzeResponse } from "@/app/api/analyze/route";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AnalyzeResponse["data"] | null>(null);

  const handleEggSubmit = async (data: EggInput) => {
    await runAnalysis({ eggInput: data });
  };

  const handleFeedSubmit = async (data: FeedInput) => {
    await runAnalysis({ feedInput: data });
  };

  const runFullTest = async () => {
    await runAnalysis({
      eggInput: eggTestData,
      feedInput: feedTestData,
      budgetInput: budgetTestData,
    });
  };

  const runAnalysis = async (inputs: {
    eggInput?: EggInput;
    feedInput?: FeedInput;
    budgetInput?: BudgetInput;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || "Невідома помилка");
        if (result.errors) {
          console.error("Errors:", result.errors);
        }
      } else {
        setResponse(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка з'єднання з сервером");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-zinc-950/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">
            📊 Cost Assistant - Факторний аналіз собівартості бройлера
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Кнопка швидкого тесту */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={runFullTest} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Аналіз..." : "🧪 Запустити повний тест з прикладними даними"}
          </Button>
        </div>

        {/* Форми */}
        <div className="grid gap-6 md:grid-cols-2">
          <EggForm onSubmit={handleEggSubmit} isLoading={isLoading} />
          <FeedForm onSubmit={handleFeedSubmit} isLoading={isLoading} />
        </div>

        {/* Повідомлення про помилку */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Помилка:</strong> {error}
          </div>
        )}

        {/* Результати */}
        {response && (
          <AnalysisResults
            eggAnalysis={response.eggAnalysis}
            feedAnalysis={response.feedAnalysis}
            budgetAnalysis={response.budgetAnalysis}
            summaryAnalysis={response.summaryAnalysis}
          />
        )}

        {/* Повідомлення від агентів */}
        {response?.messages && response.messages.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">Статус виконання:</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              {response.messages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <footer className="border-t mt-16 py-8 bg-white/50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Система факторного аналізу собівартості на базі LangGraph + Azure OpenAI
        </div>
      </footer>
    </div>
  );
}
