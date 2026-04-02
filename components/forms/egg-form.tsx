"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { EggInput, PlanFact } from "@/lib/types";

interface EggFormProps {
  onSubmit: (data: EggInput) => void;
  isLoading?: boolean;
}

export function EggForm({ onSubmit, isLoading }: EggFormProps) {
  const [formData, setFormData] = useState<EggInput>({
    eggPrice: { plan: 0, fact: 0 },
    sorting: { plan: 0, fact: 0 },
    hatchability: { plan: 0, fact: 0 },
    survivability: { plan: 0, fact: 0 },
    liveWeight: { plan: 0, fact: 0 },
    carcassYield: { plan: 0, fact: 0 },
  });

  const updateField = (field: keyof EggInput, value: number, isFact: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [isFact ? "fact" : "plan"]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🥚 Аналіз вартості яйця</CardTitle>
        <CardDescription>
          Введіть планові та фактичні показники для аналізу вартості яйця в собівартості тушки
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Показник</div>
            <div className="font-semibold">План</div>
            <div className="font-semibold">Факт</div>

            <Label className="flex items-center">Ціна 1 яйця (грн)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.eggPrice.plan}
              onChange={(e) => updateField("eggPrice", parseFloat(e.target.value) || 0, false)}
            />
            <Input
              type="number"
              step="0.01"
              value={formData.eggPrice.fact}
              onChange={(e) => updateField("eggPrice", parseFloat(e.target.value) || 0, true)}
            />

            <Label className="flex items-center">Сортування (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.sorting.plan}
              onChange={(e) => updateField("sorting", parseFloat(e.target.value) || 0, false)}
            />
            <Input
              type="number"
              step="0.1"
              value={formData.sorting.fact}
              onChange={(e) => updateField("sorting", parseFloat(e.target.value) || 0, true)}
            />

            <Label className="flex items-center">Вивід (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.hatchability.plan}
              onChange={(e) => updateField("hatchability", parseFloat(e.target.value) || 0, false)}
            />
            <Input
              type="number"
              step="0.1"
              value={formData.hatchability.fact}
              onChange={(e) => updateField("hatchability", parseFloat(e.target.value) || 0, true)}
            />

            <Label className="flex items-center">Збереженість (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.survivability.plan}
              onChange={(e) => updateField("survivability", parseFloat(e.target.value) || 0, false)}
            />
            <Input
              type="number"
              step="0.1"
              value={formData.survivability.fact}
              onChange={(e) => updateField("survivability", parseFloat(e.target.value) || 0, true)}
            />

            <Label className="flex items-center">Жива вага при забої (кг)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.liveWeight.plan}
              onChange={(e) => updateField("liveWeight", parseFloat(e.target.value) || 0, false)}
            />
            <Input
              type="number"
              step="0.01"
              value={formData.liveWeight.fact}
              onChange={(e) => updateField("liveWeight", parseFloat(e.target.value) || 0, true)}
            />

            <Label className="flex items-center">Вихід тушки (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.carcassYield.plan}
              onChange={(e) => updateField("carcassYield", parseFloat(e.target.value) || 0, false)}
            />
            <Input
              type="number"
              step="0.1"
              value={formData.carcassYield.fact}
              onChange={(e) => updateField("carcassYield", parseFloat(e.target.value) || 0, true)}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Аналіз..." : "Розрахувати"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
