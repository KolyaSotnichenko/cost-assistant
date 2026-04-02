"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { FactorImpact, EggAnalysis, FeedAnalysis, BudgetAnalysis, SummaryAnalysis } from "@/lib/types";

interface AnalysisResultsProps {
  eggAnalysis?: EggAnalysis | null;
  feedAnalysis?: FeedAnalysis | null;
  budgetAnalysis?: BudgetAnalysis | null;
  summaryAnalysis?: SummaryAnalysis | null;
}

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
      {/* Зведений аналіз */}
      {summaryAnalysis && (
        <SummaryResults analysis={summaryAnalysis} />
      )}

      {/* Аналіз яйця */}
      {eggAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>🥚 Результати аналізу яйця</CardTitle>
            <CardDescription>
              Вартість яйця на 1 кг тушки: {eggAnalysis.eggCostPerKgCarcass.plan.toFixed(4)} → {eggAnalysis.eggCostPerKgCarcass.fact.toFixed(4)} грн/кг
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FactorTable factors={eggAnalysis.factors} />
            <div className="text-sm text-muted-foreground">
              <strong>Висновок:</strong> {eggAnalysis.conclusion}
            </div>
            {eggAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <strong className="text-sm">Рекомендації:</strong>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {eggAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {eggAnalysis.llmReport && (
              <div className="space-y-2 pt-4 border-t">
                <strong className="text-sm">🤖 Звіт AI (LLM):</strong>
                <div className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {eggAnalysis.llmReport}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Аналіз корму */}
      {feedAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>🌾 Результати аналізу корму</CardTitle>
            <CardDescription>
              Вартість корму на 1 кг тушки: {feedAnalysis.feedCostPerKgCarcass.plan.toFixed(4)} → {feedAnalysis.feedCostPerKgCarcass.fact.toFixed(4)} грн/кг
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FactorTable factors={feedAnalysis.factors} />
            <div className="text-sm text-muted-foreground">
              <strong>Висновок:</strong> {feedAnalysis.conclusion}
            </div>
            {feedAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <strong className="text-sm">Рекомендації:</strong>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {feedAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedAnalysis.llmReport && (
              <div className="space-y-2 pt-4 border-t">
                <strong className="text-sm">🤖 Звіт AI (LLM):</strong>
                <div className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {feedAnalysis.llmReport}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Аналіз бюджету */}
      {budgetAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>💰 Результати аналізу бюджету</CardTitle>
            <CardDescription>
              ТОП-5 факторів впливу на витрати
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FactorTable factors={budgetAnalysis.top5Factors} />
            <div className="text-sm text-muted-foreground">
              <strong>Висновок:</strong> {budgetAnalysis.conclusion}
            </div>
            {budgetAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <strong className="text-sm">Рекомендації:</strong>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {budgetAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {budgetAnalysis.llmReport && (
              <div className="space-y-2 pt-4 border-t">
                <strong className="text-sm">🤖 Звіт AI (LLM):</strong>
                <div className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
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

interface SummaryResultsProps {
  analysis: SummaryAnalysis;
}

function SummaryResults({ analysis }: SummaryResultsProps) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-2xl">📊 Зведений факторний аналіз</CardTitle>
        <CardDescription className="text-lg">
          Собівартість 1 кг тушки: {analysis.totalCostPerKg.plan.toFixed(4)} → {analysis.totalCostPerKg.fact.toFixed(4)} грн/кг
          <span className={(analysis.totalCostPerKg.deviation || 0) >= 0 ? "text-red-500" : "text-green-500"}>
            {" "}({(analysis.totalCostPerKg.deviation || 0) >= 0 ? "+" : ""}{(analysis.totalCostPerKg.deviation || 0).toFixed(4)} грн/кг)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Водоспад */}
        <div>
          <h4 className="font-semibold mb-3">Водоспад відхилень</h4>
          <div className="space-y-2">
            {analysis.waterfall.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="w-40">{item.name}</span>
                <div className="flex-1 mx-4">
                  <Progress
                    value={Math.abs(item.value) * 100}
                    className={item.type === "negative" ? "bg-red-200" : "bg-green-200"}
                  />
                </div>
                <span className={`w-24 text-right ${item.type === "negative" ? "text-red-500" : "text-green-500"}`}>
                  {item.value >= 0 ? "+" : ""}{item.value.toFixed(4)}
                </span>
                <span className="w-20 text-right text-muted-foreground">
                  {item.cumulative.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ТОП фактори */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-red-500">⬆ ТОП-3 негативних фактори</h4>
            <ul className="space-y-1 text-sm">
              {analysis.top3Negative.map((factor, i) => (
                <li key={i} className="flex justify-between">
                  <span>{factor.factor}</span>
                  <span className="text-red-500">+{factor.impactUahPerKg.toFixed(4)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-green-500">⬇ ТОП-3 позитивних фактори</h4>
            <ul className="space-y-1 text-sm">
              {analysis.top3Positive.map((factor, i) => (
                <li key={i} className="flex justify-between">
                  <span>{factor.factor}</span>
                  <span className="text-green-500">-{Math.abs(factor.impactUahPerKg).toFixed(4)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Природа факторів */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">🌍 Зовнішні фактори</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis.factorNature.external.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground">грн/кг (не контролюємо)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">🏠 Внутрішні фактори</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis.factorNature.internal.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground">грн/кг (резерви)</div>
            </CardContent>
          </Card>
        </div>

        {/* Пріоритети */}
        {analysis.managementConclusion.priorities.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">🎯 Пріоритети для менеджменту</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Фактор</TableHead>
                  <TableHead className="text-right">Вплив (грн/кг)</TableHead>
                  <TableHead>Відповідальний</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.managementConclusion.priorities.map((priority, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{priority.factor}</TableCell>
                    <TableCell className="text-right">{priority.impact.toFixed(4)}</TableCell>
                    <TableCell>{priority.responsible}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* LLM звіт */}
        {analysis.llmReport && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold">🤖 Звіт AI (LLM):</h4>
            <div className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
              {analysis.llmReport}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FactorTableProps {
  factors: FactorImpact[];
}

function FactorTable({ factors }: FactorTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Фактор</TableHead>
          <TableHead className="text-right">Вплив (грн/кг)</TableHead>
          <TableHead className="text-right">Вплив (%)</TableHead>
          <TableHead className="text-right">Оцінка</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {factors.map((factor, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{factor.factor}</TableCell>
            <TableCell className={`text-right ${factor.impactUahPerKg > 0 ? "text-red-500" : "text-green-500"}`}>
              {factor.impactUahPerKg >= 0 ? "+" : ""}{factor.impactUahPerKg.toFixed(4)}
            </TableCell>
            <TableCell className="text-right">{factor.impactPercent.toFixed(1)}%</TableCell>
            <TableCell className="text-right">
              {factor.evaluation === "negative" && <span className="text-red-500">⬆</span>}
              {factor.evaluation === "positive" && <span className="text-green-500">⬇</span>}
              {factor.evaluation === "neutral" && <span className="text-gray-500">➡</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
