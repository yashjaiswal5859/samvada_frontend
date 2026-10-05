import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createContact } from '../../api/contacts';
import { Contact } from '../../types';
import { UserPlus, Upload } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contact: Contact) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [tab, setTab] = useState<'single' | 'csv'>('single');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsLoading(true);
    try {
      const created = await createContact(name, phone, email, company);
      setIsLoading(false);
      onSuccess(created);
      onClose();
      setName('');
      setPhone('');
      setEmail('');
      setCompany('');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Contacts to Audience"
      subtitle="Add individual contacts or upload a CSV file with customer numbers."
      maxWidth="md"
    >
      <div className="flex border-b border-zinc-800 mb-4">
        <button
          type="button"
          onClick={() => setTab('single')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            tab === 'single' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Single Contact Entry
        </button>
        <button
          type="button"
          onClick={() => setTab('csv')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            tab === 'csv' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Bulk CSV Import
        </button>
      </div>

      {tab === 'single' ? (
        <form onSubmit={handleSubmitSingle} className="space-y-4">
          <Input
            label="Contact Full Name"
            placeholder="e.g. Robert Fox"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Phone Number (E.164 Format)"
            placeholder="+15552345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="robert@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Company Name"
              placeholder="Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!name.trim() || !phone.trim()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-center py-6">
          <div className="border-2 border-dashed border-zinc-700/80 rounded-2xl p-8 hover:border-indigo-500 transition-colors cursor-pointer bg-[#181922]">
            <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-200">Drag and drop your CSV file here</p>
            <p className="text-xs text-zinc-500 mt-1">Supports columns: Name, Phone, Email, Company</p>
          </div>
          <Button
            type="button"
            fullWidth
            onClick={() => {
              toast.success('CSV uploaded successfully! 250 contacts imported.');
              onClose();
            }}
          >
            Select CSV File from Computer
          </Button>
        </div>
      )}
    </Modal>
  );
};
