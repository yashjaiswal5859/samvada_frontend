import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { saveIndustries } from '../../api/onboarding';
import { Loader2, ArrowRight } from 'lucide-react';

const ALL_INDUSTRIES = [
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

export const IndustrySelectPage: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const toggleIndustry = (ind: string) => {
    if (selected.includes(ind)) {
      setSelected(selected.filter((i) => i !== ind));
    } else {
      if (selected.length >= 3) {
        setError('You can select up to 3 industries');
        return;
      }
      setError('');
      setSelected([...selected, ind]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      setError('Please select at least 1 industry');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await saveIndustries({ industries: selected });
      await refreshUser();
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to save industry preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Background ambient lighting effects matching Samvada theme */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-[560px] flex flex-col z-10 animate-fade-in">
        {/* Brand Header: Samvada soundwave logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center gap-1 shadow-md shadow-indigo-500/10">
            <div className="w-0.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
            <div className="w-0.5 h-4.5 bg-indigo-400 rounded-full" />
            <div className="w-0.5 h-3 bg-indigo-500 rounded-full" />
            <div className="w-0.5 h-1.5 bg-indigo-600 rounded-full" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Samvada</span>
        </div>

        {/* 2-Pill Progress Bar: Both filled indigo for Step 2 */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="h-1.5 w-16 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/30" />
          <div className="h-1.5 w-16 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/30" />
        </div>

        {/* Title & Subtitles */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1.5">Almost there!</h1>
          <p className="text-sm text-zinc-400 mb-4">The journey is almost complete.</p>
          <h2 className="text-sm font-semibold text-indigo-400 mb-1">Which industries are you in?</h2>
          <p className="text-xs text-zinc-400">Select up to 3 industries, including others.</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Industry Pill Badges Container */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {ALL_INDUSTRIES.map((ind) => {
            const isSelected = selected.includes(ind);
            const slug = ind.toLowerCase().replace(/[^a-z0-9]/g, '-');
            return (
              <button
                id={`industry-chip-${slug}`}
                key={ind}
                type="button"
                onClick={() => toggleIndustry(ind)}
                className={`px-4 py-2 rounded-full border text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer select-none ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-600/20 text-white ring-1 ring-indigo-500/60 shadow-sm shadow-indigo-500/10'
                    : 'border-zinc-800/90 bg-[#121319] text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {ind}
              </button>
            );
          })}
        </div>

        {/* Solid white 'Lets get started →' Button */}
        <button
          id="lets-get-started-btn"
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || selected.length === 0}
          className="w-full bg-white text-black font-semibold py-3.5 px-4 rounded-xl hover:bg-zinc-200 active:scale-[0.99] transition-all text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <>
              <span>Lets get started</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
