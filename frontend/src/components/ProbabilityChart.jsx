import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

const CLASS_COLORS = {
  NonDemented: '#10b981',       // Emerald
  VeryMildDemented: '#06b6d4',   // Cyan
  MildDemented: '#f59e0b',       // Amber
  ModerateDemented: '#f43f5e'    // Rose
};

const ProbabilityChart = ({ probabilities, type = "bar" }) => {
  if (!probabilities) return null;

  const data = Object.entries(probabilities).map(([name, prob]) => ({
    name,
    percentage: Math.round(prob * 1000) / 10,
    prob: prob,
    color: CLASS_COLORS[name] || '#3b82f6'
  }));

  if (type === "pie") {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={45}
              paddingAngle={4}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              formatter={(value) => [`${value}%`, 'Probability']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
          <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={120} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
            formatter={(value) => [`${value}%`, 'Confidence Score']}
          />
          <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProbabilityChart;
