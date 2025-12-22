import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import './Chart.css';

interface GPATrendChartData {
  semester: string; // "2024 FALL" formatında
  gpa: number;
  cgpa: number;
}

interface GPATrendChartProps {
  data: GPATrendChartData[];
  title?: string;
  height?: number;
}

/**
 * GPA trend grafiği (öğrenci için)
 */
export const GPATrendChart: React.FC<GPATrendChartProps> = ({
  data,
  title = 'GPA Trendi',
  height = 300,
}) => {
  const chartData = data.map((item) => ({
    ...item,
    semesterLabel: item.semester,
  }));

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="semesterLabel"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 4]}
            label={{ value: 'GPA / CGPA', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any) => value.toFixed(2)}
            labelFormatter={(label) => `Dönem: ${label}`}
          />
          <Legend />
          <ReferenceLine y={2.0} stroke="#ff9800" strokeDasharray="3 3" label="Min GPA (2.0)" />
          <Line
            type="monotone"
            dataKey="gpa"
            name="GPA"
            stroke="#2196F3"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="cgpa"
            name="CGPA"
            stroke="#4caf50"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

