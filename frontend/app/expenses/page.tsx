"use client";

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import {
  createExpense,
  deleteExpense,
  Expense,
  fetchExpenses,
  updateExpense
} from '@/lib/api';
import ExpenseModal from '@/components/ExpenseModal';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const loadExpenses = async (opts?: { page?: number; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses({
        page: opts?.page ?? page,
        pageSize: 10,
        search: opts?.search ?? search
      });
      setExpenses(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditing(expense);
    setModalOpen(true);
  };

  const handleSave = async (data: {
    amount: number;
    category: string;
    description?: string;
    date: string;
  }) => {
    try {
      if (editing) {
        await updateExpense(editing.id, data);
      } else {
        await createExpense(data);
      }
      setModalOpen(false);
      setEditing(null);
      loadExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(expense.id);
      loadExpenses();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadExpenses({ page: 1, search });
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Expenses</h1>
            <p className="text-sm text-slate-500">
              View, search, and manage all your expenses.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
          >
            + Add Expense
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            type="text"
            placeholder="Search by description or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Search
          </button>
        </form>

        {loading && <p className="text-sm text-slate-500">Loading expenses…</p>}
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Category</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Description</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Amount</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">
                      {expense.date.slice(0, 10)}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {expense.category}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {expense.description}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-900 font-medium">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-primary-600 hover:text-primary-500 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense)}
                        className="text-red-600 hover:text-red-500 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      No expenses found. Try adjusting your search or add a new expense.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-slate-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />
    </Layout>
  );
}


