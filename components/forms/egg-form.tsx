"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExcelUpload } from "@/components/forms/excel-upload";
import { eggTestData } from "@/lib/test-data";
import type { EggInput } from "@/lib/types";

interface EggFormProps {
  onChange: (data: EggInput) => void;
  testData?: EggInput;
}

type InputMode = "manual" | "excel";

const EMPTY: EggInput = {
  eggPrice:      { plan: 0, fact: 0 },
  sorting:       { plan: 0, fact: 0 },
  hatchability:  { plan: 0, fact: 0 },
  survivability: { plan: 0, fact: 0 },
  liveWeight:    { plan: 0, fact: 0 },
  carcassYield:  { plan: 0, fact: 0 },
};

const FIELDS: { key: keyof EggInput; label: string; step: string; unit: string }[] = [
  { key: "eggPrice",      label: "Ціна 1 яйця",        step: "0.01", unit: "грн" },
  { key: "sorting",       label: "Сортування",          step: "0.1",  unit: "%" },
  { key: "hatchability",  label: "Вивід",               step: "0.1",  unit: "%" },
  { key: "survivability", label: "Збереженість",        step: "0.1",  unit: "%" },
  { key: "liveWeight",    label: "Жива вага при забої", step: "0.01", unit: "кг" },
  { key: "carcassYield",  label: "Вихід тушки",         step: "0.1",  unit: "%" },
];

export function EggForm({ onChange, testData }: EggFormProps) {
  const [mode, setMode] = useState<InputMode>("manual");
  const [data, setData] = useState<EggInput>(EMPTY);

  // When parent pushes test data in, apply it
  useEffect(() => {
    if (testData) {
      setData(testData);
      onChange(testData);
    }
  }, [testData]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field: keyof EggInput, which: "plan" | "fact", raw: string) => {
    const value = parseFloat(raw) || 0;
    const next = { ...data, [field]: { ...data[field], [which]: value } };
    setData(next);
    onChange(next);
  };

  const clear = () => {
    setData(EMPTY);
    onChange(EMPTY);
  };

  const handleExcel = (data: Partial<EggInput>) => {
    const next = { ...EMPTY, ...data };
    setData(next);
    onChange(next);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Блок 1
            </CardTitle>
            <p className="text-base font-semibold text-foreground mt-0.5">
              Яйце в собівартості тушки
            </p>
            <CardDescription className="text-xs mt-1 leading-relaxed">
              Ціна яйця × сортування × вивід × збереженість × жива вага × вихід тушки
            </CardDescription>
          </div>
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
          <div className="space-y-3">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_80px] gap-x-2 px-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Показник
              </span>
              <span className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-wide">
                План
              </span>
              <span className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-wide">
                Факт
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y rounded-md border overflow-hidden">
              {FIELDS.map(({ key, label, step, unit }) => (
                <div
                  key={key}
                  className="grid grid-cols-[1fr_80px_80px] gap-x-2 items-center px-3 py-2 bg-card hover:bg-muted/30 transition-colors"
                >
                  <Label className="text-sm font-normal leading-tight">
                    {label}
                    <span className="ml-1 text-xs text-muted-foreground">({unit})</span>
                  </Label>
                  <Input
                    type="number"
                    step={step}
                    min="0"
                    value={data[key].plan || ""}
                    onChange={(e) => update(key, "plan", e.target.value)}
                    className="h-7 text-center text-sm px-1"
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    step={step}
                    min="0"
                    value={data[key].fact || ""}
                    onChange={(e) => update(key, "fact", e.target.value)}
                    className="h-7 text-center text-sm px-1"
                    placeholder="0"
                  />
                </div>
              ))}
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
              targetForm="egg"
              onDataParsed={(parsed) => {
                if (parsed.eggInput) handleExcel(parsed.eggInput);
              }}
            />
            {data.eggPrice.plan > 0 && (
              <div className="divide-y rounded-md border overflow-hidden">
                {FIELDS.map(({ key, label, unit }) => (
                  <div
                    key={key}
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
