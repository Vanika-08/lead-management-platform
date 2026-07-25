'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { StatusCount } from '@/types/dto';

const TICK = { fill: 'hsl(215 16% 47%)', fontSize: 12 };

export function StatusBarChart({ data }: { data: StatusCount[] }) {
  const chartData = data.map((d) => ({ name: d.status, count: d.count }));
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 90%)" vertical={false} />
          <XAxis dataKey="name" tick={TICK} tickLine={false} axisLine={false} interval={0}
            angle={-15} textAnchor="end" height={50} />
          <YAxis tick={TICK} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'hsl(215 20% 95%)' }}
            contentStyle={{ borderRadius: 8, border: '1px solid hsl(215 20% 88%)', fontSize: 13 }}
          />
          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
