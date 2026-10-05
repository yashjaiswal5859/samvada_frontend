import React, { useState, useEffect } from 'react';
import {
  Boxes,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Settings,
  Key,
  Webhook,
  Copy,
  ExternalLink,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Globe,
  Radio,
  Sliders,
  Database
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getIntegrations, toggleIntegration } from '../../api/integrations';
import { getApiKeys, createApiKey, deleteApiKey, getWebhooks, createWebhook, deleteWebhook } from '../../api/settings';
import { Integration, ApiKey } from '../../types';

interface WebhookItem {
  id: string;
  url: string;
  name?: string;
  isActive?: boolean;
}

export const IntegrationsPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Inputs state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const tabs = [
    { id: 'all', label: 'All Integrations' },
    { id: 'telephony', label: 'Phone Networks' },
    { id: 'crm', label: 'Customer CRMs' },
    { id: 'automation', label: 'Automations' },
    { id: 'webhooks', label: 'Developer Webhooks' },
  ];

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [intRes, keysRes, whRes] = await Promise.all([
        getIntegrations(),
        getApiKeys(),
        getWebhooks(),
      ]);
      setIntegrations(intRes);
      setApiKeys(keysRes);
      setWebhooks(whRes);
    } catch (err) {
      console.error('Failed to load integrations data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      await toggleIntegration(id, nextStatus);
      setIntegrations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, connected: nextStatus } : item))
      );
      toast.success(
        nextStatus ? `Connected integration successfully` : `Disconnected integration`
      );
    } catch (err) {
      toast.error('Failed to update integration status');
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const { apiKey, secret } = await createApiKey(newKeyName.trim());
      setApiKeys((prev) => [apiKey, ...prev]);
      setCreatedSecret(secret);
      setNewKeyName('');
      toast.success('API key generated successfully');
    } catch (err) {
      toast.error('Failed to generate API key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success('API key deleted');
    } catch (err) {
      toast.error('Failed to delete API key');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;

    try {
      const created = await createWebhook(newWebhookUrl.trim());
      setWebhooks((prev) => [created, ...prev]);
      setNewWebhookUrl('');
      setShowWebhookModal(false);
      toast.success('Webhook endpoint configured successfully');
    } catch (err) {
      toast.error('Failed to register webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await deleteWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast.success('Webhook endpoint removed');
    } catch (err) {
      toast.error('Failed to remove webhook');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const filteredIntegrations = integrations.filter((item) => {
    const matchCategory = activeTab === 'all' || item.category === activeTab;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Integrations</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Connect Samvada with your telephony carriers, CRM platforms, and developer webhooks.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => window.open('https://docs.samvada.ai', '_blank')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Documentation</span>
          </button>
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate API Key</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-800 pb-3 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Catalog + API Keys & Webhooks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Catalog Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Services Catalog</h3>
                <p className="text-xs text-zinc-400">Manage connections to external providers.</p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search integrations..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0c101b] border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-xs text-zinc-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading integrations...
              </div>
            ) : filteredIntegrations.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-2">
                <Boxes className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-xs font-bold text-white">No Integrations Found</h4>
                <p className="text-xs text-zinc-400">
                  {searchQuery ? `No services match "${searchQuery}".` : 'No integrations configured for this category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                {filteredIntegrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 hover:border-zinc-700 flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl border border-zinc-700 bg-zinc-900/60 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-zinc-800 text-zinc-300">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      {item.connected ? (
                        <>
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Connected
                          </span>
                          <button
                            onClick={() => handleToggle(item.id, true)}
                            className="px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleToggle(item.id, false)}
                          className="w-full py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all active:scale-[0.985] cursor-pointer"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: API Keys & Webhooks (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* API Keys Card */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Developer API Keys</h4>
                <p className="text-[11px] text-zinc-400">Bearer tokens for platform REST APIs.</p>
              </div>
              <span className="text-xs font-mono text-zinc-400">({apiKeys.length})</span>
            </div>

            {createdSecret && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1.5">
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                  Copy secret key now (Won't be shown again)
                </span>
                <div className="flex items-center justify-between gap-2 bg-black/50 p-2 rounded-lg font-mono text-[11px] text-blue-200">
                  <span className="truncate">{createdSecret}</span>
                  <Copy
                    onClick={() => copyToClipboard(createdSecret, 'Secret Key')}
                    className="w-3.5 h-3.5 text-blue-400 hover:text-white cursor-pointer shrink-0"
                  />
                </div>
                <button
                  onClick={() => setCreatedSecret(null)}
                  className="text-[10px] text-zinc-400 hover:underline pt-1"
                >
                  Dismiss
                </button>
              </div>
            )}

            {apiKeys.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500 space-y-1">
                <Key className="w-5 h-5 mx-auto text-zinc-600 mb-1" />
                <p>No API keys generated yet.</p>
                <p className="text-[10px] text-zinc-600">Create a key to access APIs programmatically.</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <Key className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-white text-[11px]">{key.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{key.keyPrefix || 'sk_live_••••'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowKeyModal(true)}
              className="w-full py-2 rounded-xl border border-dashed border-zinc-700 hover:border-blue-500 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Generate New Key
            </button>
          </div>

          {/* Webhooks Card */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Event Webhooks</h4>
                <p className="text-[11px] text-zinc-400">Real-time HTTP event dispatch.</p>
              </div>
              <span className="text-xs font-mono text-zinc-400">({webhooks.length})</span>
            </div>

            {webhooks.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500 space-y-1">
                <Webhook className="w-5 h-5 mx-auto text-zinc-600 mb-1" />
                <p>No webhook endpoints registered.</p>
                <p className="text-[10px] text-zinc-600">Register an HTTPS endpoint to receive call events.</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <div className="space-y-0.5 truncate max-w-[200px]">
                      <p className="font-semibold text-white text-[11px] truncate">{wh.name || 'Call Event Webhook'}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{wh.url}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete Webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowWebhookModal(true)}
              className="w-full py-2 rounded-xl border border-dashed border-zinc-700 hover:border-blue-500 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Webhook Endpoint
            </button>
          </div>
        </div>
      </div>

      {/* Add API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateKey} className="bg-[#0f1424] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Generate Developer API Key</h3>
            <p className="text-xs text-zinc-400">
              Provide a memorable label (e.g. "Zapier Pipeline" or "Production Server").
            </p>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Backend"
                required
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25"
              >
                Create Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateWebhook} className="bg-[#0f1424] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Register Webhook Endpoint</h3>
            <p className="text-xs text-zinc-400">
              Enter the HTTPS endpoint where Samvada should send real-time JSON payloads for call and campaign events.
            </p>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Webhook URL</label>
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks/calls"
                required
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25"
              >
                Register Endpoint
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
