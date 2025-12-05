import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data as { token: string; user: User };
}

export async function signup(name: string, email: string, password: string) {
  const res = await api.post('/auth/signup', { name, email, password });
  return res.data as { token: string; user: User };
}

export async function fetchExpenses(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  from?: string;
  to?: string;
}) {
  const res = await api.get('/expenses', { params });
  return res.data as {
    data: Expense[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
}

export async function createExpense(payload: {
  amount: number;
  category: string;
  description?: string;
  date: string;
}) {
  const res = await api.post('/expenses', payload);
  return res.data as Expense;
}

export async function updateExpense(
  id: number,
  payload: Partial<{
    amount: number;
    category: string;
    description: string;
    date: string;
  }>
) {
  const res = await api.put(`/expenses/${id}`, payload);
  return res.data as Expense;
}

export async function deleteExpense(id: number) {
  await api.delete(`/expenses/${id}`);
}

export async function fetchMonthlyAnalytics() {
  const res = await api.get('/analytics/monthly');
  return res.data as {
    totalThisMonth: number;
    byCategory: { category: string; _sum: { amount: number } }[];
    trend: { date: string; _sum: { amount: number } }[];
  };
}

export async function fetchCategoryAnalytics() {
  const res = await api.get('/analytics/category');
  return res.data as {
    byCategory: { category: string; _sum: { amount: number } }[];
  };
}


