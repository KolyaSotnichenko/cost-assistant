"use client";

import { useState, useCallback } from "react";
import { EggForm } from "@/components/forms/egg-form";
import { FeedForm } from "@/components/forms/feed-form";
import { AnalysisResults } from "@/components/results/analysis-results";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, FlaskConical, AlertCircle } from "lucide-react";
import { eggTestData, feedTestData, budgetTestData } from "@/lib/test-data";
import type { EggInput, FeedInput, BudgetInput } from "@/lib/types";
import type { AnalyzeResponse } from "@/app/api/analyze/route";

// ─── Graph step labels ────────────────────────────────────────────────────────

const GRAPH_STEPS = [
  { id: "egg_agent",     label: "Агент яйця" },
  { id: "feed_agent",    label: "Агент корму" },
  { id: "budget_agent",  label: "Агент бюджету" },
  { id: "summary_agent", label: "Зведений агент" },
];

// ─── Readiness check ──────────────────────────────────────────────────────────

function isEggReady(d: EggInput) {
  return d.eggPrice.plan > 0 && d.eggPrice.fact > 0;
}

function isFeedReady(d: FeedInput) {
  return d.feedPrice.start.plan > 0 && d.feedPrice.start.fact > 0;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [eggData, setEggData]   = useState<EggInput | null>(null);
  const [feedData, setFeedData] = useState<FeedInput | null>(null);
  const [testTrigger, setTestTrigger] = useState<{ egg?: EggInput; feed?: FeedInput } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse["data"] | null>(null);

  const eggReady  = eggData ? isEggReady(eggData) : false;
  const feedReady = feedData ? isFeedReady(feedData) : false;
  const canRun    = eggReady || feedReady;

  // Fill all forms with test data at once
  const fillTestData = useCallback(() => {
    setTestTrigger({ egg: eggTestData, feed: feedTestData });
    setEggData(eggTestData);
    setFeedData(feedTestData);
  }, []);

  const handleRun = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setMessages(["Запуск LangGraph StateGraph..."]);
    setCurrentStep("egg_agent");

    try {
      const body: { eggInput?: EggInput; feedInput?: FeedInput; budgetInput?: BudgetInput } = {};
      if (eggReady && eggData)   body.eggInput   = eggData;
      if (feedReady && feedData) body.feedInput  = feedData;
      // Budget test data always included if both blocks are ready
      if (eggReady && feedReady) body.budgetInput = budgetTestData;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Невідома помилка сервера");
      } else {
        setResult(json.data);
        setMessages(json.data?.messages ?? []);
        setCurrentStep("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка з'єднання з сервером");
    } finally {
      setIsLoading(false);
      if (!error) setCurrentStep("done");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
              <FlaskConical className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none">Cost Assistant</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Факторний аналіз собівартості тушки бройлера — LangGraph + Azure OpenAI
              </p>
            </div>
          </div>

          {/* LangGraph step indicator */}
          {isLoading && (
            <div className="hidden sm:flex items-center gap-1.5">
              {GRAPH_STEPS.map((s, i) => {
                const stepIndex  = GRAPH_STEPS.findIndex((x) => x.id === currentStep);
                const isDone     = stepIndex > i;
                const isActive   = stepIndex === i;
                return (
                  <div key={s.id} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3 text-muted-foreground" />}
                    <span
                      className={[
                        "text-[11px] font-medium rounded px-1.5 py-0.5",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isDone
                          ? "text-muted-foreground line-through"
                          : "text-muted-foreground/50",
                      ].join(" ")}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 flex flex-col gap-6 flex-1">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card px-5 py-4">
          <div>
            <p className="text-sm font-semibold">Введіть дані та запустіть аналіз</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Заповніть Блок 1 та Блок 2 нижче (вручну або через Excel), потім натисніть «Запустити аналіз»
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillTestData}
              disabled={isLoading}
              className="text-xs"
            >
              Заповнити тестовими даними
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleRun}
              disabled={isLoading || !canRun}
              className="gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Аналіз...
                </>
              ) : (
                "Запустити аналіз"
              )}
            </Button>
          </div>
        </div>

        {/* Readiness chips */}
        <div className="flex flex-wrap gap-2 -mt-2">
          <ReadinessChip label="Блок 1 — Яйце" ready={eggReady} />
          <ReadinessChip label="Блок 2 — Корм"  ready={feedReady} />
          <ReadinessChip label="Блок 3 — Бюджет" ready={eggReady && feedReady} hint="автоматично" />
        </div>

        {/* ── Forms ────────────────────────────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Column headers */}
          <div className="hidden lg:grid grid-cols-[1fr_80px_80px] gap-x-2 px-4">
            <span />
            <span className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-wide">
              План
            </span>
            <span className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-wide">
              Факт
            </span>
          </div>
          <div className="hidden lg:grid grid-cols-[1fr_80px_80px] gap-x-2 px-4">
            <span />
            <span className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-wide">
              План
            </span>
            <span className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-wide">
              Факт
            </span>
          </div>

          <EggForm
            onChange={setEggData}
            testData={testTrigger?.egg}
          />
          <FeedForm
            onChange={setFeedData}
            testData={testTrigger?.feed}
          />
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
            <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Помилка виконання</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {isLoading && (
          <div className="rounded-xl border bg-card px-6 py-10 flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Виконується факторний аналіз</p>
              <p className="text-xs text-muted-foreground mt-1">
                LangGraph StateGraph: агенти обробляють дані послідовно...
              </p>
            </div>
            {/* Mobile step progress */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:hidden">
              {GRAPH_STEPS.map((s, i) => {
                const stepIndex = GRAPH_STEPS.findIndex((x) => x.id === currentStep);
                const isActive = stepIndex === i;
                const isDone   = stepIndex > i;
                return (
                  <span
                    key={s.id}
                    className={[
                      "rounded-full px-2.5 py-0.5 text-[11px] border",
                      isActive
                        ? "border-primary text-primary font-semibold"
                        : isDone
                        ? "border-muted text-muted-foreground line-through"
                        : "border-muted text-muted-foreground/40",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Agent log ────────────────────────────────────────────────────── */}
        {!isLoading && messages.length > 0 && currentStep === "done" && (
          <details className="rounded-xl border bg-muted/30">
            <summary className="cursor-pointer px-4 py-2.5 text-xs font-medium text-muted-foreground select-none hover:text-foreground transition-colors">
              Журнал виконання LangGraph ({messages.length} кроків)
            </summary>
            <ul className="px-4 pb-3 space-y-1">
              {messages.map((msg, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex gap-2">
                  <span className="text-muted-foreground/50 font-mono tabular-nums shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {msg}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {result && !isLoading && (
          <AnalysisResults
            eggAnalysis={result.eggAnalysis}
            feedAnalysis={result.feedAnalysis}
            budgetAnalysis={result.budgetAnalysis}
            summaryAnalysis={result.summaryAnalysis}
          />
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20 py-4">
        <p className="text-center text-[11px] text-muted-foreground">
          Система факторного аналізу собівартості бройлера &mdash;{" "}
          <span className="font-medium text-foreground">LangGraph + Azure OpenAI</span> &mdash;
          метод ланцюгових підстановок
        </p>
      </footer>
    </div>
  );
}

// ─── Small helper component ────────────────────────────────────────────────────

function ReadinessChip({
  label,
  ready,
  hint,
}: {
  label: string;
  ready: boolean;
  hint?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        ready
          ? "border-[var(--positive)]/30 bg-[var(--positive)]/8 text-[var(--positive)]"
          : "border-border text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          ready ? "bg-[var(--positive)]" : "bg-muted-foreground/40",
        ].join(" ")}
      />
      {label}
      {hint && <span className="opacity-60 font-normal">— {hint}</span>}
    </span>
  );
}
