"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EggInput, FeedInput } from "@/lib/types";

type ParsedData = {
  eggInput?: EggInput;
  feedInput?: FeedInput;
};

type ParseStatus = "idle" | "parsing" | "success" | "error";

interface ExcelUploadProps {
  onDataParsed: (data: ParsedData) => void;
  targetForm: "egg" | "feed" | "both";
}

/**
 * Читає Excel файл та повертає розпарсені дані
 * Структура аркушу "Яйце":
 *   A = Назва показника, B = План, C = Факт
 * Рядки: 1-заголовок, 2=Ціна яйця, 3=Сортування, 4=Вивід,
 *         5=Збереженість, 6=Жива вага, 7=Вихід тушки
 *
 * Структура аркушу "Корм":
 *   A = Назва показника, B = План, C = Факт
 * Рядки: 1-заголовок, 2=Ціна Старт, 3=Ціна Ріст, 4=Ціна Фініш,
 *         5=Витрати Старт, 6=Витрати Ріст, 7=Витрати Фініш,
 *         8=FCR, 9=Жива вага, 10=Вихід тушки
 */
async function parseExcelFile(file: File): Promise<ParsedData> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const result: ParsedData = {};

  // --- Парсинг аркушу "Яйце" ---
  const eggSheetName = workbook.SheetNames.find(
    (n) => n.toLowerCase().includes("яйце") || n.toLowerCase().includes("egg")
  );
  if (eggSheetName) {
    const ws = workbook.Sheets[eggSheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as unknown[][];
    const val = (row: number, col: number): number => {
      const v = rows[row]?.[col];
      return typeof v === "number" ? v : parseFloat(String(v ?? "0")) || 0;
    };
    result.eggInput = {
      eggPrice:     { plan: val(1, 1), fact: val(1, 2) },
      sorting:      { plan: val(2, 1), fact: val(2, 2) },
      hatchability: { plan: val(3, 1), fact: val(3, 2) },
      survivability:{ plan: val(4, 1), fact: val(4, 2) },
      liveWeight:   { plan: val(5, 1), fact: val(5, 2) },
      carcassYield: { plan: val(6, 1), fact: val(6, 2) },
    };
  }

  // --- Парсинг аркушу "Корм" ---
  const feedSheetName = workbook.SheetNames.find(
    (n) => n.toLowerCase().includes("корм") || n.toLowerCase().includes("feed")
  );
  if (feedSheetName) {
    const ws = workbook.Sheets[feedSheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as unknown[][];
    const val = (row: number, col: number): number => {
      const v = rows[row]?.[col];
      return typeof v === "number" ? v : parseFloat(String(v ?? "0")) || 0;
    };
    result.feedInput = {
      feedPrice: {
        start:  { plan: val(1, 1), fact: val(1, 2) },
        growth: { plan: val(2, 1), fact: val(2, 2) },
        finish: { plan: val(3, 1), fact: val(3, 2) },
      },
      feedConsumption: {
        start:  { plan: val(4, 1), fact: val(4, 2) },
        growth: { plan: val(5, 1), fact: val(5, 2) },
        finish: { plan: val(6, 1), fact: val(6, 2) },
      },
      fcr:          { plan: val(7, 1), fact: val(7, 2) },
      liveWeight:   { plan: val(8, 1), fact: val(8, 2) },
      carcassYield: { plan: val(9, 1), fact: val(9, 2) },
    };
  }

  if (!result.eggInput && !result.feedInput) {
    throw new Error(
      'Аркуші не знайдено. Назвіть аркуші "Яйце" та/або "Корм" відповідно до шаблону.'
    );
  }

  return result;
}

export function ExcelUpload({ onDataParsed, targetForm }: ExcelUploadProps) {
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sheetHint, setSheetHint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls|ods)$/i)) {
        setStatus("error");
        setErrorMessage("Підтримуються тільки файли .xlsx, .xls, .ods");
        return;
      }
      setFileName(file.name);
      setStatus("parsing");
      setErrorMessage(null);
      setSheetHint(null);

      try {
        const parsed = await parseExcelFile(file);
        setStatus("success");
        const foundSheets: string[] = [];
        if (parsed.eggInput) foundSheets.push("Яйце");
        if (parsed.feedInput) foundSheets.push("Корм");
        setSheetHint(`Знайдено аркуші: ${foundSheets.join(", ")}`);
        onDataParsed(parsed);
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Помилка читання файлу");
      }
    },
    [onDataParsed]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const reset = () => {
    setStatus("idle");
    setFileName(null);
    setErrorMessage(null);
    setSheetHint(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => status !== "success" && inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : status === "success"
            ? "border-green-500 bg-green-50 dark:bg-green-950/20 cursor-default"
            : status === "error"
            ? "border-destructive bg-destructive/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
        ].join(" ")}
      >
        <Input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.ods"
          className="sr-only"
          onChange={onInputChange}
          tabIndex={-1}
          aria-label="Завантажити Excel файл"
        />

        {status === "success" ? (
          <>
            <CheckCircle className="h-10 w-10 text-green-500" />
            <div className="text-center">
              <p className="font-medium text-green-700 dark:text-green-400">{fileName}</p>
              <p className="text-sm text-muted-foreground mt-1">{sheetHint}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="mt-2"
            >
              <X className="h-4 w-4 mr-1" />
              Змінити файл
            </Button>
          </>
        ) : status === "parsing" ? (
          <>
            <FileSpreadsheet className="h-10 w-10 text-primary animate-pulse" />
            <p className="text-sm font-medium">Читання файлу...</p>
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="text-center">
              <p className="font-medium text-destructive">Помилка</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }}>
              Спробувати інший файл
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">
                Перетягніть файл або{" "}
                <span className="text-primary underline underline-offset-2">оберіть на диску</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls, .ods — до 10 МБ</p>
            </div>
          </>
        )}
      </div>

      {/* Підказка по структурі */}
      <div className="rounded-md border bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground text-xs">Структура Excel файлу:</p>
        {(targetForm === "egg" || targetForm === "both") && (
          <div>
            <p className="font-medium text-foreground">Аркуш «Яйце»</p>
            <p>Колонки: A — назва, B — план, C — факт</p>
            <p>Рядки 2–7: Ціна яйця / Сортування / Вивід / Збереженість / Жива вага / Вихід тушки</p>
          </div>
        )}
        {(targetForm === "feed" || targetForm === "both") && (
          <div>
            <p className="font-medium text-foreground">Аркуш «Корм»</p>
            <p>Колонки: A — назва, B — план, C — факт</p>
            <p>Рядки 2–10: Ціна Старт / Ціна Ріст / Ціна Фініш / Витрати Старт / Витрати Ріст / Витрати Фініш / FCR / Жива вага / Вихід тушки</p>
          </div>
        )}
        <p className="pt-1">
          <a
            href="#template"
            className="text-primary underline underline-offset-2 font-medium"
            onClick={(e) => e.preventDefault()}
          >
            Завантажити шаблон
          </a>
        </p>
      </div>
    </div>
  );
}
