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
} from 'recharts';
import './Chart.css';

interface AttendanceChartData {
  date: string;
  attended: number;
  total: number;
  percentage: number;
}

interface AttendanceChartProps {
  data: AttendanceChartData[];
  title?: string;
  height?: number;
}

/**
 * Yoklama istatistikleri için line chart
 */
export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  data,
  title = 'Yoklama Trendi',
  height = 300,
}) => {
  const chartData = data.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{ value: 'Yoklama Oranı (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any, name: string) => {
              if (name === 'percentage') {
                return [`%${value.toFixed(1)}`, 'Yoklama Oranı'];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `Tarih: ${label}`}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="percentage"
            name="Yoklama Oranı (%)"
            stroke="#2196F3"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

