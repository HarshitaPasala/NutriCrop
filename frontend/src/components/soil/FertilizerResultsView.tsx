'use client';

import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingDown,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Download,
  Printer,
  Package,
} from 'lucide-react';
import { useLanguage, translateCrop, translateSoilType } from '@/context/LanguageContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface FertilizerResultsViewProps {
  data: any;
  onOpenPdfReport: () => void;
  onRecalculate: () => void;
}

export const FertilizerResultsView: React.FC<FertilizerResultsViewProps> = ({
  data,
  onOpenPdfReport,
  onRecalculate,
}) => {
  const { t } = useLanguage();
  const [selectedOptionId, setSelectedOptionId] = useState<string>('option_3_inm');

  const nutrients = data.soil_nutrient_status;
  const formulations = data.formulations_comparison || [];
  const schedule = data.application_schedule || [];
  const amendments = data.soil_amendments || [];
  const organics = data.organic_alternatives || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Success & Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-nutri-secondary bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {t('soil.stcrPrescriptionReady', 'STCR Prescription Ready')}
            </span>
            <DemoBadge />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-nutri-primary">
            {translateCrop(data.farm_details.crop, t)} {t('soil.fertilizerPlan', 'Fertilizer Plan')}
          </h2>
          <p className="text-xs text-nutri-muted font-medium mt-0.5">
            {t('myFarm.totalArea', 'Plot Size')}: {data.farm_details.farm_size_acres} {t('dashboard.acres', 'Acres')} ({data.farm_details.farm_size_ha} {t('soil.hectares', 'Hectares')}) • {t('soil.soilType', 'Soil')}: {translateSoilType(data.farm_details.soil_type, t)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenPdfReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-nutri-primary hover:bg-nutri-primaryHover text-white text-xs sm:text-sm font-bold transition shadow-sm min-h-touch active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{t('soil.downloadPdf', 'Download Official Report')}</span>
          </button>
          <button
            type="button"
            onClick={onRecalculate}
            className="px-3.5 py-2.5 rounded-2xl bg-nutri-bg hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-bold transition min-h-touch"
          >
            {t('soil.editInputs', 'Edit Inputs')}
          </button>
        </div>
      </div>

      {Number.isFinite(data.soil_health_score) && <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-black text-emerald-950">{t('soil.healthIndicator', 'Estimated soil health indicator')}</h3><strong className="text-xl text-emerald-950">{data.soil_health_score}/100 · {data.soil_health_rating}</strong></div>
        <p className="mt-1 text-xs text-emerald-900">{t('soil.healthIndicatorNote', 'Based on the submitted N, P, K, organic carbon and pH classes; use a lab Soil Health Card for official assessment.')}</p>
        <p className="mt-2 text-xs text-emerald-900"><strong>{t('soil.organicCarbon', 'Organic Carbon (%)')}:</strong> {nutrients.oc.value}% · {nutrients.oc.status} — {nutrients.oc.comment}</p>
      </section>}

      {/* 1. Nutrient Status Meters (N, P, K, pH) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-nutri-primary">
            {t('soil.nutrientStatus', 'Soil Nutrient Fertility Status')}
          </h3>
          <span className="text-xs text-nutri-muted font-semibold">
            {t('soil.basedOnCard', 'Based on Soil Health Card lab values')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Nitrogen Status */}
          <div className="p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.nitrogen', 'Available Nitrogen (N)')}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-nutri-dark">{nutrients.n.value} <span className="text-xs font-normal">kg/ha</span></span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                nutrients.n.status === 'Low' ? 'bg-rose-100 text-rose-800' :
                nutrients.n.status === 'Medium' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {nutrients.n.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-tight">
              {nutrients.n.comment}
            </p>
          </div>

          {/* Phosphorus Status */}
          <div className="p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.phosphorus', 'Available Phosphorus (P)')}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-nutri-dark">{nutrients.p.value} <span className="text-xs font-normal">kg/ha</span></span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                nutrients.p.status === 'Low' ? 'bg-rose-100 text-rose-800' :
                nutrients.p.status === 'Medium' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {nutrients.p.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-tight">
              {nutrients.p.comment}
            </p>
          </div>

          {/* Potassium Status */}
          <div className="p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.potassium', 'Available Potassium (K)')}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-nutri-dark">{nutrients.k.value} <span className="text-xs font-normal">kg/ha</span></span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                nutrients.k.status === 'Low' ? 'bg-rose-100 text-rose-800' :
                nutrients.k.status === 'Medium' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {nutrients.k.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-tight">
              {nutrients.k.comment}
            </p>
          </div>

          {/* pH Reaction */}
          <div className="p-3.5 rounded-2xl bg-nutri-bg border border-nutri-cardBorder space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase">{t('soil.phReaction', 'Soil pH Reaction')}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-nutri-dark">{nutrients.ph.value}</span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                nutrients.ph.status.includes('Acidic') ? 'bg-amber-100 text-amber-900' :
                nutrients.ph.status.includes('Optimal') || nutrients.ph.status.includes('Neutral') ? 'bg-emerald-100 text-emerald-800' :
                'bg-purple-100 text-purple-900'
              }`}>
                {nutrients.ph.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-tight">
              {nutrients.ph.comment}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Fertilizer Formulation Cost Comparison (Core Requirement) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-nutri-primary text-xs font-bold mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('soil.financialComp', 'Side-by-Side Financial Comparison')}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-nutri-primary">
            {t('soil.costComparisonTitle', 'Fertilizer Formulation Cost Comparison')}
          </h3>
          <p className="text-xs text-nutri-muted font-medium">
            Compare 3 government-approved formulation options for your {data.farm_details.farm_size_acres} acre farm plot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {formulations.map((formulation: any) => {
            const isSelected = selectedOptionId === formulation.id;
            const isINM = formulation.id === 'option_3_inm';

            return (
              <div
                key={formulation.id}
                onClick={() => setSelectedOptionId(formulation.id)}
                className={`relative rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-nutri-secondary bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-nutri-cardBorder bg-white hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isINM
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-nutri-bg text-nutri-dark font-bold'
                      }`}
                    >
                      {formulation.badge}
                    </span>
                    {isINM && formulation.chemical_savings_inr > 0 && (
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Saves ₹{formulation.chemical_savings_inr}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-nutri-dark mb-1">
                    {formulation.title}
                  </h4>
                  <p className="text-xs text-nutri-muted font-medium mb-4 leading-snug">
                    {formulation.subtitle}
                  </p>

                  {/* Fertilizer bag list */}
                  <div className="space-y-2 mb-4">
                    {formulation.fertilizers.map((fert: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white border border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-nutri-secondary shrink-0" />
                          <span className="font-semibold text-gray-800">{fert.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-nutri-primary block">
                            {fert.bags} Bags <span className="text-[10px] text-gray-500">({fert.quantity_kg} kg)</span>
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold">₹{fert.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Cost & Selector */}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">{t('soil.totalCost', 'Total Cost')}</span>
                    <span className="text-xl font-black text-nutri-primary">
                      ₹{formulation.estimated_cost_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-nutri-muted font-semibold block">
                      (₹{formulation.cost_per_acre_inr}/acre)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOptionId(formulation.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-nutri-secondary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
                    }`}
                  >
                    {isSelected ? t('common.selected', 'Selected') : t('common.selectPlan', 'Select Plan')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Stage-wise Application Splitting Schedule */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-nutri-primary">
              {t('soil.applicationSchedule', 'Stage-wise Splitting Schedule')}
            </h3>
            <p className="text-xs text-nutri-muted font-medium">
              Do not apply all fertilizers at once. Split applications maximize crop absorption and prevent leaching.
            </p>
          </div>
          <Clock className="w-5 h-5 text-nutri-secondary" />
        </div>

        <div className="space-y-3">
          {schedule.map((step: any, index: number) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-nutri-bg border border-nutri-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-nutri-dark">
                      {step.stage}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600">
                      Day {step.days_after_sowing}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-medium">
                    {step.action_guidance}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-nutri-primary sm:border-l sm:border-gray-200 sm:pl-4">
                {step.urea_kg > 0 && <span>Urea: {step.urea_kg} kg</span>}
                {step.dap_kg > 0 && <span>DAP: {step.dap_kg} kg</span>}
                {step.mop_kg > 0 && <span>Potash: {step.mop_kg} kg</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Soil Amendments & Organic Alternatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Soil Amendments (Lime / Gypsum if applicable) */}
        <div className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-black text-nutri-primary">
              {t('soil.soilAmendmentsTitle', 'Soil Amendments (pH Correction)')}
            </h4>
          </div>

          {amendments.length > 0 ? (
            <div className="space-y-2">
              {amendments.map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>{item.name}</span>
                    <span>{item.bags} Bags ({item.quantity_kg} kg)</span>
                  </div>
                  <p className="text-[11px] text-amber-800">{item.reason}</p>
                  <span className="text-[11px] font-semibold block text-right">Est. Cost: ₹{item.est_cost_inr}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-xs text-emerald-900 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('soil.optimalPhNote', 'Optimal pH range (6.0–7.5). No chemical lime or gypsum amendment required!')}</span>
            </div>
          )}
        </div>

        {/* Organic Alternatives & Biological Boosters */}
        <div className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-black text-nutri-primary">
              {t('soil.organicAlternativesTitle', 'Organic & Biological Alternatives')}
            </h4>
          </div>

          <div className="space-y-2">
            {organics.map((org: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-nutri-bg border border-nutri-cardBorder text-xs text-gray-800 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-nutri-primary">
                  <span>{org.practice}</span>
                  <span className="text-[11px] text-nutri-secondary">{org.dosage}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">{org.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory Legal Disclaimer */}
      <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-300 text-xs text-nutri-primary font-medium flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <p>{t('soil.disclaimer')}</p>
      </div>
    </div>
  );
};
