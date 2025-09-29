import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e42", "#ef4444", "#eab308", "#6366f1", "#14b8a6", "#f43f5e"];

interface LoyersDonutChartProps {
  data: { type: string; montant: number }[];
}

export const LoyersDonutChart: React.FC<LoyersDonutChartProps> = ({ data }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <h3 className="text-lg font-bold mb-4">Répartition des loyers par type de bien</h3>
    <div className="flex flex-row items-center justify-between gap-8">
      <div className="flex-shrink-0">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="montant"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={2}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${value} FCFA`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="ml-4 min-w-[120px]">
        {data.map((entry, idx) => (
          <div key={entry.type} className="flex items-center mb-2">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
            <span className="text-sm font-medium mr-2">{entry.type}</span>
            <span className={idx === 0 ? "font-bold" : ""}>{entry.montant.toLocaleString()} FCFA</span>
          </div>
        ))}
      </div>
    </div>
  </div>
); 