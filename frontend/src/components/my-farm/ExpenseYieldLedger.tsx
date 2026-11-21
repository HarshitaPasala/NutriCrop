'use client';

import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Plus,
  Sparkles,
  PieChart,
  Tag,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface ExpenseSummary {
  total_expense_inr: number;
  category_breakdown: Record<string, number>;
  gross_revenue_inr: number;
  net_profit_inr: number;
  profit_per_acre_inr: number;
  entries: any[];
}

interface ExpenseYieldLedgerProps {
  summary: ExpenseSummary;
  activePlotId: string;
  onExpenseAdded: () => void;
}

export const ExpenseYieldLedger: React.FC<ExpenseYieldLedgerProps> = ({
  summary,
  activePlotId,
  onExpenseAdded,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userPhone = user?.phone;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [category, setCategory] = useState('Fertilizers');
  const [amount, setAmount] = useState(1500);
  const [note, setNote] = useState('Top-dressing urea application');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!note.trim()) {
      setFormError('Please enter a short note or description for this expense.');
      return;
    }

    setIsSubmitting(true);
    try {
      const phoneParam = userPhone ? `?phone=${encodeURIComponent(userPhone)}` : '';
      const res = await fetch(`/api/v1/farm/expenses${phoneParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_id: activePlotId,
          category,
          amount_inr: amount,
          note: note.trim(),
          phone: userPhone,
        }),
      });
      if (res.ok) {
        setIsAddOpen(false);
        setFormError('');
        onExpenseAdded();
      } else {
        const body = await res.json().catch(() => ({}));
        setFormError(body.detail || 'Could not record this expense.');
      }
    } catch (e) {
      setFormError('Farm service is unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-nutri-primary flex items-center gap-2">
            <Wallet className="w-5 h-5 text-nutri-secondary" />
            <span>{t('myFarm.tabExpenses', 'Farm Expense & Yield Ledger')}</span>
          </h2>
          <p className="text-xs text-nutri-muted font-semibold mt-0.5">
            Track input investments vs harvest revenue to maximize net profit per acre
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-nutri-primary hover:bg-nutri-secondary text-white text-xs font-bold transition self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('myFarm.addExpense', 'Log Input Expense')}</span>
        </button>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-nutri-muted">
            {t('myFarm.totalInvestment', 'Total Input Cost')}
          </span>
          <div className="text-lg sm:text-xl font-black text-nutri-primary mt-0.5">
            ₹{summary.total_expense_inr.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-nutri-muted font-medium">5 Categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
            {t('myFarm.grossRevenue', 'Gross Harvest Revenue')}
          </span>
          <div className="text-lg sm:text-xl font-black text-sky-950 mt-0.5">
            ₹{summary.gross_revenue_inr.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-sky-700 font-medium">Yield: 14 Qtl/Ac</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            {t('myFarm.netProfit', 'Net Season Profit')}
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-950 mt-0.5">
            ₹{summary.net_profit_inr.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">Revenue - Cost</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-100/70 border border-emerald-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
            {t('myFarm.profitPerAcre', 'Net Profit / Acre')}
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-950 mt-0.5">
            ₹{summary.profit_per_acre_inr.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-800 font-bold">Per Acre Basis</span>
        </div>
      </div>

      {/* INM Cost Savings Announcement */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 flex items-start gap-2.5 text-xs text-nutri-primary font-medium">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p>
          <strong>{t('myFarm.inputInsight', 'Input Optimization Insight')}:</strong> {t('myFarm.inmSavingsNotice', 'Integrated Nutrient Management (INM) reduced chemical fertilizer expenses by ₹1,650/acre while restoring soil organic carbon.')}
        </p>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="space-y-2 pt-2 border-t border-nutri-cardBorder text-xs">
        <span className="font-bold text-nutri-muted uppercase tracking-wider text-[11px] block">
          {t('myFarm.inputDistribution', 'Input Investment Distribution:')}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(summary.category_breakdown).map(([cat, amt]) => {
            const pct = summary.total_expense_inr > 0 ? ((amt / summary.total_expense_inr) * 100).toFixed(0) : '0';
            return (
              <div key={cat} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-nutri-primary">{cat}</div>
                <div className="text-sm font-black text-nutri-primary mt-0.5">₹{amt.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-nutri-muted">{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Entries Table */}
      <div className="space-y-2 pt-2 border-t border-nutri-cardBorder">
        <span className="font-bold text-nutri-muted uppercase tracking-wider text-[11px] block">
          {t('myFarm.recordedTransactions', 'Recorded Input Transactions:')}
        </span>
        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {summary.entries.map((e) => (
            <div key={e.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    {e.category}
                  </span>
                  <span className="text-[11px] text-nutri-muted">{e.date}</span>
                </div>
                <p className="text-xs text-nutri-primary font-medium mt-1">{e.note}</p>
              </div>
              <span className="font-black text-nutri-primary shrink-0">
                ₹{e.amount_inr.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-nutri-cardBorder space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-nutri-primary">{t('myFarm.logExpenseTitle', 'Log Farming Input Expense')}</h3>
              <button onClick={() => setIsAddOpen(false)} aria-label={t('common.close', 'Close')} className="w-8 h-8 rounded-full hover:bg-nutri-bg flex items-center justify-center text-nutri-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              {formError && (
                <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-red-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block font-bold text-nutri-primary mb-1">{t('myFarm.expenseCategory', 'Expense Category')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-nutri-cardBorder font-bold text-nutri-primary"
                >
                  <option value="Fertilizers">Fertilizers & Bio-Nutrients</option>
                  <option value="Seeds">Seeds & Seed Treatment</option>
                  <option value="Pesticides">Bio-Pesticides / Crop Protection</option>
                  <option value="Labor">Field Labor & Weeding</option>
                  <option value="Machinery">Machinery Hiring & Fuel</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-nutri-primary mb-1">{t('myFarm.amountInr', 'Amount (₹ INR)')}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-nutri-cardBorder font-bold text-nutri-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-nutri-primary mb-1">{t('myFarm.descNotes', 'Description / Notes')}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-nutri-cardBorder font-medium text-nutri-primary"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-nutri-primary text-white font-bold hover:bg-nutri-secondary"
                >
                  {isSubmitting ? t('common.saving', 'Recording...') : t('common.save', 'Save Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
