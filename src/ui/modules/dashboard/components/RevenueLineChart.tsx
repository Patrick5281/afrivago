import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueLineChartProps {
  data: { periode: string; revenu: number }[];
  years: number[];
  year: number;
  granularity: 'monthly' | 'yearly';
  onGranularityChange: (g: 'monthly' | 'yearly') => void;
  onYearChange: (y: number) => void;
}

export const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data, years, year, granularity, onGranularityChange, onYearChange }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <h3 className="text-lg font-bold">Revenus locatifs</h3>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={granularity}
        onChange={e => onGranularityChange(e.target.value as 'monthly' | 'yearly')}
      >
        <option value="monthly">Mensuel</option>
        <option value="yearly">Annuel</option>
      </select>
      {granularity === 'monthly' && (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={year}
          onChange={e => onYearChange(Number(e.target.value))}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="periode" />
        <YAxis />
        <Tooltip formatter={(value: any) => `${value} FCFA`} />
        <Line type="monotone" dataKey="revenu" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
); 