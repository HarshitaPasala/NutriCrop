'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Info,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface SchemesContainerProps {
  onBackToDashboard: () => void;
}

export const SchemesContainer: React.FC<SchemesContainerProps> = ({
  onBackToDashboard,
}) => {
  const { t } = useLanguage();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSchemes(selectedCategory);
  }, [selectedCategory]);

  const fetchSchemes = async (cat: string) => {
    setIsLoading(true);
    try {
      const url = cat === 'all' ? '/api/v1/schemes/list' : `/api/v1/schemes/list?category=${cat}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes || []);
      } else {
        loadFallback();
      }
    } catch (e) {
      loadFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallback = () => {
    setSchemes([
      {
        id: 'pm-kisan',
        title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        category: 'Central',
        ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
        financial_benefit: '₹6,000 per year directly transferred to bank account in 3 equal installments of ₹2,000 every 4 months.',
        eligibility_criteria: [
            'All landholding farmer families with cultivable land in their name',
            'Small and marginal farmers across all Indian states and UTs',
            'Institutional landholders and high-income tax payers are excluded',
        ],
        required_documents: [
            'Aadhaar Card linked with mobile number',
            'Land ownership record (RoR / 1-B / Patta passbook)',
            'Active bank account details with Aadhaar NPCI seeding',
        ],
        official_portal_url: 'https://pmkisan.gov.in',
      },
      {
        id: 'pmfby',
        title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
        category: 'Central',
        ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
        financial_benefit: 'Comprehensive crop insurance coverage against non-preventable natural risks (drought, flood, unseasonal hail, pest epidemic).',
        eligibility_criteria: [
            'Farmers growing notified crops in notified insurance units',
            'Available for both loanee (KCC) and non-loanee farmers',
            'Affordable farmer premium: 2% for Kharif crops, 1.5% for Rabi, 5% for commercial/horticultural crops',
        ],
        required_documents: [
            'Sowing certificate / self-declaration of crop sown',
            'Land record document (Patta / Khatauni / Tenancy agreement)',
            'Bank passbook copy',
        ],
        official_portal_url: 'https://pmfby.gov.in',
      },
      {
        id: 'smam-mechanization',
        title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
        category: 'Central',
        ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
        financial_benefit: '40% to 50% government subsidy for purchasing farm implements (power tillers, tractor attachments, drone sprayers, rotavators).',
        eligibility_criteria: [
            'Individual farmers, Farmer Producer Organizations (FPOs), and Self-Help Groups (SHGs)',
            'Special preference and higher subsidy percentage for women and SC/ST farmers',
        ],
        required_documents: [
            'Aadhaar identification card',
            'Bank passbook',
            'Quotation from authorized agricultural machinery dealer',
        ],
        official_portal_url: 'https://agrimachinery.nic.in',
      },
      {
        id: 'pkvy-organic',
        title: 'Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming)',
        category: 'Central',
        ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
        financial_benefit: 'Financial assistance of ₹50,000 per hectare for 3 years, including ₹31,000/ha direct incentive for bio-fertilizers, neem cake, and bio-pesticides.',
        eligibility_criteria: [
            'Farmers forming farmer clusters (minimum 20 hectares or 50 farmers per cluster)',
            'Commitment to chemical-free Participatory Guarantee System (PGS-India) certification',
        ],
        required_documents: [
            'Cluster registration resolution',
            'Farmer land documents and photo ID',
        ],
        official_portal_url: 'https://pgsindia-ncof.gov.in',
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>
      </div>

      {/* Main Title Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              Government Support
            </span>
            <DemoBadge />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-nutri-primary flex items-center gap-2">
            <Award className="w-6 h-6 text-nutri-secondary" />
            <span>{t('schemes.title', 'Government Farmer Schemes')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-nutri-muted mt-1">
            {t(
              'schemes.subtitle',
              'Official financial incentives, crop insurance, and equipment subsidies for small & marginal farmers.'
            )}
          </p>
        </div>

        {/* Privacy & Safe Redirection Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 text-xs text-nutri-primary font-medium">
          <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
          <p>
            <strong>Privacy Assurance:</strong> NutriCrop does not collect or store sensitive identity documents like Aadhaar cards or bank account numbers. Direct links to official government portals (.gov.in) are provided for safe self-application or visiting your nearest CSC center.
          </p>
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {schemes.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4 hover:border-emerald-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {s.category} Scheme • {s.ministry}
                </span>
                <h3 className="text-lg font-black text-nutri-primary mt-1.5">
                  {s.title}
                </h3>
              </div>

              <a
                href={s.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-nutri-primary hover:bg-nutri-secondary text-white text-xs font-bold transition self-start shrink-0 min-h-[44px]"
              >
                <span>{t('schemes.applyOfficial', 'Apply on Official Portal')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Financial Benefit Highlight */}
            <div className="p-3.5 rounded-2xl bg-nutri-bg/60 border border-nutri-cardBorder">
              <span className="text-[11px] font-bold text-nutri-muted uppercase tracking-wider">
                {t('schemes.benefits', 'Financial & Input Benefit')}:
              </span>
              <p className="text-xs sm:text-sm font-black text-nutri-primary mt-0.5">
                {s.financial_benefit}
              </p>
            </div>

            {/* Eligibility & Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-nutri-primary uppercase tracking-wider text-[11px]">
                  {t('schemes.eligibility', 'Eligibility Criteria')}:
                </span>
                <ul className="space-y-1">
                  {s.eligibility_criteria.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 font-medium text-nutri-primary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-nutri-primary uppercase tracking-wider text-[11px]">
                  {t('schemes.requiredDocs', 'Required Documents')}:
                </span>
                <ul className="space-y-1">
                  {s.required_documents.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 font-medium text-nutri-primary">
                      <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
