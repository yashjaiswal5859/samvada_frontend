import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

const INDUSTRY_TABS = [
  'All',
  'Healthcare & Medical',
  'Home & Trade Services',
  'Real Estate & Property Management',
  'Retail & E-commerce',
  'Insurance',
  'Banking & Financial Services',
  'Legal Services',
  'Automotive',
  'Beauty, Salon & Spa',
  'Restaurants & Food Service',
  'Hospitality & Travel',
  'Education & Training',
  'Fitness & Wellness',
  'Technology & SaaS',
  'Professional Services',
  'Logistics & Transportation',
  'Staffing & Recruitment',
  'Utilities & Telecom',
  'Veterinary & Pet Care',
  'Manufacturing & Industrial',
  'Government & Public Sector',
  'Non-Profit & Community',
  'Media & Entertainment',
  'General / Cross-industry',
  'Others',
];

const USECASE_TABS = [
  'All',
  'Receptionist',
  'Scheduling',
  'Intake',
  'Billing',
  'Customer Support',
  'Outreach',
  'Sales',
  'Research',
  'Enablement',
];

export const ExploreAgents: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Insurance');
  const [selectedUseCase, setSelectedUseCase] = useState('All');

  return (
    <div className="bg-[#111217] border border-zinc-800/80 rounded-2xl p-6 space-y-5 text-left">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold text-white">Explore agents</h2>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0b0c10] border border-zinc-800 rounded-full pl-8 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors w-52"
            />
          </div>
        </div>

        <button className="inline-flex items-center text-xs font-medium text-zinc-300 hover:text-white bg-[#1a1b23] border border-zinc-700/60 rounded-full px-4 py-1.5 transition-colors cursor-pointer">
          Browse all <ArrowRight className="w-3 h-3 ml-1.5" />
        </button>
      </div>

      {/* Filter Row 1: Industry */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 font-medium shrink-0 min-w-16">Industry</span>
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth">
          {INDUSTRY_TABS.map((ind) => {
            const isSelected = selectedIndustry === ind;
            return (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-[#181920] text-zinc-400 hover:text-zinc-200 hover:bg-[#20212b]'
                }`}
              >
                {ind}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Row 2: Use Case */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 font-medium shrink-0 min-w-16">Use case</span>
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth">
          {USECASE_TABS.map((uc) => {
            const isSelected = selectedUseCase === uc;
            return (
              <button
                key={uc}
                onClick={() => setSelectedUseCase(uc)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-[#181920] text-zinc-400 hover:text-zinc-200 hover:bg-[#20212b]'
                }`}
              >
                {uc}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
