"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FeedInput } from "@/lib/types";

interface FeedFormProps {
  onSubmit: (data: FeedInput) => void;
  isLoading?: boolean;
}

export function FeedForm({ onSubmit, isLoading }: FeedFormProps) {
  const [formData, setFormData] = useState<FeedInput>({
    feedPrice: {
      start: { plan: 0, fact: 0 },
      growth: { plan: 0, fact: 0 },
      finish: { plan: 0, fact: 0 },
    },
    feedConsumption: {
      start: { plan: 0, fact: 0 },
      growth: { plan: 0, fact: 0 },
      finish: { plan: 0, fact: 0 },
    },
    fcr: { plan: 0, fact: 0 },
    liveWeight: { plan: 0, fact: 0 },
    carcassYield: { plan: 0, fact: 0 },
  });

  const updatePrice = (phase: "start" | "growth" | "finish", value: number, isFact: boolean) => {
    setFormData((prev) => ({
      ...prev,
      feedPrice: {
        ...prev.feedPrice,
        [phase]: {
          ...prev.feedPrice[phase],
          [isFact ? "fact" : "plan"]: value,
        },
      },
    }));
  };

  const updateConsumption = (phase: "start" | "growth" | "finish", value: number, isFact: boolean) => {
    setFormData((prev) => ({
      ...prev,
      feedConsumption: {
        ...prev.feedConsumption,
        [phase]: {
          ...prev.feedConsumption[phase],
          [isFact ? "fact" : "plan"]: value,
        },
      },
    }));
  };

  const updateField = (field: keyof FeedInput, value: number, isFact: boolean) => {
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
        <CardTitle>🌾 Аналіз вартості корму</CardTitle>
        <CardDescription>
          Введіть дані по цінах корму та витратах по фазах відгодівлі
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="prices">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prices">Ціни корму (грн/кг)</TabsTrigger>
              <TabsTrigger value="consumption">Витрати корму (кг/гол)</TabsTrigger>
              <TabsTrigger value="other">Інші показники</TabsTrigger>
            </TabsList>

            <TabsContent value="prices" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Фаза</div>
                <div className="font-semibold">План</div>
                <div className="font-semibold">Факт</div>

                <Label className="flex items-center">Старт</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedPrice.start.plan}
                  onChange={(e) => updatePrice("start", parseFloat(e.target.value) || 0, false)}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedPrice.start.fact}
                  onChange={(e) => updatePrice("start", parseFloat(e.target.value) || 0, true)}
                />

                <Label className="flex items-center">Ріст</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedPrice.growth.plan}
                  onChange={(e) => updatePrice("growth", parseFloat(e.target.value) || 0, false)}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedPrice.growth.fact}
                  onChange={(e) => updatePrice("growth", parseFloat(e.target.value) || 0, true)}
                />

                <Label className="flex items-center">Фініш</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedPrice.finish.plan}
                  onChange={(e) => updatePrice("finish", parseFloat(e.target.value) || 0, false)}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedPrice.finish.fact}
                  onChange={(e) => updatePrice("finish", parseFloat(e.target.value) || 0, true)}
                />
              </div>
            </TabsContent>

            <TabsContent value="consumption" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Фаза</div>
                <div className="font-semibold">План</div>
                <div className="font-semibold">Факт</div>

                <Label className="flex items-center">Старт</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedConsumption.start.plan}
                  onChange={(e) => updateConsumption("start", parseFloat(e.target.value) || 0, false)}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedConsumption.start.fact}
                  onChange={(e) => updateConsumption("start", parseFloat(e.target.value) || 0, true)}
                />

                <Label className="flex items-center">Ріст</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedConsumption.growth.plan}
                  onChange={(e) => updateConsumption("growth", parseFloat(e.target.value) || 0, false)}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedConsumption.growth.fact}
                  onChange={(e) => updateConsumption("growth", parseFloat(e.target.value) || 0, true)}
                />

                <Label className="flex items-center">Фініш</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedConsumption.finish.plan}
                  onChange={(e) => updateConsumption("finish", parseFloat(e.target.value) || 0, false)}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.feedConsumption.finish.fact}
                  onChange={(e) => updateConsumption("finish", parseFloat(e.target.value) || 0, true)}
                />
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Показник</div>
                <div className="font-semibold">План</div>
                <div className="font-semibold">Факт</div>

                <Label className="flex items-center">FCR (кг корму / кг живої ваги)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.fcr.plan}
                  onChange={(e) => updateField("fcr", parseFloat(e.target.value) || 0, false)}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.fcr.fact}
                  onChange={(e) => updateField("fcr", parseFloat(e.target.value) || 0, true)}
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
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Аналіз..." : "Розрахувати"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
