"use client";

import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { fetchMonthlyAnalytics } from '@/lib/api';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [categoryData, setCategoryData] = useState<{ category: string; amount: number }[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; amount: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMonthlyAnalytics();
        setTotal(data.totalThisMonth);
        setCategoryData(
          data.byCategory.map((c) => ({ category: c.category, amount: c._sum.amount || 0 }))
        );
        const trend = data.trend
          .map((t) => ({
            date: t.date.slice(0, 10),
            amount: t._sum.amount || 0
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setTrendData(trend);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = {
    labels: categoryData.map((c) => c.category),
    datasets: [
      {
        data: categoryData.map((c) => c.amount),
        backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6']
      }
    ]
  };

  const lineData = {
    labels: trendData.map((t) => t.date),
    datasets: [
      {
        label: 'Spending',
        data: trendData.map((t) => t.amount),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.3
      }
    ]
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of your spending for this month.
          </p>
        </div>
        {loading && <p className="text-sm text-slate-500">Loading analytics…</p>}
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 h-32 flex flex-col justify-center">
                <div className="text-sm text-slate-500">Total this month</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  ${total.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 md:col-span-2 h-64">
                <div className="text-sm text-slate-500 mb-2">Spending trend</div>
                <div className="h-52">
                  <Line
                    data={lineData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 h-80">
                <div className="text-sm text-slate-500 mb-2">By category</div>
                <div className="h-64">
                  <Pie
                    data={pieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="text-sm text-slate-500 mb-2">Top categories</div>
                <ul className="space-y-2">
                  {categoryData
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((c) => (
                      <li key={c.category} className="flex justify-between text-sm">
                        <span className="text-slate-700">{c.category}</span>
                        <span className="font-medium text-slate-900">
                          ${c.amount.toFixed(2)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}


