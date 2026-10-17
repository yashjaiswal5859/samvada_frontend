import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Folder,
  FolderPlus,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import {
  addRawKnowledgeDocument,
  createKnowledgeBase,
  deleteKnowledgeBase,
  deleteKnowledgeDocument,
  getKnowledgeBases,
  getKnowledgeDocuments,
  getKnowledgeNote,
  saveKnowledgeNote,
  uploadKnowledgeFile,
} from '../../api/knowledge';
import { KnowledgeBase, KnowledgeDocument } from '../../types';
import { formatDate } from '../../utils/formatters';

const folderPath = (name: string) => `/knowledge/${encodeURIComponent(name).replace(/\./g, '%2E')}`;

export const KnowledgebasePage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { folderName } = useParams<{ folderName: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [documentOverrides, setDocumentOverrides] = useState<Record<string, KnowledgeDocument[]>>({});
  const [isLoadingKBs, setIsLoadingKBs] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreateKbModalOpen, setIsCreateKbModalOpen] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDesc, setNewKbDesc] = useState('');
  const [isSubmittingKb, setIsSubmittingKb] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<{ key: string; top: number; left: number } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ kind: 'folder' | 'file'; id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [moveTarget, setMoveTarget] = useState<KnowledgeDocument | null>(null);
  const [moveDestinationId, setMoveDestinationId] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savedNoteContent, setSavedNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteLastSaved, setNoteLastSaved] = useState<Date | null>(null);

  const currentKb = folderName
    ? knowledgeBases.find((kb) => kb.name.toLocaleLowerCase() === folderName.toLocaleLowerCase())
    : undefined;

  const toggleActionMenu = (key: string, event: React.MouseEvent<HTMLButtonElement>, estimatedHeight = 120) => {
    if (openActionMenu?.key === key) {
      setOpenActionMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const top = rect.bottom + estimatedHeight + 8 > window.innerHeight
      ? Math.max(8, rect.top - estimatedHeight - 4)
      : rect.bottom + 4;
    const left = Math.max(8, Math.min(rect.right - 176, window.innerWidth - 184));
    setOpenActionMenu({ key, top, left });
  };

  const renderActionMenu = (key: string, children: React.ReactNode) => {
    if (openActionMenu?.key !== key) return null;
    return createPortal(
      <div className="fixed inset-0 z-[100]" onMouseDown={() => setOpenActionMenu(null)}>
        <div
          role="menu"
          style={{ top: openActionMenu.top, left: openActionMenu.left }}
          onMouseDown={(event) => event.stopPropagation()}
          className="fixed z-[101] w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_40px_rgba(15,23,42,0.18)]"
        >
          {children}
        </div>
      </div>,
      document.body,
    );
  };

  const actionMenuItemClass = 'w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus:bg-slate-100 focus:outline-none';

  const loadKBs = async () => {
    setIsLoadingKBs(true);
    try {
      setKnowledgeBases(await getKnowledgeBases());
    } catch {
      toast.error('Could not load folders', 'Please try again in a moment.');
    } finally {
      setIsLoadingKBs(false);
    }
  };

  useEffect(() => {
    void loadKBs();
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setSelectedDocumentIds([]);
    setOpenActionMenu(null);
  }, [folderName]);

  useEffect(() => {
    setSelectedFolderIds([]);
    setOpenActionMenu(null);
  }, [folderName]);

  useEffect(() => {
    if (!currentKb) {
      setDocuments([]);
      setIsLoadingDocs(false);
      return;
    }

    let isMounted = true;
    setDocuments([]);
    setIsLoadingDocs(true);

    if (Object.prototype.hasOwnProperty.call(documentOverrides, currentKb.id)) {
      setDocuments(documentOverrides[currentKb.id]);
      setIsLoadingDocs(false);
      return () => {
        isMounted = false;
      };
    }

    getKnowledgeDocuments(currentKb.id)
      .then((docs) => {
        if (isMounted) setDocuments(docs);
      })
      .catch(() => {
        if (isMounted) toast.error('Could not load files', 'Try opening the folder again.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingDocs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentKb?.id, documentOverrides]);

  useEffect(() => {
    if (!currentKb) {
      setNoteContent('');
      setSavedNoteContent('');
      setNoteLastSaved(null);
      return;
    }

    const noteDoc = documents.find((doc) => doc.type === 'text' || doc.name === 'Quick Notes');
    const localCached = localStorage.getItem(`samvada_kb_note_${currentKb.id}`) || '';
    const initialText = noteDoc?.source || localCached;
    setNoteContent(initialText);
    setSavedNoteContent(initialText);
    if (initialText) {
      setNoteLastSaved(new Date());
    } else {
      setNoteLastSaved(null);
    }
  }, [currentKb?.id, documents]);

  const handleCreateKB = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newKbName.trim();
    if (!name) return;

    if (knowledgeBases.some((kb) => kb.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      toast.error('Folder already exists', 'Choose a different name so each folder has its own page.');
      return;
    }

    setIsSubmittingKb(true);
    try {
      const created = await createKnowledgeBase(name, newKbDesc.trim());
      if (!created) {
        toast.error('Folder not created', 'Please try again.');
        return;
      }

      setKnowledgeBases((current) => [...current, created]);
      setNewKbName('');
      setNewKbDesc('');
      setIsCreateKbModalOpen(false);
      toast.success('Folder created', `${created.name} is ready for files.`);
    } catch {
      toast.error('Folder not created', 'Please try again in a moment.');
    } finally {
      setIsSubmittingKb(false);
    }
  };

  const handleDeleteFolders = async (folderIds: string[]) => {
    const targets = knowledgeBases.filter((kb) => folderIds.includes(kb.id));
    if (targets.length === 0) return;
    const description = targets.length === 1
      ? `Delete “${targets[0].name}” and all files inside it?`
      : `Delete ${targets.length} folders and all files inside them?`;
    if (!window.confirm(description)) return;

    const results = await Promise.all(targets.map((kb) => deleteKnowledgeBase(kb.id)));
    const deletedIds = targets.filter((_, index) => results[index]).map((kb) => kb.id);
    if (deletedIds.length === 0) {
      toast.error('Could not delete folders', 'Please try again.');
      return;
    }

    setKnowledgeBases((current) => current.filter((kb) => !deletedIds.includes(kb.id)));
    setSelectedFolderIds((current) => current.filter((id) => !deletedIds.includes(id)));
    setDocumentOverrides((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !deletedIds.includes(id))));
    if (currentKb && deletedIds.includes(currentKb.id)) navigate('/knowledge');
    if (deletedIds.length === targets.length) {
      toast.success('Folders deleted', `${deletedIds.length} ${deletedIds.length === 1 ? 'folder was' : 'folders were'} removed.`);
    } else {
      toast.error('Some folders could not be deleted', `${deletedIds.length} of ${targets.length} folders were removed.`);
    }
  };

  const handleDeleteKB = async (kb: KnowledgeBase) => handleDeleteFolders([kb.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!currentKb) {
      toast.error('Open a folder first', 'Files can only be added from inside a folder.');
      event.target.value = '';
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('PDF files only', 'Please upload a PDF document (or save your Word document as PDF).');
      event.target.value = '';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File too large', 'Please upload a PDF under 15MB.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const doc = await uploadKnowledgeFile(currentKb.id, file);
      if (!doc) {
        toast.error('Upload failed', 'This file could not be added. Please try again.');
        return;
      }

      toast.success('File added', `${doc.name} was added to ${currentKb.name}.`);
      const updatedDocs = await getKnowledgeDocuments(currentKb.id);
      setDocuments(updatedDocs);
      setDocumentOverrides((current) => ({ ...current, [currentKb.id]: updatedDocs }));
      setKnowledgeBases((current) => current.map((kb) =>
        kb.id === currentKb.id ? { ...kb, documentCount: updatedDocs.length } : kb,
      ));
    } catch {
      toast.error('Upload failed', 'Check the file and try again.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSaveNote = async () => {
    if (!currentKb) return;
    setIsSavingNote(true);
    try {
      const trimmed = noteContent.trim();
      await saveKnowledgeNote(currentKb.id, trimmed);
      const updatedDocs = await getKnowledgeDocuments(currentKb.id);
      setDocuments(updatedDocs);
      setDocumentOverrides((current) => ({ ...current, [currentKb.id]: updatedDocs }));

      localStorage.setItem(`samvada_kb_note_${currentKb.id}`, trimmed);
      setSavedNoteContent(trimmed);
      setNoteLastSaved(new Date());
      toast.success(
        trimmed ? 'Notes saved & synced' : 'Notes cleared',
        trimmed ? 'Operational rules updated for your voice agents.' : 'Notes removed from voice agent memory.'
      );
    } catch {
      toast.error('Could not save notes', 'Please check your connection and try again.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDiscardNote = () => {
    setNoteContent(savedNoteContent);
  };

  const handleDeleteDocument = async (doc: KnowledgeDocument) => {
    if (!currentKb || !window.confirm(`Remove “${doc.name}” from this folder?`)) return;

    const ok = await deleteKnowledgeDocument(currentKb.id, doc.id);
    if (!ok) {
      toast.error('Could not remove file', 'Please try again.');
      return;
    }

    toast.success('File removed', `${doc.name} was removed from the folder.`);
    const updatedDocs = await getKnowledgeDocuments(currentKb.id);
    setDocuments(updatedDocs);
    setSelectedDocumentIds((current) => current.filter((id) => id !== doc.id));
    setDocumentOverrides((current) => ({ ...current, [currentKb.id]: updatedDocs }));
    setKnowledgeBases((current) => current.map((kb) =>
      kb.id === currentKb.id ? { ...kb, documentCount: updatedDocs.length } : kb,
    ));
  };

  const handleDeleteDocuments = async () => {
    if (!currentKb || selectedDocumentIds.length === 0) return;
    const selectedDocs = documents.filter((doc) => selectedDocumentIds.includes(doc.id));
    const description = selectedDocs.length === 1
      ? `Remove “${selectedDocs[0].name}” from this folder?`
      : `Remove ${selectedDocs.length} files from this folder?`;
    if (!window.confirm(description)) return;

    const results = await Promise.all(selectedDocs.map((doc) => deleteKnowledgeDocument(currentKb.id, doc.id)));
    const removedIds = selectedDocs.filter((_, index) => results[index]).map((doc) => doc.id);
    if (removedIds.length === 0) {
      toast.error('Could not remove files', 'Please try again.');
      return;
    }

    const updatedDocs = await getKnowledgeDocuments(currentKb.id);
    setDocuments(updatedDocs);
    setDocumentOverrides((current) => ({ ...current, [currentKb.id]: updatedDocs }));
    setSelectedDocumentIds((current) => current.filter((id) => !removedIds.includes(id)));
    setKnowledgeBases((current) => current.map((kb) =>
      kb.id === currentKb.id ? { ...kb, documentCount: updatedDocs.length } : kb,
    ));
    if (removedIds.length === selectedDocs.length) {
      toast.success('Files removed', `${removedIds.length} ${removedIds.length === 1 ? 'file was' : 'files were'} removed.`);
    } else {
      toast.error('Some files could not be removed', `${removedIds.length} of ${selectedDocs.length} files were removed.`);
    }
  };

  const openRenameDialog = (target: { kind: 'folder' | 'file'; id: string; name: string }) => {
    setOpenActionMenu(null);
    setRenameTarget(target);
    setRenameValue(target.name);
  };

  const handleRename = (event: React.FormEvent) => {
    event.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    const nextName = renameValue.trim();

    if (renameTarget.kind === 'folder') {
      if (knowledgeBases.some((kb) => kb.id !== renameTarget.id && kb.name.toLocaleLowerCase() === nextName.toLocaleLowerCase())) {
        toast.error('Folder already exists', 'Choose a different folder name.');
        return;
      }
      setKnowledgeBases((current) => current.map((kb) => kb.id === renameTarget.id ? { ...kb, name: nextName } : kb));
      if (currentKb?.id === renameTarget.id) navigate(folderPath(nextName), { replace: true });
    } else {
      setDocuments((current) => current.map((doc) => doc.id === renameTarget.id ? { ...doc, name: nextName } : doc));
      if (currentKb) {
        setDocumentOverrides((current) => ({
          ...current,
          [currentKb.id]: (current[currentKb.id] || documents).map((doc) => doc.id === renameTarget.id ? { ...doc, name: nextName } : doc),
        }));
      }
    }

    setRenameTarget(null);
    toast.success('Name updated', `Renamed to “${nextName}”.`);
  };

  const handleMoveDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentKb || !moveTarget || !moveDestinationId) return;
    const destination = knowledgeBases.find((kb) => kb.id === moveDestinationId);
    if (!destination || destination.id === currentKb.id) return;

    const sourceDocs = documents.filter((doc) => doc.id !== moveTarget.id);
    let destinationDocs = documentOverrides[destination.id];
    if (!destinationDocs) {
      try {
        destinationDocs = await getKnowledgeDocuments(destination.id);
      } catch {
        toast.error('Could not open destination folder', 'Please try again.');
        return;
      }
    }
    setDocuments(sourceDocs);
    setDocumentOverrides((current) => ({
      ...current,
      [currentKb.id]: sourceDocs,
      [destination.id]: [...destinationDocs, moveTarget],
    }));
    setKnowledgeBases((current) => current.map((kb) => {
      if (kb.id === currentKb.id) return { ...kb, documentCount: sourceDocs.length };
      if (kb.id === destination.id) return { ...kb, documentCount: destinationDocs.length + 1 };
      return kb;
    }));
    setSelectedDocumentIds((current) => current.filter((id) => id !== moveTarget.id));
    setMoveTarget(null);
    setMoveDestinationId('');
    toast.success('File moved', `${moveTarget.name} moved to ${destination.name}.`);
  };

  const pdfDocs = documents.filter((doc) => doc.type !== 'text' && doc.name !== 'Quick Notes');
  const isNoteDirty = noteContent.trim() !== savedNoteContent.trim();

  const filteredDocs = pdfDocs.filter((doc) =>
    `${doc.name} ${doc.source}`.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let size = bytes / 1024;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${size.toFixed(1)} ${units[unit]}`;
  };

  const getStatusStyle = (status?: string) => {
    const normalized = (status || 'indexed').toLowerCase();
    if (normalized === 'failed' || normalized === 'error') {
      return { label: 'Failed', classes: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
    }
    if (normalized === 'indexing' || normalized === 'processing' || normalized === 'pending') {
      return { label: 'Processing', classes: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
    }
    return { label: 'Ready', classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
  };

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {currentKb && (
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf"
        />
      )}

      {!folderName ? (
        <>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">Agent resources</p>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Knowledge base</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Create folders for your agent reference files. Open a folder to add and manage its files.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateKbModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 sm:self-auto"
            >
              <FolderPlus className="h-4 w-4" /> New folder
            </button>
          </header>

          <section className="rounded-2xl border border-zinc-800 bg-[#0c101b]/95 p-5 shadow-xl shadow-black/10 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">Your folders</h2>
                <p className="mt-1 text-sm text-zinc-500">{knowledgeBases.length} {knowledgeBases.length === 1 ? 'folder' : 'folders'}</p>
              </div>
              {knowledgeBases.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreateKbModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> New folder
                </button>
              )}
            </div>

            {isLoadingKBs ? (
              <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
            ) : knowledgeBases.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                  <Folder className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">Create your first folder</h3>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-400">
                  Organize reference files by topic, such as product information, pricing, or support policies.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateKbModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <FolderPlus className="h-4 w-4" /> Create folder
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedFolderIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3">
                    <p className="text-sm font-medium text-zinc-200">{selectedFolderIds.length} {selectedFolderIds.length === 1 ? 'folder' : 'folders'} selected</p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setSelectedFolderIds([])} className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white">Clear selection</button>
                      <button type="button" onClick={() => void handleDeleteFolders(selectedFolderIds)} className="inline-flex items-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20">
                        <Trash2 className="h-3.5 w-3.5" /> Delete selected
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="border-b border-zinc-800 bg-zinc-900/40 text-xs font-medium text-zinc-500">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label="Select all folders"
                            checked={knowledgeBases.length > 0 && selectedFolderIds.length === knowledgeBases.length}
                            ref={(element) => {
                              if (element) element.indeterminate = selectedFolderIds.length > 0 && selectedFolderIds.length < knowledgeBases.length;
                            }}
                            onChange={(event) => setSelectedFolderIds(event.target.checked ? knowledgeBases.map((kb) => kb.id) : [])}
                            className="h-4 w-4 cursor-pointer rounded border-zinc-600 bg-zinc-900 accent-blue-500"
                          />
                        </th>
                        <th className="w-[50%] px-3 py-3 sm:w-[38%]">Folder</th>
                        <th className="w-[20%] px-3 py-3 sm:w-24 sm:px-4">Files</th>
                        <th className="hidden px-4 py-3 sm:table-cell">Description</th>
                        <th className="w-16 px-4 py-3 text-right">&nbsp;</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                      {knowledgeBases.map((kb) => {
                        const menuKey = `folder:${kb.id}`;
                        return (
                          <tr key={kb.id} className={`group transition hover:bg-zinc-900/45 ${selectedFolderIds.includes(kb.id) ? 'bg-blue-500/[0.04]' : ''}`}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                aria-label={`Select ${kb.name}`}
                                checked={selectedFolderIds.includes(kb.id)}
                                onChange={(event) => setSelectedFolderIds((current) => event.target.checked ? [...current, kb.id] : current.filter((id) => id !== kb.id))}
                                className="h-4 w-4 cursor-pointer rounded border-zinc-600 bg-zinc-900 accent-blue-500"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <Link to={folderPath(kb.name)} className="inline-flex max-w-full items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <Folder className="h-4 w-4 shrink-0 text-blue-300" />
                                <span className="truncate font-medium text-zinc-100 hover:text-blue-200">{kb.name}</span>
                                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-blue-300" />
                              </Link>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">{kb.documentCount || 0}</td>
                            <td className="hidden max-w-sm truncate px-4 py-3 text-xs text-zinc-500 sm:table-cell" title={kb.description || ''}>{kb.description || '—'}</td>
                            <td className="px-3 py-2 text-right">
                              <div className="relative inline-block">
                                <button
                                  type="button"
                                  aria-label={`More actions for ${kb.name}`}
                                  aria-expanded={openActionMenu?.key === menuKey}
                                  onClick={(event) => toggleActionMenu(menuKey, event, 92)}
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:bg-slate-100 focus:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                {renderActionMenu(menuKey, <>
                                  <button type="button" role="menuitem" onClick={() => openRenameDialog({ kind: 'folder', id: kb.id, name: kb.name })} className={actionMenuItemClass}>Rename</button>
                                  <button type="button" role="menuitem" onClick={() => { setOpenActionMenu(null); void handleDeleteKB(kb); }} className={`${actionMenuItemClass} text-rose-600 hover:bg-rose-50 focus:bg-rose-50`}>Delete folder</button>
                                </>)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      ) : isLoadingKBs ? (
        <div className="flex min-h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
      ) : !currentKb ? (
        <section className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#0c101b]/95 px-6 py-16 text-center">
          <Folder className="h-8 w-8 text-zinc-500" />
          <h1 className="mt-4 text-lg font-semibold text-white">Folder not found</h1>
          <p className="mt-1.5 text-sm text-zinc-400">It may have been renamed or removed.</p>
          <Link to="/knowledge" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800">
            <ArrowLeft className="h-4 w-4" /> Back to folders
          </Link>
        </section>
      ) : (
        <>
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm">
              <Link to="/knowledge" className="font-medium text-zinc-400 transition hover:text-white">Knowledge base</Link>
              <span className="text-zinc-600">/</span>
              <span className="max-w-[60vw] truncate font-medium text-zinc-200" aria-current="page">{currentKb.name}</span>
            </nav>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">{currentKb.name}</h1>
                <p className="mt-2 text-sm text-zinc-400">
                  {currentKb.description || 'Files in this folder are available to select for your voice agents.'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link to="/knowledge" className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/70 px-3.5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> Folders
                </Link>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploading ? 'Adding PDF…' : 'Add PDF'}
                </button>
              </div>
            </header>
          </div>

          {/* Quick Notes & Rules Section */}
          <section className="rounded-2xl border border-zinc-800 bg-[#0c101b]/95 p-5 shadow-xl shadow-black/10 sm:p-6">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">Quick Notes &amp; Rules</h2>
                    {isSavingNote ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                        <Loader2 className="h-3 w-3 animate-spin" /> Syncing with AI…
                      </span>
                    ) : isNoteDirty ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved changes
                      </span>
                    ) : savedNoteContent ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                        <Check className="h-3 w-3" /> Synced with Voice AI
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Auto-embedded for your callers • Edits replace prior memory in real time
              </p>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-zinc-400">
              Add daily notices, doctor schedules, promo codes, or custom operational guidelines. Whenever you click <strong>Save &amp; Sync Note</strong>, old embeddings are replaced so callers never receive stale information.
            </p>

            <div className="relative">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="e.g. Dr. Dave is out of office this Friday. For urgent dental inquiries, offer to schedule for next Monday or connect with on-call support. We are also running a 15% discount on dental cleanings this month with code CLEAN15."
                rows={4}
                maxLength={4000}
                className="w-full resize-y rounded-xl border border-zinc-800 bg-[#080b11] p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs text-zinc-500">
                {noteContent.length} / 4,000 characters
                {noteLastSaved && (
                  <span className="ml-2 text-zinc-500">• Last synced {noteLastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </span>

              <div className="flex items-center gap-2">
                {isNoteDirty && (
                  <button
                    type="button"
                    onClick={handleDiscardNote}
                    disabled={isSavingNote}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Discard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleSaveNote()}
                  disabled={isSavingNote || !isNoteDirty}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSavingNote ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {isSavingNote ? 'Syncing…' : 'Save & Sync Note'}
                </button>
              </div>
            </div>
          </section>

          <section className="min-h-[420px] overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c101b]/95 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">PDF Documents</h2>
                <p className="mt-0.5 text-xs text-zinc-500">{pdfDocs.length} {pdfDocs.length === 1 ? 'document' : 'documents'}</p>
              </div>
              {documents.length > 0 && (
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setSelectedDocumentIds([]);
                    }}
                    placeholder="Search files"
                    aria-label="Search files in folder"
                    className="w-full rounded-xl border border-zinc-800 bg-[#080b11] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/70"
                  />
                </div>
              )}
            </div>

            {selectedDocumentIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-blue-500/[0.06] px-5 py-3">
                <p className="text-sm font-medium text-zinc-200">{selectedDocumentIds.length} {selectedDocumentIds.length === 1 ? 'file' : 'files'} selected</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setSelectedDocumentIds([])} className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white">Clear selection</button>
                  <button type="button" onClick={() => void handleDeleteDocuments()} className="inline-flex items-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20">
                    <Trash2 className="h-3.5 w-3.5" /> Delete selected
                  </button>
                </div>
              </div>
            )}

            {isLoadingDocs ? (
              <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
            ) : pdfDocs.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">No PDF documents yet</h3>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-400">
                  Upload PDF manuals, brochures, price lists, or policies for your agents to reference.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" /> Upload PDF
                </button>
                <p className="mt-3 text-xs text-zinc-500">PDF documents only (max 15MB) • Save Word or Google Docs as PDF to upload</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
                <Search className="h-6 w-6 text-zinc-500" />
                <h3 className="mt-3 text-sm font-semibold text-white">No files match “{searchQuery}”</h3>
                <button type="button" onClick={() => setSearchQuery('')} className="mt-2 text-sm font-medium text-blue-300 hover:text-blue-200">Clear search</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/30 text-xs font-medium text-zinc-500">
                    <tr>
                      <th className="w-11 px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Select all files"
                          checked={filteredDocs.length > 0 && filteredDocs.every((doc) => selectedDocumentIds.includes(doc.id))}
                          ref={(element) => {
                            if (element) {
                              const selectedVisible = filteredDocs.filter((doc) => selectedDocumentIds.includes(doc.id)).length;
                              element.indeterminate = selectedVisible > 0 && selectedVisible < filteredDocs.length;
                            }
                          }}
                          onChange={(event) => {
                            const visibleIds = filteredDocs.map((doc) => doc.id);
                            setSelectedDocumentIds((current) => event.target.checked
                              ? [...new Set([...current, ...visibleIds])]
                              : current.filter((id) => !visibleIds.includes(id)));
                          }}
                          className="h-4 w-4 cursor-pointer rounded border-zinc-600 bg-zinc-900 accent-blue-500"
                        />
                      </th>
                      <th className="w-[45%] px-1 py-3 sm:w-[38%] sm:px-3">File name</th>
                      <th className="w-[23%] px-2 py-3 sm:w-[17%] sm:px-4">Status</th>
                      <th className="hidden w-[13%] px-4 py-3 sm:table-cell">Size</th>
                      <th className="hidden w-[19%] px-4 py-3 md:table-cell">Added</th>
                      <th className="w-14 px-2 py-3 text-right sm:px-4">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {filteredDocs.map((doc) => {
                      const status = getStatusStyle(doc.status);
                      const extension = (doc.name.split('.').pop() || doc.type || 'file').toUpperCase();
                      const menuKey = `file:${doc.id}`;
                      return (
                        <tr key={doc.id} className="group transition hover:bg-zinc-900/40">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              aria-label={`Select ${doc.name}`}
                              checked={selectedDocumentIds.includes(doc.id)}
                              onChange={(event) => setSelectedDocumentIds((current) => event.target.checked ? [...current, doc.id] : current.filter((id) => id !== doc.id))}
                              className="h-4 w-4 cursor-pointer rounded border-zinc-600 bg-zinc-900 accent-blue-500"
                            />
                          </td>
                          <td className="min-w-0 px-1 py-4 sm:px-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-blue-300"><FileText className="h-4 w-4" /></div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-zinc-100" title={doc.name}>{doc.name}</p>
                                <p className="mt-0.5 truncate text-xs text-zinc-500">{extension} file</p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 py-4 sm:px-4"><span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium ${status.classes}`}>{status.label}</span></td>
                          <td className="hidden whitespace-nowrap px-4 py-4 text-xs text-zinc-400 sm:table-cell">{formatBytes(doc.sizeBytes)}</td>
                          <td className="hidden whitespace-nowrap px-4 py-4 text-xs text-zinc-400 md:table-cell">{formatDate(doc.createdAt)}</td>
                          <td className="px-2 py-3 text-right sm:px-4">
                            <div className="relative inline-block">
                              <button
                                type="button"
                                aria-label={`More actions for ${doc.name}`}
                                aria-expanded={openActionMenu?.key === menuKey}
                                onClick={(event) => toggleActionMenu(menuKey, event, 132)}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:bg-slate-100 focus:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              {renderActionMenu(menuKey, <>
                                <button type="button" role="menuitem" onClick={() => openRenameDialog({ kind: 'file', id: doc.id, name: doc.name })} className={actionMenuItemClass}>Rename</button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={knowledgeBases.length < 2}
                                  onClick={() => {
                                    setOpenActionMenu(null);
                                    setMoveTarget(doc);
                                    setMoveDestinationId('');
                                  }}
                                  className={`${actionMenuItemClass} disabled:cursor-not-allowed disabled:opacity-40`}
                                >Move to folder</button>
                                <button type="button" role="menuitem" onClick={() => { setOpenActionMenu(null); void handleDeleteDocument(doc); }} className={`${actionMenuItemClass} text-rose-600 hover:bg-rose-50 focus:bg-rose-50`}>Delete file</button>
                              </>)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="border-t border-zinc-800 px-5 py-3 text-xs text-zinc-500">
                  {filteredDocs.length} {filteredDocs.length === 1 ? 'file' : 'files'}{searchQuery && ` matching “${searchQuery}”`}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0c101b] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Rename {renameTarget.kind}</h3>
                <p className="mt-1 text-sm text-zinc-400">Choose a clear name that is easy to find.</p>
              </div>
              <button type="button" onClick={() => setRenameTarget(null)} aria-label="Close dialog" className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleRename} className="space-y-4">
              <div>
                <label htmlFor="knowledge-rename" className="mb-1.5 block text-sm font-medium text-zinc-200">Name</label>
                <input
                  id="knowledge-rename"
                  type="text"
                  required
                  autoFocus
                  maxLength={160}
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#080b11] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/70"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button type="button" onClick={() => setRenameTarget(null)} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={!renameValue.trim()} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">Save name</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moveTarget && currentKb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0c101b] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Move file</h3>
                <p className="mt-1 max-w-xs truncate text-sm text-zinc-400" title={moveTarget.name}>{moveTarget.name}</p>
              </div>
              <button type="button" onClick={() => setMoveTarget(null)} aria-label="Close dialog" className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleMoveDocument} className="space-y-4">
              <div>
                <label htmlFor="knowledge-move-destination" className="mb-1.5 block text-sm font-medium text-zinc-200">Move to folder</label>
                <select
                  id="knowledge-move-destination"
                  required
                  value={moveDestinationId}
                  onChange={(event) => setMoveDestinationId(event.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#080b11] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/70"
                >
                  <option value="" disabled>Select a destination</option>
                  {knowledgeBases.filter((kb) => kb.id !== currentKb.id).map((kb) => (
                    <option key={kb.id} value={kb.id}>{kb.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button type="button" onClick={() => setMoveTarget(null)} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={!moveDestinationId} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">Move file</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateKbModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCreateKbModalOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0c101b] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300"><FolderPlus className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold text-white">Create a folder</h3>
                <p className="mt-1 text-sm text-zinc-400">Give related agent reference files a clear home.</p>
              </div>
              <button type="button" onClick={() => setIsCreateKbModalOpen(false)} aria-label="Close dialog" className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKB} className="space-y-4">
              <div>
                <label htmlFor="knowledge-folder-name" className="mb-1.5 block text-sm font-medium text-zinc-200">Folder name</label>
                <input
                  id="knowledge-folder-name"
                  type="text"
                  required
                  autoFocus
                  maxLength={80}
                  placeholder="e.g. Product information"
                  value={newKbName}
                  onChange={(event) => setNewKbName(event.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#080b11] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/70"
                />
              </div>
              <div>
                <label htmlFor="knowledge-folder-description" className="mb-1.5 block text-sm font-medium text-zinc-200">Description <span className="font-normal text-zinc-500">(optional)</span></label>
                <textarea
                  id="knowledge-folder-description"
                  rows={3}
                  maxLength={240}
                  placeholder="What kind of files belong here?"
                  value={newKbDesc}
                  onChange={(event) => setNewKbDesc(event.target.value)}
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-[#080b11] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/70"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button type="button" onClick={() => setIsCreateKbModalOpen(false)} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={isSubmittingKb || !newKbName.trim()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmittingKb ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                  Create folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
