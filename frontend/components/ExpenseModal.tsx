import { useState, useEffect } from 'react';
import { Expense } from '@/lib/api';

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; category: string; description?: string; date: string }) => void;
  initial?: Expense | null;
}

export default function ExpenseModal({ open, onClose, onSave, initial }: ExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (initial) {
      setAmount(initial.amount.toString());
      setCategory(initial.category);
      setDescription(initial.description);
      setDate(initial.date.slice(0, 10));
    } else {
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      amount: parseFloat(amount),
      category,
      description,
      date
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">
            {initial ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


