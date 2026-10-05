import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { inviteTeamMember } from '../../api/settings';
import { TeamMember } from '../../types';
import { UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (member: TeamMember) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const created = await inviteTeamMember(email, role);
      setIsLoading(false);
      onSuccess(created);
      onClose();
      setEmail('');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      subtitle="Grant access to your Samvada workspace and assign role permissions."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="colleague@yourcompany.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Select
          label="Workspace Role"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          options={[
            { value: 'admin', label: 'Admin (Full workspace access & billing)' },
            { value: 'developer', label: 'Developer (Create agents, view call logs & API keys)' },
            { value: 'viewer', label: 'Viewer (Read-only access to analytics & logs)' },
          ]}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!email.trim()}>
            <UserPlus className="w-4 h-4 mr-2" />
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
