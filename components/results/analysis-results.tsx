"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FactorImpact, EggAnalysis, FeedAnalysis, BudgetAnalysis, SummaryAnalysis } from "@/lib/types";

interface AnalysisResultsProps {
  eggAnalysis?: EggAnalysis | null;
  feedAnalysis?: FeedAnalysis | null;
  budgetAnalysis?: BudgetAnalysis | null;
  summaryAnalysis?: SummaryAnalysis | null;
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function fmt(v: number, decimals = 4) {
  return v.toFixed(decimals);
}

function deviationClass(v: number) {
  if (Math.abs(v) < 0.00001) return "text-muted-foreground";
  return v > 0 ? "text-[var(--negative)]" : "text-[var(--positive)]";
}

function arrow(v: number) {
  if (Math.abs(v) < 0.00001) return "—";
  return v > 0 ? "+" + fmt(v) : fmt(v);
}

// ─── Factor table ─────────────────────────────────────────────────────────────

function FactorTable({ factors }: { factors: FactorImpact[] }) {
  if (!factors || factors.length === 0) return null;

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-semibold">Фактор</TableHead>
            <TableHead className="text-right text-xs font-semibold w-28">Вплив, грн/кг</TableHead>
            <TableHead className="text-right text-xs font-semibold w-20">% від ∆</TableHead>
            <TableHead className="text-right text-xs font-semibold w-16">Оцінка</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {factors.map((f, i) => (
            <TableRow key={i} className="hover:bg-muted/30 transition-colors">
              <TableCell className="text-sm py-2">{f.factor}</TableCell>
              <TableCell className={`text-right text-sm py-2 font-mono ${deviationClass(f.impactUahPerKg)}`}>
                {arrow(f.impactUahPerKg)}
              </TableCell>
              <TableCell className="text-right text-xs py-2 text-muted-foreground font-mono">
                {f.impactPercent.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right py-2">
                {f.evaluation === "negative" && (
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-[var(--negative)]/10 text-[var(--negative)]">
                    ↑ ріст
                  </span>
                )}
                {f.evaluation === "positive" && (
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-[var(--positive)]/10 text-[var(--positive)]">
                    ↓ зниж
                  </span>
                )}
                {f.evaluation === "neutral" && (
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                    →
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Summary cards: plan/fact/deviation ──────────────────────────────────────

function MetricRow({ label, plan, fact }: { label: string; plan: number; fact: number }) {
  const dev = fact - plan;
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="flex items-center gap-6 font-mono text-xs">
        <span>{fmt(plan)}</span>
        <span>{fmt(fact)}</span>
        <span className={`w-20 text-right ${deviationClass(dev)}`}>{arrow(dev)}</span>
      </div>
    </div>
  );
}

function MetricHeader() {
  return (
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide" />
      <div className="flex items-center gap-6 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        <span className="w-14 text-right">План</span>
        <span className="w-14 text-right">Факт</span>
        <span className="w-20 text-right">∆</span>
      </div>
    </div>
  );
}

// ─── Waterfall ────────────────────────────────────────────────────────────────

function WaterfallBar({ value, totalRange }: { value: number; totalRange: number }) {
  const pct = totalRange > 0 ? Math.min(Math.abs(value) / totalRange, 1) * 100 : 0;
  const isPositive = value <= 0;
  return (
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${isPositive ? "bg-[var(--positive)]" : "bg-[var(--negative)]"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Section Blocks ──────────────────────────────────────────────────────────

function BlockResult({
  title,
  label,
  planValue,
  factValue,
  deviation,
  factors,
  conclusion,
  recommendations,
  llmReport,
}: {
  title: string;
  label: string;
  planValue: number;
  factValue: number;
  deviation: number;
  factors: FactorImpact[];
  conclusion: string;
  recommendations: string[];
  llmReport?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground">грн/кг тушки</div>
            <div className="font-mono text-sm font-semibold">
              {fmt(planValue)} → {fmt(factValue)}
            </div>
            <div className={`font-mono text-sm font-bold ${deviationClass(deviation)}`}>
              {arrow(deviation)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FactorTable factors={factors} />

        <div className="rounded-md bg-muted/40 border px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-medium">Висновок: </strong>
          {conclusion}
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Рекомендації</p>
            <ul className="space-y-1.5">
              {recommendations.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-foreground font-semibold shrink-0">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {llmReport && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Звіт AI (Azure OpenAI)
            </p>
            <div className="text-xs bg-muted/60 rounded-md p-3 whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
              {llmReport}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Summary section ─────────────────────────────────────────────────────────

function SummaryResults({ analysis }: { analysis: SummaryAnalysis }) {
  const totalRange = Math.max(...analysis.waterfall.map((w) => Math.abs(w.value)), 0.001);

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Зведений факторний аналіз</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Водоспад відхилень собівартості 1 кг тушки
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground">Собівартість, грн/кг</div>
            <div className="font-mono text-base font-bold">
              {fmt(analysis.totalCostPerKg.plan)} → {fmt(analysis.totalCostPerKg.fact)}
            </div>
            <div className={`font-mono text-sm font-bold ${deviationClass(analysis.totalCostPerKg.deviation ?? 0)}`}>
              {arrow(analysis.totalCostPerKg.deviation ?? 0)}
              {analysis.totalCostPerKg.plan > 0 && (
                <span className="text-xs font-normal ml-1">
                  ({(((analysis.totalCostPerKg.deviation ?? 0) / analysis.totalCostPerKg.plan) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Waterfall */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Водоспад відхилень (грн/кг)
          </p>
          <div className="space-y-2">
            {analysis.waterfall.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-28 text-muted-foreground shrink-0 truncate">{item.name}</span>
                <WaterfallBar value={item.value} totalRange={totalRange} />
                <span className={`w-16 text-right font-mono shrink-0 ${deviationClass(item.value)}`}>
                  {item.value === item.cumulative ? fmt(item.value) : arrow(item.value)}
                </span>
                <span className="w-16 text-right font-mono text-muted-foreground shrink-0">
                  {fmt(item.cumulative)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top factors */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-[var(--negative)] uppercase tracking-wide mb-2">
              ТОП-3 — збільшили собівартість
            </p>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableBody>
                  {analysis.top3Negative.map((f, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="text-xs py-1.5">{f.factor}</TableCell>
                      <TableCell className="text-right font-mono text-xs py-1.5 text-[var(--negative)]">
                        +{fmt(f.impactUahPerKg)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--positive)] uppercase tracking-wide mb-2">
              ТОП-3 — знизили собівартість
            </p>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableBody>
                  {analysis.top3Positive.map((f, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="text-xs py-1.5">{f.factor}</TableCell>
                      <TableCell className="text-right font-mono text-xs py-1.5 text-[var(--positive)]">
                        {fmt(f.impactUahPerKg)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Nature of factors */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Зовнішні фактори (не контролюємо)</p>
            <p className="text-xl font-bold font-mono">{fmt(analysis.factorNature.external)}</p>
            <p className="text-xs text-muted-foreground">грн/кг</p>
          </div>
          <div className="rounded-md border px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Внутрішні фактори (резерви)</p>
            <p className="text-xl font-bold font-mono">{fmt(analysis.factorNature.internal)}</p>
            <p className="text-xs text-muted-foreground">грн/кг</p>
          </div>
        </div>

        {/* Priorities */}
        {analysis.managementConclusion.priorities.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Пріоритети для менеджменту
            </p>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">#</TableHead>
                    <TableHead className="text-xs font-semibold">Фактор</TableHead>
                    <TableHead className="text-right text-xs font-semibold w-28">Вплив, грн/кг</TableHead>
                    <TableHead className="text-xs font-semibold">Відповідальний</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.managementConclusion.priorities.map((p, i) => (
                    <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-xs py-2 font-mono text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-sm py-2">{p.factor}</TableCell>
                      <TableCell className="text-right font-mono text-sm py-2 font-semibold">
                        {fmt(p.impact)}
                      </TableCell>
                      <TableCell className="text-xs py-2 text-muted-foreground">{p.responsible}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {analysis.llmReport && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Управлінський звіт AI (Azure OpenAI)
            </p>
            <div className="text-xs bg-muted/60 rounded-md p-3 whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
              {analysis.llmReport}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function AnalysisResults({
  eggAnalysis,
  feedAnalysis,
  budgetAnalysis,
  summaryAnalysis,
}: AnalysisResultsProps) {
  if (!eggAnalysis && !feedAnalysis && !budgetAnalysis && !summaryAnalysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {summaryAnalysis && <SummaryResults analysis={summaryAnalysis} />}

      {eggAnalysis && (
        <BlockResult
          title="Блок 1 — Яйце в собівартості тушки"
          label={`Вартість яйця на 1 кг тушки: ${fmt(eggAnalysis.eggCostPerKgCarcass.plan)} → ${fmt(eggAnalysis.eggCostPerKgCarcass.fact)} грн/кг`}
          planValue={eggAnalysis.planValue}
          factValue={eggAnalysis.factValue}
          deviation={eggAnalysis.totalDeviation}
          factors={eggAnalysis.factors}
          conclusion={eggAnalysis.conclusion}
          recommendations={eggAnalysis.recommendations}
          llmReport={eggAnalysis.llmReport}
        />
      )}

      {feedAnalysis && (
        <BlockResult
          title="Блок 2 — Корм в собівартості тушки"
          label={`Вартість корму на 1 кг тушки: ${fmt(feedAnalysis.feedCostPerKgCarcass.plan)} → ${fmt(feedAnalysis.feedCostPerKgCarcass.fact)} грн/кг`}
          planValue={feedAnalysis.planValue}
          factValue={feedAnalysis.factValue}
          deviation={feedAnalysis.totalDeviation}
          factors={feedAnalysis.factors}
          conclusion={feedAnalysis.conclusion}
          recommendations={feedAnalysis.recommendations}
          llmReport={feedAnalysis.llmReport}
        />
      )}

      {budgetAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Блок 3 — Бюджет витрат по напрямках</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Інкубація / Вирощування / Забій / ЦТФ — розклад по енергоносіях
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Directions summary */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Напрямок</TableHead>
                    <TableHead className="text-right text-xs font-semibold w-24">План</TableHead>
                    <TableHead className="text-right text-xs font-semibold w-24">Факт</TableHead>
                    <TableHead className="text-right text-xs font-semibold w-24">∆ грн/кг</TableHead>
                    <TableHead className="text-xs font-semibold">Головний фактор</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(
                    [
                      { key: "incubation", label: "Інкубація" },
                      { key: "growing",    label: "Вирощування" },
                      { key: "slaughter",  label: "Забій" },
                      { key: "ctf",        label: "ЦТФ" },
                    ] as const
                  ).map(({ key, label }) => {
                    const dir = budgetAnalysis.directions[key];
                    return (
                      <TableRow key={key} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-sm py-2 font-medium">{label}</TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {fmt(dir.total.plan)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {fmt(dir.total.fact)}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs py-2 font-semibold ${deviationClass(dir.deviation)}`}>
                          {arrow(dir.deviation)}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-muted-foreground">
                          {dir.mainFactor}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <FactorTable factors={budgetAnalysis.top5Factors} />

            <div className="rounded-md bg-muted/40 border px-4 py-3 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-medium">Висновок: </strong>
              {budgetAnalysis.conclusion}
            </div>

            {budgetAnalysis.recommendations.length > 0 && (
              <ul className="space-y-1.5">
                {budgetAnalysis.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-foreground font-semibold shrink-0">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ul>
            )}

            {budgetAnalysis.llmReport && (
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Звіт AI (Azure OpenAI)
                </p>
                <div className="text-xs bg-muted/60 rounded-md p-3 whitespace-pre-wrap font-mono text-muted-foreground">
                  {budgetAnalysis.llmReport}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
