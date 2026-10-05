import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createApiKey } from '../../api/settings';
import { ApiKey } from '../../types';
import { Key, Copy, Check } from 'lucide-react';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (key: ApiKey) => void;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const res = await createApiKey(name);
      setSecretKey(res.secret);
      onSuccess(res.apiKey);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setSecretKey(null);
    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New API Key"
      subtitle="API keys grant full access to your Voice AI agents & outbound call API."
      maxWidth="md"
    >
      {!secretKey ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          <Input
            label="Key Name / Identifier"
            placeholder="e.g. Production Backend Webhook Key"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
              <Key className="w-4 h-4 mr-2" />
              Generate API Key
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
            <p className="font-bold mb-1">API Key Generated Successfully!</p>
            <p>Please copy your API key now. You will not be able to see it again!</p>
          </div>

          <div className="relative">
            <input
              readOnly
              value={secretKey}
              className="w-full bg-[#181922] border border-zinc-700 rounded-xl px-4 py-3 font-mono text-xs text-indigo-300 pr-12 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <Button type="button" fullWidth onClick={handleClose}>
            Done & Close
          </Button>
        </div>
      )}
    </Modal>
  );
};
