"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExcelUpload } from "@/components/forms/excel-upload";
import { feedTestData } from "@/lib/test-data";
import type { FeedInput } from "@/lib/types";

interface FeedFormProps {
  onChange: (data: FeedInput) => void;
  testData?: FeedInput;
}

type InputMode = "manual" | "excel";
type PhaseKey = "start" | "growth" | "finish";

const EMPTY: FeedInput = {
  feedPrice: {
    start:  { plan: 0, fact: 0 },
    growth: { plan: 0, fact: 0 },
    finish: { plan: 0, fact: 0 },
  },
  feedConsumption: {
    start:  { plan: 0, fact: 0 },
    growth: { plan: 0, fact: 0 },
    finish: { plan: 0, fact: 0 },
  },
  fcr:          { plan: 0, fact: 0 },
  liveWeight:   { plan: 0, fact: 0 },
  carcassYield: { plan: 0, fact: 0 },
};

const PHASES: { key: PhaseKey; label: string }[] = [
  { key: "start",  label: "Старт" },
  { key: "growth", label: "Ріст" },
  { key: "finish", label: "Фініш" },
];

const OTHER: { key: "fcr" | "liveWeight" | "carcassYield"; label: string; step: string; unit: string }[] = [
  { key: "fcr",          label: "FCR",                   step: "0.01", unit: "кг/кг" },
  { key: "liveWeight",   label: "Жива вага при забої",  step: "0.01", unit: "кг" },
  { key: "carcassYield", label: "Вихід тушки",          step: "0.1",  unit: "%" },
];

export function FeedForm({ onChange, testData }: FeedFormProps) {
  const [mode, setMode] = useState<InputMode>("manual");
  const [data, setData] = useState<FeedInput>(EMPTY);

  useEffect(() => {
    if (testData) {
      setData(testData);
      onChange(testData);
    }
  }, [testData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePrice = (phase: PhaseKey, which: "plan" | "fact", raw: string) => {
    const value = parseFloat(raw) || 0;
    const next = {
      ...data,
      feedPrice: { ...data.feedPrice, [phase]: { ...data.feedPrice[phase], [which]: value } },
    };
    setData(next);
    onChange(next);
  };

  const updateCons = (phase: PhaseKey, which: "plan" | "fact", raw: string) => {
    const value = parseFloat(raw) || 0;
    const next = {
      ...data,
      feedConsumption: { ...data.feedConsumption, [phase]: { ...data.feedConsumption[phase], [which]: value } },
    };
    setData(next);
    onChange(next);
  };

  const updateOther = (field: "fcr" | "liveWeight" | "carcassYield", which: "plan" | "fact", raw: string) => {
    const value = parseFloat(raw) || 0;
    const next = { ...data, [field]: { ...data[field], [which]: value } };
    setData(next);
    onChange(next);
  };

  const clear = () => {
    setData(EMPTY);
    onChange(EMPTY);
  };

  const handleExcel = (parsed: Partial<FeedInput>) => {
    const next = { ...EMPTY, ...parsed };
    setData(next);
    onChange(next);
  };

  const hasData = data.feedPrice.start.plan > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Блок 2
          </CardTitle>
          <p className="text-base font-semibold text-foreground mt-0.5">
            Корм в собівартості тушки
          </p>
          <CardDescription className="text-xs mt-1 leading-relaxed">
            Ціна корму (зважена по фазах) × FCR ÷ вихід тушки
          </CardDescription>
        </div>

        {/* Mode tabs */}
        <div className="mt-3 flex rounded-md border bg-muted p-0.5 w-fit gap-0.5">
          {(["manual", "excel"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={[
                "rounded px-3 py-1.5 text-xs font-medium transition-all",
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {m === "manual" ? "Варіант А — вручну" : "Варіант Б — Excel"}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {mode === "manual" ? (
          <div className="space-y-4">
            {/* Prices */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Ціна корму (грн/кг)
              </p>
              <div className="divide-y rounded-md border overflow-hidden">
                {PHASES.map(({ key, label }) => (
                  <div
                    key={`price-${key}`}
                    className="grid grid-cols-[1fr_80px_80px] gap-x-2 items-center px-3 py-2 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <Label className="text-sm font-normal">{label}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.feedPrice[key].plan || ""}
                      onChange={(e) => updatePrice(key, "plan", e.target.value)}
                      className="h-7 text-center text-sm px-1"
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.feedPrice[key].fact || ""}
                      onChange={(e) => updatePrice(key, "fact", e.target.value)}
                      className="h-7 text-center text-sm px-1"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Consumption */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Витрати корму (кг/гол)
              </p>
              <div className="divide-y rounded-md border overflow-hidden">
                {PHASES.map(({ key, label }) => (
                  <div
                    key={`cons-${key}`}
                    className="grid grid-cols-[1fr_80px_80px] gap-x-2 items-center px-3 py-2 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <Label className="text-sm font-normal">{label}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.feedConsumption[key].plan || ""}
                      onChange={(e) => updateCons(key, "plan", e.target.value)}
                      className="h-7 text-center text-sm px-1"
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.feedConsumption[key].fact || ""}
                      onChange={(e) => updateCons(key, "fact", e.target.value)}
                      className="h-7 text-center text-sm px-1"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Other */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Загальні показники
              </p>
              <div className="divide-y rounded-md border overflow-hidden">
                {OTHER.map(({ key, label, step, unit }) => (
                  <div
                    key={`other-${key}`}
                    className="grid grid-cols-[1fr_80px_80px] gap-x-2 items-center px-3 py-2 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <Label className="text-sm font-normal">
                      {label}
                      <span className="ml-1 text-xs text-muted-foreground">({unit})</span>
                    </Label>
                    <Input
                      type="number"
                      step={step}
                      min="0"
                      value={data[key].plan || ""}
                      onChange={(e) => updateOther(key, "plan", e.target.value)}
                      className="h-7 text-center text-sm px-1"
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      step={step}
                      min="0"
                      value={data[key].fact || ""}
                      onChange={(e) => updateOther(key, "fact", e.target.value)}
                      className="h-7 text-center text-sm px-1"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-xs text-muted-foreground h-7 px-2"
            >
              Очистити
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ExcelUpload
              targetForm="feed"
              onDataParsed={(parsed) => {
                if (parsed.feedInput) handleExcel(parsed.feedInput);
              }}
            />
            {hasData && (
              <div className="divide-y rounded-md border overflow-hidden">
                {PHASES.map(({ key, label }) => (
                  <div
                    key={`preview-price-${key}`}
                    className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-2 text-xs bg-card hover:bg-muted/30"
                  >
                    <span className="text-muted-foreground">Ціна {label} (грн/кг)</span>
                    <span className="font-mono tabular-nums">
                      <span className="text-muted-foreground mr-1">П:</span>
                      {data.feedPrice[key].plan}
                    </span>
                    <span className="font-mono tabular-nums">
                      <span className="text-muted-foreground mr-1">Ф:</span>
                      {data.feedPrice[key].fact}
                    </span>
                  </div>
                ))}
                {OTHER.map(({ key, label, unit }) => (
                  <div
                    key={`preview-other-${key}`}
                    className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-2 text-xs bg-card hover:bg-muted/30"
                  >
                    <span className="text-muted-foreground">
                      {label} ({unit})
                    </span>
                    <span className="font-mono tabular-nums">
                      <span className="text-muted-foreground mr-1">П:</span>
                      {data[key].plan}
                    </span>
                    <span className="font-mono tabular-nums">
                      <span className="text-muted-foreground mr-1">Ф:</span>
                      {data[key].fact}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
