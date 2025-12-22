import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './Chart.css';

interface GradeDistributionChartProps {
  data: Array<{
    grade: string; // AA, BA, BB, etc.
    count: number;
  }>;
  title?: string;
  height?: number;
}

/**
 * Not dağılımı için bar chart
 */
export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({
  data,
  title = 'Not Dağılımı',
  height = 300,
}) => {
  // Harf notlarına göre renk paleti
  const getGradeColor = (grade: string): string => {
    const gradeColors: Record<string, string> = {
      AA: '#4caf50', // Yeşil
      BA: '#8bc34a',
      BB: '#cddc39',
      CB: '#ffeb3b',
      CC: '#ffc107',
      DC: '#ff9800',
      DD: '#ff5722',
      FD: '#f44336', // Kırmızı
      FF: '#d32f2f',
    };
    return gradeColors[grade] || '#9e9e9e';
  };

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="grade"
            tick={{ fontSize: 12 }}
            label={{ value: 'Harf Notu', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Öğrenci Sayısı', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any) => [value, 'Öğrenci Sayısı']}
            labelFormatter={(label) => `Not: ${label}`}
          />
          <Legend />
          <Bar dataKey="count" name="Öğrenci Sayısı">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

