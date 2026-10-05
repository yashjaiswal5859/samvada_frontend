import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { AVAILABLE_VOICES, AVAILABLE_MODELS } from '../../utils/constants';
import { createAgent } from '../../api/agents';
import { Agent } from '../../types';
import { Sparkles, Bot, CheckCircle } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Customer Support Specialist');
  const [selectedVoice, setSelectedVoice] = useState(AVAILABLE_VOICES[0].id);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('support');
  const [isLoading, setIsLoading] = useState(false);

  const templates = [
    { id: 'support', title: 'Customer Support', icon: '🎧', desc: 'Resolves FAQs & handles inbound inquiries' },
    { id: 'claims', title: 'Insurance Claims', icon: '📋', desc: 'Registers incident reports & verifies policies' },
    { id: 'dental', title: 'Appointment Booking', icon: '🩺', desc: 'Schedules visits & confirms availability' },
    { id: 'outbound', title: 'Payment Reminder', icon: '💳', desc: 'Outbound payment outreach & reminders' },
  ];

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplate(tplId);
    if (tplId === 'support') {
      setName('Support AI Assistant');
      setRole('Customer Support Specialist');
    } else if (tplId === 'claims') {
      setName('Claims Intake Specialist');
      setRole('Insurance Claims Agent');
    } else if (tplId === 'dental') {
      setName('Dental Receptionist');
      setRole('Appointment Scheduler');
    } else if (tplId === 'outbound') {
      setName('Payment Reminder Bot');
      setRole('Outbound Collector');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const created = await createAgent({
        name,
        role,
        voiceId: selectedVoice,
        model: selectedModel,
        systemPrompt: `You are ${name}, a professional ${role}. Speak clearly, stay empathetic, and assist the user concisely.`,
      });
      setIsLoading(false);
      onSuccess(created);
      onClose();
      setName('');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Voice Agent"
      subtitle="Select a 1-click template or configure your custom voice persona."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Template Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide">
            1-Click Template Preset
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md'
                      : 'bg-[#181922] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xl">{tpl.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">{tpl.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{tpl.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-indigo-400 absolute top-2.5 right-2.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 pt-2 border-t border-zinc-800/80">
          <Input
            label="Agent Name"
            placeholder="e.g. Samvada Claims Bot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Role / Title"
            placeholder="e.g. Senior Claims Specialist"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Voice Persona"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              options={AVAILABLE_VOICES.map((v) => ({
                value: v.id,
                label: `${v.name} (${v.accent})`,
              }))}
            />

            <Select
              label="Intelligence Model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              options={AVAILABLE_MODELS.map((m) => ({
                value: m.id,
                label: m.name,
              }))}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
            <Sparkles className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </form>
    </Modal>
  );
};
