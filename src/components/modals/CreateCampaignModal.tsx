import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { getAgents } from '../../api/agents';
import { getAudiences } from '../../api/contacts';
import { createCampaign } from '../../api/campaigns';
import { Agent, Audience, Campaign } from '../../types';
import { Megaphone, Play } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaign: Campaign) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedAudienceId, setSelectedAudienceId] = useState('');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAgents().then((data) => {
        setAgents(data);
        if (data.length > 0) setSelectedAgentId(data[0].id);
      });
      getAudiences().then((data) => {
        setAudiences(data);
        if (data.length > 0) setSelectedAudienceId(data[0].id);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedAgentId || !selectedAudienceId) return;

    setIsLoading(true);
    try {
      const campaign = await createCampaign({
        name,
        agentId: selectedAgentId,
        targetAudienceId: selectedAudienceId,
        scheduledAt: scheduleType === 'scheduled' ? scheduledAt : undefined,
      });
      setIsLoading(false);
      onSuccess(campaign);
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
      title="Launch Outbound Campaign"
      subtitle="Select an AI agent and a target audience to start automated outbound calling."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Campaign Name"
          placeholder="e.g. September Customer Renewal Drive"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Assign Voice Agent"
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          options={agents.map((a) => ({
            value: a.id,
            label: `${a.name} (${a.role})`,
          }))}
        />

        <Select
          label="Target Audience List"
          value={selectedAudienceId}
          onChange={(e) => setSelectedAudienceId(e.target.value)}
          options={audiences.map((aud) => ({
            value: aud.id,
            label: `${aud.name} (${aud.contactCount} contacts)`,
          }))}
        />

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide">
            Schedule Execution
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setScheduleType('immediate')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                scheduleType === 'immediate'
                  ? 'bg-indigo-600/10 border-indigo-500 text-white font-semibold'
                  : 'bg-[#181922] border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Start Immediately
            </button>

            <button
              type="button"
              onClick={() => setScheduleType('scheduled')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                scheduleType === 'scheduled'
                  ? 'bg-indigo-600/10 border-indigo-500 text-white font-semibold'
                  : 'bg-[#181922] border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Schedule Date & Time
            </button>
          </div>
        </div>

        {scheduleType === 'scheduled' && (
          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
            <Play className="w-4 h-4 mr-2 fill-current" />
            Launch Campaign
          </Button>
        </div>
      </form>
    </Modal>
  );
};
