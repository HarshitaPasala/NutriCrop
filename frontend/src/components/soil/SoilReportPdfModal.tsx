'use client';

import React from 'react';
import { X, Printer, Download, Sprout, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';

interface SoilReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const SoilReportPdfModal: React.FC<SoilReportPdfModalProps> = ({ isOpen, onClose, data }) => {
  const { t } = useLanguage();

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const farm = data.farm_details;
  const nutrients = data.soil_nutrient_status;
  const optA = data.formulations_comparison[0];
  const optC = data.formulations_comparison[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 z-10 my-8">
        {/* Modal Controls (Hidden during print) */}
        <div className="print:hidden flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-nutri-secondary bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Printable / Downloadable Document
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-nutri-primary hover:bg-nutri-primaryHover text-white text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{t('soil.printPdf', 'Print / Save as PDF')}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              aria-label={t('common.close', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Report Shell */}
        <div id="printable-soil-report" className="space-y-6 text-gray-900 font-sans">
          {/* Header */}
          <div className="border-b-2 border-emerald-800 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sprout className="w-7 h-7 text-emerald-800" />
              <span className="text-xl font-black text-emerald-900 uppercase tracking-wide">
                NutriCrop — Soil Health Card & Fertilizer Prescription
              </span>
            </div>
            <p className="text-xs text-gray-600 font-semibold">
              Soil Test Crop Response (STCR) Analysis • Approved by ICAR / SAU Standards
            </p>
            <div className="mt-2 text-[11px] font-mono text-gray-500">
              Report ID: NC-SHC-2026-{data.report_id || '9841'} • Date: 17 November 2026
            </div>
          </div>

          {/* Farmer & Plot Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 text-xs">
            <div>
              <span className="text-gray-500 font-bold block uppercase text-[10px]">{t('soil.farmerName', 'Farmer Name')}</span>
              <strong className="text-nutri-dark text-sm">{data.farmer_name || 'Farmer'}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-bold block uppercase text-[10px]">{t('soil.villageDistrict', 'Village / District')}</span>
              <strong className="text-nutri-dark">{data.location || 'Tenali Village, Guntur'}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-bold block uppercase text-[10px]">{t('soil.targetCrop', 'Target Crop')}</span>
              <strong className="text-nutri-dark">{translateCrop(farm.crop, t)}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-bold block uppercase text-[10px]">{t('soil.farmSize', 'Farm Size')}</span>
              <strong className="text-nutri-dark">{farm.farm_size_acres} {t('dashboard.acres', 'Acres')} ({farm.farm_size_ha} ha)</strong>
            </div>
          </div>

          {/* Test Values Table */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-2">
              1. Soil Chemical Analysis (Lab Test Values)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-900 text-white text-[11px] font-bold">
                  <tr>
                    <th className="p-2.5">{t('soil.parameter', 'Parameter')}</th>
                    <th className="p-2.5">{t('soil.testValue', 'Test Value')}</th>
                    <th className="p-2.5">{t('soil.standardRange', 'Standard Range')}</th>
                    <th className="p-2.5">{t('soil.nutrientStatus', 'Nutrient Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  <tr>
                    <td className="p-2.5 font-bold">{t('soil.nitrogen', 'Available Nitrogen (N)')}</td>
                    <td className="p-2.5">{nutrients.n.value} kg/ha</td>
                    <td className="p-2.5 text-gray-500">280 – 560 kg/ha</td>
                    <td className="p-2.5 font-bold text-emerald-800">{nutrients.n.status}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">{t('soil.phosphorus', 'Available Phosphorus (P)')}</td>
                    <td className="p-2.5">{nutrients.p.value} kg/ha</td>
                    <td className="p-2.5 text-gray-500">10 – 25 kg/ha</td>
                    <td className="p-2.5 font-bold text-emerald-800">{nutrients.p.status}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">{t('soil.potassium', 'Available Potassium (K)')}</td>
                    <td className="p-2.5">{nutrients.k.value} kg/ha</td>
                    <td className="p-2.5 text-gray-500">108 – 280 kg/ha</td>
                    <td className="p-2.5 font-bold text-emerald-800">{nutrients.k.status}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">{t('soil.phReaction', 'Soil Reaction (pH)')}</td>
                    <td className="p-2.5">{nutrients.ph.value}</td>
                    <td className="p-2.5 text-gray-500">6.0 – 7.5 (Optimal)</td>
                    <td className="p-2.5 font-bold text-emerald-800">{nutrients.ph.status}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">{t('soil.organicCarbon', 'Organic Carbon (OC)')}</td>
                    <td className="p-2.5">{nutrients.oc.value}%</td>
                    <td className="p-2.5 text-gray-500">0.50% – 0.75%</td>
                    <td className="p-2.5 font-bold text-emerald-800">{nutrients.oc.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Fertilizer Dose */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-2">
              2. Recommended Balanced Fertilizer Requirement
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {optA.fertilizers.map((fert: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <span className="font-bold text-gray-900 block">{fert.name}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-sm text-emerald-900">{fert.bags} Bags</strong>
                    <span className="text-[11px] text-gray-500">({fert.quantity_kg} kg)</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Est. Price: ₹{fert.cost}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-xs font-black text-emerald-950">
              Total Estimated Chemical Cost: ₹{optA.estimated_cost_inr.toLocaleString('en-IN')}
            </div>
          </div>

          {/* INM Biological Savings Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs">
            <strong className="text-emerald-950 block font-bold mb-1">
              🌱 Integrated Nutrient Management (INM) Recommendation:
            </strong>
            <p className="text-emerald-900 text-[11px] leading-relaxed">
              By replacing 25% of chemical fertilizers with Farm Yard Manure (2 tonnes/acre) and biofertilizers (Azotobacter + PSB), the farmer saves <strong className="font-bold">₹{optC.chemical_savings_inr}</strong> while improving soil microbial organic carbon.
            </p>
          </div>

          {/* Footer & Signature Block */}
          <div className="pt-6 border-t border-gray-300 flex items-end justify-between text-xs text-gray-500">
            <div>
              <span className="block font-bold text-gray-700">Issued by:</span>
              <span>NutriCrop Smart Farming Advisory System</span>
              <span className="block text-[10px]">Reference: {farm.citation}</span>
            </div>
            <div className="text-right">
              <div className="h-8 border-b border-gray-400 w-36 mb-1 ml-auto"></div>
              <span className="font-bold text-gray-700 block">Agronomist Sign / Stamp</span>
              <span className="text-[10px]">District KVK Center</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
