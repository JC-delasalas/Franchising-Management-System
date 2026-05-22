import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeriodType } from '@/data/analytics/franchiseeData';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  title?: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  title = "Analytics Dashboard"
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <Tabs 
        value={selectedPeriod} 
        onValueChange={(value) => onPeriodChange(value as PeriodType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="MTD">Month to Date</TabsTrigger>
          <TabsTrigger value="QTD">Quarter to Date</TabsTrigger>
          <TabsTrigger value="YTD">Year to Date</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PeriodSelector;
