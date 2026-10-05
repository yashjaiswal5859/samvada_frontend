import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { uploadKnowledgeDocument } from '../../api/knowledge';
import { KnowledgeDocument } from '../../types';
import { FileText, Globe, Upload } from 'lucide-react';

interface UploadKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (doc: KnowledgeDocument) => void;
}

export const UploadKnowledgeModal: React.FC<UploadKnowledgeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<'file' | 'url'>('file');
  const [fileName, setFileName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const source = type === 'file' ? 'Uploaded PDF/Doc' : url;
      const docName = type === 'file' ? (fileName || 'Document.pdf') : url;
      const doc = await uploadKnowledgeDocument(docName, type, source);
      setIsLoading(false);
      onSuccess(doc);
      onClose();
      setFileName('');
      setUrl('');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Knowledge Source"
      subtitle="Add your price lists, FAQs, or website links so your assistant knows your business answers."
      maxWidth="md"
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => setType('file')}
          className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
            type === 'file'
              ? 'bg-indigo-600/10 border-indigo-500 text-white font-semibold'
              : 'bg-[#181922] border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold">Document File</p>
            <p className="text-[11px] text-zinc-500">PDF, DOCX, TXT</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setType('url')}
          className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
            type === 'url'
              ? 'bg-indigo-600/10 border-indigo-500 text-white font-semibold'
              : 'bg-[#181922] border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold">Website URL Scraper</p>
            <p className="text-[11px] text-zinc-500">Crawl website links</p>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'file' ? (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-zinc-700/80 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-[#181922]">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-300">Click or drag PDF/DOCX here</p>
              <p className="text-[11px] text-zinc-500 mt-1">Up to 25MB per document</p>
            </div>
            <Input
              label="Document Title"
              placeholder="e.g. Insurance_Policy_Terms_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
        ) : (
          <Input
            label="Website Page URL"
            placeholder="https://yourcompany.com/faq"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Add Knowledge
          </Button>
        </div>
      </form>
    </Modal>
  );
};
