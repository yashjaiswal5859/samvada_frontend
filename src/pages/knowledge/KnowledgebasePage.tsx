import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Folder,
  Database,
  CheckCircle2,
  Search,
  Plus,
  Upload,
  FolderPlus,
  Play,
  Trash2,
  X,
  RefreshCw,
  FileCode,
  Globe,
  Loader2,
  Bot
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import {
  getKnowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
  getKnowledgeDocuments,
  uploadKnowledgeFile,
  addRawKnowledgeDocument,
  deleteKnowledgeDocument,
  syncKnowledgeBase,
} from '../../api/knowledge';
import { KnowledgeBase, KnowledgeDocument } from '../../types';
import { formatDate } from '../../utils/formatters';

export const KnowledgebasePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKbId, setSelectedKbId] = useState<string>('');
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const [isLoadingKBs, setIsLoadingKBs] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [isCreateKbModalOpen, setIsCreateKbModalOpen] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDesc, setNewKbDesc] = useState('');
  const [isSubmittingKb, setIsSubmittingKb] = useState(false);

  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false);
  const [textDocName, setTextDocName] = useState('');
  const [textDocContent, setTextDocContent] = useState('');
  const [textDocType, setTextDocType] = useState<'text' | 'url'>('text');
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [activeTab, setActiveTab] = useState<'preview' | 'chunks' | 'usage'>('preview');

  // Load Knowledge Bases
  const loadKBs = async () => {
    setIsLoadingKBs(true);
    try {
      const kbs = await getKnowledgeBases();
      setKnowledgeBases(kbs);
      if (kbs.length > 0) {
        if (!selectedKbId || !kbs.some((k) => k.id === selectedKbId)) {
          setSelectedKbId(kbs[0].id);
        }
      } else {
        setSelectedKbId('');
        setDocuments([]);
        setSelectedDocId(null);
      }
    } catch (err) {
      console.error('Error fetching knowledge bases:', err);
    } finally {
      setIsLoadingKBs(false);
    }
  };

  useEffect(() => {
    loadKBs();
  }, []);

  // Load Documents whenever selectedKbId changes
  useEffect(() => {
    if (!selectedKbId) {
      setDocuments([]);
      setSelectedDocId(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDocs(true);

    getKnowledgeDocuments(selectedKbId)
      .then((docs) => {
        if (!isMounted) return;
        setDocuments(docs);
        if (docs.length > 0) {
          if (!selectedDocId || !docs.some((d) => d.id === selectedDocId)) {
            setSelectedDocId(docs[0].id);
          }
        } else {
          setSelectedDocId(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching KB documents:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDocs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedKbId]);

  // Handle Create Knowledge Base
  const handleCreateKB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbName.trim()) {
      toast.error('Validation Error', 'Knowledge base name is required');
      return;
    }

    setIsSubmittingKb(true);
    try {
      const created = await createKnowledgeBase(newKbName.trim(), newKbDesc.trim());
      if (created) {
        toast.success('Knowledge Base Created', `"${created.name}" is ready.`);
        setNewKbName('');
        setNewKbDesc('');
        setIsCreateKbModalOpen(false);
        await loadKBs();
        setSelectedKbId(created.id);
      } else {
        toast.error('Creation Failed', 'Could not create knowledge base');
      }
    } catch {
      toast.error('Creation Failed', 'Network or server error');
    } finally {
      setIsSubmittingKb(false);
    }
  };

  // Handle Delete Knowledge Base
  const handleDeleteKB = async (kbId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete knowledge base "${name}" and all its documents?`)) {
      return;
    }

    const ok = await deleteKnowledgeBase(kbId);
    if (ok) {
      toast.success('Deleted', `Knowledge base "${name}" removed.`);
      await loadKBs();
    } else {
      toast.error('Delete Failed', 'Could not delete knowledge base');
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let targetKbId = selectedKbId;
    if (!targetKbId) {
      // Auto-create a default KB if none exists
      setIsUploading(true);
      const created = await createKnowledgeBase('General Knowledge Base', 'Auto-created workspace knowledge base');
      if (created) {
        targetKbId = created.id;
        setSelectedKbId(created.id);
        await loadKBs();
      } else {
        setIsUploading(false);
        toast.error('Upload Failed', 'Please create a knowledge base folder first.');
        return;
      }
    }

    setIsUploading(true);
    toast.info('Uploading Document', `Processing "${file.name}"...`);

    try {
      const doc = await uploadKnowledgeFile(targetKbId, file);
      if (doc) {
        toast.success('Document Indexed', `"${doc.name}" has been uploaded and queued for embedding.`);
        const updatedDocs = await getKnowledgeDocuments(targetKbId);
        setDocuments(updatedDocs);
        setSelectedDocId(doc.id);
        await loadKBs();
      } else {
        toast.error('Upload Error', 'Failed to upload document to server');
      }
    } catch {
      toast.error('Upload Error', 'Network failure during upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Add Raw Text / URL Document
  const handleAddTextDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textDocName.trim() || !textDocContent.trim()) {
      toast.error('Validation Error', 'Document title and content are required');
      return;
    }

    let targetKbId = selectedKbId;
    if (!targetKbId) {
      setIsSubmittingDoc(true);
      const created = await createKnowledgeBase('General Knowledge Base', 'Auto-created workspace knowledge base');
      if (created) {
        targetKbId = created.id;
        setSelectedKbId(created.id);
        await loadKBs();
      } else {
        setIsSubmittingDoc(false);
        toast.error('Error', 'Please create a knowledge base folder first');
        return;
      }
    }

    setIsSubmittingDoc(true);
    try {
      const doc = await addRawKnowledgeDocument(targetKbId, textDocName.trim(), textDocType, textDocContent.trim());
      if (doc) {
        toast.success('Document Added', `"${doc.name}" added successfully.`);
        setTextDocName('');
        setTextDocContent('');
        setIsAddTextModalOpen(false);
        const updatedDocs = await getKnowledgeDocuments(targetKbId);
        setDocuments(updatedDocs);
        setSelectedDocId(doc.id);
        await loadKBs();
      } else {
        toast.error('Failed', 'Could not add knowledge document');
      }
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async (docId: string, name: string) => {
    if (!selectedKbId) return;
    if (!confirm(`Delete document "${name}"?`)) return;

    const ok = await deleteKnowledgeDocument(selectedKbId, docId);
    if (ok) {
      toast.success('Document Deleted', `"${name}" removed from knowledge base.`);
      const updatedDocs = await getKnowledgeDocuments(selectedKbId);
      setDocuments(updatedDocs);
      if (selectedDocId === docId) {
        setSelectedDocId(updatedDocs.length > 0 ? updatedDocs[0].id : null);
      }
      await loadKBs();
    } else {
      toast.error('Delete Failed', 'Could not remove document');
    }
  };

  // Handle Sync KB
  const handleSyncKB = async () => {
    if (!selectedKbId) return;
    setIsSyncing(true);
    try {
      const ok = await syncKnowledgeBase(selectedKbId);
      if (ok) {
        toast.success('Sync Started', 'Knowledge base embeddings synchronization in progress.');
      } else {
        toast.error('Sync Error', 'Could not trigger synchronization');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getTypeBadge = (type: string) => {
    const upper = (type || 'file').toUpperCase();
    if (upper === 'PDF') {
      return <span className="w-6 h-6 rounded bg-rose-600/20 text-rose-400 font-bold text-[9px] flex items-center justify-center border border-rose-500/30">PDF</span>;
    }
    if (upper === 'DOCX') {
      return <span className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 font-bold text-[9px] flex items-center justify-center border border-blue-500/30">DOCX</span>;
    }
    if (upper === 'URL') {
      return <span className="w-6 h-6 rounded bg-emerald-600/20 text-emerald-400 font-bold text-[9px] flex items-center justify-center border border-emerald-500/30"><Globe className="w-3 h-3" /></span>;
    }
    return <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-[9px] flex items-center justify-center border border-zinc-700">TXT</span>;
  };

  // Filter documents
  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === 'All Types' ||
      d.type.toLowerCase() === typeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'All Statuses' ||
      d.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || filteredDocs[0] || null;
  const currentKb = knowledgeBases.find((k) => k.id === selectedKbId);
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Hidden File Input for Document Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.docx,.txt,.csv,.json,.md"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Knowledge Base</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Ground your AI voice agents with real-time domain knowledge, manuals, and FAQs.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsCreateKbModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all active:scale-[0.985]"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Folder</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all active:scale-[0.985] disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
          </button>

          <button
            onClick={() => setIsAddTextModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-[0.985]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Text / URL</span>
          </button>

          {selectedKbId && (
            <button
              onClick={handleSyncKB}
              disabled={isSyncing}
              title="Re-index vector embeddings"
              className="p-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-[0.985] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* 4 Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {documents.length.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Total Documents <span className="text-zinc-500 text-[10px]">in workspace</span>
            </p>
          </div>
        </div>

        {/* Knowledge Bases / Folders */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {knowledgeBases.length.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Knowledge Folders <span className="text-zinc-500 text-[10px]">categorized</span>
            </p>
          </div>
        </div>

        {/* Vector Chunks */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {totalChunks.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Indexed Chunks <span className="text-zinc-500 text-[10px]">RAG embeddings</span>
            </p>
          </div>
        </div>

        {/* Sync Status */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {knowledgeBases.length > 0 ? 'Active' : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Vector Pipeline <span className="text-zinc-500 text-[10px]">live indexing</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Sidebar: Knowledge Bases / Folders */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3 min-h-[360px]">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-white">Knowledge Folders</span>
            <button
              onClick={() => setIsCreateKbModalOpen(true)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              title="Add Knowledge Base Folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoadingKBs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            </div>
          ) : knowledgeBases.length > 0 ? (
            <div className="space-y-1">
              {knowledgeBases.map((kb) => (
                <div
                  key={kb.id}
                  onClick={() => setSelectedKbId(kb.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                    selectedKbId === kb.id
                      ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/25'
                      : 'text-zinc-400 hover:bg-zinc-850/40 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${selectedKbId === kb.id ? 'text-blue-400' : 'text-zinc-500'}`} />
                    <span className="truncate">{kb.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono">{kb.documentCount || 0}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteKB(kb.id, kb.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-zinc-500 transition-all"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center px-2">
              <Folder className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-300">No Folders Created</p>
              <p className="text-[11px] text-zinc-500 mt-1">Create a folder to group your documents.</p>
              <button
                onClick={() => setIsCreateKbModalOpen(true)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
              >
                + New Folder
              </button>
            </div>
          )}
        </div>

        {/* Center: Documents Table */}
        <div className="lg:col-span-5 space-y-3 min-h-[360px]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0c101b] border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-28 shrink-0">
              <CustomSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={['All Types', 'file', 'text', 'url']}
                size="sm"
              />
            </div>

            <div className="w-28 shrink-0">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={['All Statuses', 'indexed', 'indexing', 'failed']}
                size="sm"
              />
            </div>
          </div>

          <div className="bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl min-h-[300px] flex flex-col justify-between">
            {isLoadingDocs ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : filteredDocs.length > 0 ? (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-medium">
                    <tr>
                      <th className="p-3 font-semibold text-zinc-300">Name</th>
                      <th className="p-3 font-semibold text-zinc-300">Type</th>
                      <th className="p-3 font-semibold text-zinc-300 text-right">Chunks</th>
                      <th className="p-3 font-semibold text-zinc-300">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {filteredDocs.map((d) => {
                      const isSelected = selectedDocId === d.id;

                      return (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedDocId(d.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-600/10' : 'hover:bg-zinc-850/40'
                          }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getTypeBadge(d.type)}
                              <span className="font-semibold text-white truncate max-w-[180px]">{d.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-zinc-400 capitalize">{d.type}</td>
                          <td className="p-3 font-mono text-right">{d.chunkCount || 0}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                                d.status === 'indexed'
                                  ? 'text-emerald-400'
                                  : d.status === 'indexing'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  d.status === 'indexed'
                                    ? 'bg-emerald-400'
                                    : d.status === 'indexing'
                                    ? 'bg-amber-400 animate-pulse'
                                    : 'bg-rose-400'
                                }`}
                              />
                              {d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : 'Indexed'}
                            </span>
                          </td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDeleteDoc(d.id, d.name)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
                <FileText className="w-10 h-10 text-zinc-600 mb-2" />
                <h4 className="text-sm font-semibold text-white">No Documents in this Folder</h4>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Upload PDF, DOCX, or paste text to build your agent knowledge base.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                  <button
                    onClick={() => setIsAddTextModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Text</span>
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Showing {filteredDocs.length} document(s)</span>
              {currentKb && <span className="font-mono text-[11px] text-zinc-500">{currentKb.name}</span>}
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4 min-h-[360px]">
          {selectedDoc ? (
            <>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 uppercase">
                    {selectedDoc.type || 'DOC'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{selectedDoc.name}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {formatBytes(selectedDoc.sizeBytes)} • Updated {formatDate(selectedDoc.updatedAt || selectedDoc.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/agents/create')}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Attach to Agent</span>
                </button>
                <button
                  onClick={() => handleDeleteDoc(selectedDoc.id, selectedDoc.name)}
                  className="p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'preview' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('chunks')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'chunks' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Embeddings
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'usage' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Metadata
                </button>
              </div>

              {/* Document Details Box */}
              {activeTab === 'preview' ? (
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 text-xs max-h-56 overflow-y-auto">
                  <h4 className="font-bold text-white">{selectedDoc.name}</h4>
                  <p className="text-[11px] text-zinc-400 break-all font-mono">Source: {selectedDoc.source}</p>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    This document is indexed and available for semantic retrieval by voice agents during conversations.
                  </p>
                </div>
              ) : activeTab === 'chunks' ? (
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Total Embedding Chunks</span>
                    <span className="font-mono text-white font-bold">{selectedDoc.chunkCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Vector Dimension</span>
                    <span className="font-mono text-white font-bold">1536 (OpenAI / Gemini)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Indexing Status</span>
                    <span className="text-emerald-400 font-bold capitalize">{selectedDoc.status}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Document ID</span>
                    <span className="font-mono text-zinc-300 text-[10px] truncate max-w-[150px]">{selectedDoc.id}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Created Date</span>
                    <span className="font-mono text-zinc-300 text-[10px]">{formatDate(selectedDoc.createdAt)}</span>
                  </div>
                </div>
              )}

              {/* Document Insights */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-semibold text-zinc-400">Document Metrics</h4>
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{selectedDoc.chunkCount || 0}</p>
                    <p className="text-[9px] text-zinc-500">Chunks</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{formatBytes(selectedDoc.sizeBytes)}</p>
                    <p className="text-[9px] text-zinc-500">File Size</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400">100%</p>
                    <p className="text-[9px] text-zinc-500">Indexed</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center px-4">
              <FileCode className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-300">No Document Selected</p>
              <p className="text-[11px] text-zinc-500 mt-1">Select a document to inspect embeddings and metadata.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Knowledge Base Folder */}
      {isCreateKbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c101b] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-white">Create Knowledge Folder</h3>
              <button
                onClick={() => setIsCreateKbModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKB} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Folder / Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Product Specifications, Pricing FAQ"
                  value={newKbName}
                  onChange={(e) => setNewKbName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080b11] border border-zinc-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="What knowledge does this folder contain?"
                  value={newKbDesc}
                  onChange={(e) => setNewKbDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080b11] border border-zinc-800 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateKbModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingKb}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmittingKb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Create Folder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Raw Text / URL Document */}
      {isAddTextModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c101b] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-white">Add Raw Content</h3>
              <button
                onClick={() => setIsAddTextModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTextDoc} className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTextDocType('text')}
                  className={`flex-1 py-1.5 rounded-lg font-medium border transition-colors ${
                    textDocType === 'text'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Plain Text / Notes
                </button>
                <button
                  type="button"
                  onClick={() => setTextDocType('url')}
                  className={`flex-1 py-1.5 rounded-lg font-medium border transition-colors ${
                    textDocType === 'url'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Web URL / Sitemap
                </button>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Refund & Cancellation Policy"
                  value={textDocName}
                  onChange={(e) => setTextDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080b11] border border-zinc-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  {textDocType === 'url' ? 'Web URL' : 'Content Body'}
                </label>
                {textDocType === 'url' ? (
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/docs"
                    value={textDocContent}
                    onChange={(e) => setTextDocContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080b11] border border-zinc-800 text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <textarea
                    rows={6}
                    required
                    placeholder="Paste instructions, company rules, product knowledge, or FAQs here..."
                    value={textDocContent}
                    onChange={(e) => setTextDocContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080b11] border border-zinc-800 text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-[11px]"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTextModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDoc}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmittingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
