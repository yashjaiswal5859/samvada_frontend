import React, { useState } from 'react';
import { Search, ArrowUpRight, ShieldCheck, Calendar, CreditCard, Headphones } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

const INDUSTRY_TABS = [
  'All',
  'Insurance',
  'Healthcare & Medical',
  'Banking & Financial Services',
  'Real Estate & Property Management',
  'Retail & E-commerce',
  'Home & Trade Services',
  'Legal Services',
  'Automotive',
  'Technology & SaaS',
  'Professional Services',
  'Education & Training',
];

const USECASE_TABS = [
  'All',
  'Customer Support',
  'Scheduling',
  'Intake',
  'Billing',
  'Outreach',
  'Receptionist',
  'Sales',
];

interface AgentTemplate {
  id: string;
  name: string;
  industry: string;
  useCase: string;
  description: string;
  icon: React.ElementType;
}

const FEATURED_TEMPLATES: AgentTemplate[] = [
  {
    id: 'claims',
    name: 'Insurance Claims Intake Specialist',
    industry: 'Insurance',
    useCase: 'Intake',
    description: 'Captures first-notice-of-loss incident reports, validates policy status, and issues claim reference IDs.',
    icon: ShieldCheck,
  },
  {
    id: 'dental',
    name: 'Healthcare Appointment Booking',
    industry: 'Healthcare & Medical',
    useCase: 'Scheduling',
    description: 'Coordinates doctor availability, schedules patient appointments, and handles rescheduling requests.',
    icon: Calendar,
  },
  {
    id: 'outbound',
    name: 'Accounts Receivable & Payment Reminder',
    industry: 'Banking & Financial Services',
    useCase: 'Billing',
    description: 'Automates payment due notices, offers structured installment plans, and records payment commitments.',
    icon: CreditCard,
  },
  {
    id: 'support',
    name: 'Tier-1 Customer Inquiries Specialist',
    industry: 'Technology & SaaS',
    useCase: 'Customer Support',
    description: 'Resolves common customer FAQs, checks order or account status, and seamlessly transfers complex issues.',
    icon: Headphones,
  },
];

interface ExploreAgentsProps {
  onSelectTemplate?: (templatePrompt: string, agentName: string) => void;
}

export const ExploreAgents: React.FC<ExploreAgentsProps> = ({ onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedUseCase, setSelectedUseCase] = useState('All');

  const filteredTemplates = FEATURED_TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || tpl.industry === selectedIndustry;
    const matchesUseCase = selectedUseCase === 'All' || tpl.useCase === selectedUseCase;
    return matchesSearch && matchesIndustry && matchesUseCase;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 text-left shadow-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Starter templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">Start with an example, then tailor it to your workflow.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search starter templates"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 w-48 sm:w-56 transition-all"
            />
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-end">
        <div>
          <CustomSelect
            label="Industry"
            value={selectedIndustry}
            onChange={(val) => setSelectedIndustry(val)}
            options={INDUSTRY_TABS.map((industry) => ({
              value: industry,
              label: industry === 'All' ? 'All industries' : industry,
            }))}
            size="sm"
          />
        </div>
        <div>
          <CustomSelect
            label="Use case"
            value={selectedUseCase}
            onChange={(val) => setSelectedUseCase(val)}
            options={USECASE_TABS.map((useCase) => ({
              value: useCase,
              label: useCase === 'All' ? 'All use cases' : useCase,
            }))}
            size="sm"
          />
        </div>
        <div className="flex items-end justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span aria-live="polite">{filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}</span>
          {(selectedIndustry !== 'All' || selectedUseCase !== 'All' || searchQuery) && (
            <button type="button" onClick={() => { setSelectedIndustry('All'); setSelectedUseCase('All'); setSearchQuery(''); }} className="py-2 font-medium text-slate-700 underline underline-offset-2">Clear filters</button>
          )}
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate?.(`Create a voice agent for ${template.name}. Key tasks: ${template.description} Ask me for any missing business details before finalizing the agent.`, template.name)}
              aria-label={`Use ${template.name} starter template`}
              className="w-full text-left p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/70 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 transition-all flex flex-col justify-between group cursor-pointer shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-[#0f172a] group-hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{template.name}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{template.description}</p>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 text-[10px]">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{template.industry}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">{template.useCase}</span>
              </div>
            </button>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400 text-xs">
            No templates match these filters. Try another search or clear filters.
          </div>
        )}
      </div>
    </div>
  );
};
