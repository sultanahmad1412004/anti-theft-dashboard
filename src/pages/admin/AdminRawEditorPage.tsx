import React, { useState, useEffect } from 'react';
import { JsonCodeEditor } from '../../components/common/JsonCodeEditor';
import { 
  Code2, 
  Save, 
  Trash2, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Folder, 
  FileText, 
  HelpCircle,
  Copy,
  Layers,
  Wand2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  listCollectionDocs, 
  getRawDocument, 
  saveRawDocument, 
  deleteRawDocument 
} from '../../services/adminService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const PRESET_COLLECTIONS = [
  { label: 'users', path: 'users', desc: 'Registered user profiles & subscriptions' },
  { label: 'guest_users', path: 'guest_users', desc: 'Temporary guest device tracking sessions' },
  { label: 'admin_logs', path: 'admin_logs', desc: 'Audit trail and security events' }
];

export const AdminRawEditorPage: React.FC = () => {
  const { theme } = useTheme();
  const [selectedCollection, setSelectedCollection] = useState('users');
  const [customCollectionPath, setCustomCollectionPath] = useState('');
  const [isCustomCol, setIsCustomCol] = useState(false);

  const activeCollectionPath = isCustomCol ? customCollectionPath.trim() : selectedCollection;

  const [docsList, setDocsList] = useState<Array<{ id: string; data: any }>>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [jsonCode, setJsonCode] = useState<string>('{\n  \n}');
  const [initialJsonCode, setInitialJsonCode] = useState<string>('{}');

  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDocId, setNewDocId] = useState('');
  const [newDocContent, setNewDocContent] = useState('{\n  "createdAt": "2025-01-01T00:00:00.000Z"\n}');

  // Load document list whenever active collection changes
  const loadDocuments = async () => {
    if (!activeCollectionPath) return;
    setLoadingDocs(true);
    try {
      const docs = await listCollectionDocs(activeCollectionPath);
      setDocsList(docs);
      if (docs.length > 0 && !docs.some(d => d.id === selectedDocId)) {
        setSelectedDocId(docs[0].id);
      } else if (docs.length === 0) {
        setSelectedDocId('');
        setJsonCode('{}');
        setInitialJsonCode('{}');
      }
    } catch (err: any) {
      toast.error(`Error listing ${activeCollectionPath}: ${err.message || 'Check path'}`);
      setDocsList([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [activeCollectionPath]);

  // Load single document data when selectedDocId changes
  useEffect(() => {
    if (!selectedDocId || !activeCollectionPath) return;
    const fetchDoc = async () => {
      setLoadingDoc(true);
      try {
        const data = await getRawDocument(activeCollectionPath, selectedDocId);
        if (data) {
          const pretty = JSON.stringify(data, null, 2);
          setJsonCode(pretty);
          setInitialJsonCode(pretty);
        } else {
          setJsonCode('{}');
          setInitialJsonCode('{}');
        }
      } catch (err: any) {
        toast.error(`Failed to load document: ${err.message}`);
      } finally {
        setLoadingDoc(false);
      }
    };
    fetchDoc();
  }, [selectedDocId, activeCollectionPath]);

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonCode);
      setJsonCode(JSON.stringify(parsed, null, 2));
      toast.success('JSON formatted');
    } catch (e: any) {
      toast.error(`Invalid JSON syntax: ${e.message}`);
    }
  };

  const handleConfirmSave = async () => {
    try {
      const parsed = JSON.parse(jsonCode);
      setIsSaving(true);
      await saveRawDocument(activeCollectionPath, selectedDocId, parsed, false);
      setInitialJsonCode(JSON.stringify(parsed, null, 2));
      toast.success(`Document ${selectedDocId} written to Firestore`);
      setSaveModalOpen(false);
      loadDocuments();
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteRawDocument(activeCollectionPath, selectedDocId);
      toast.success(`Deleted ${selectedDocId}`);
      setDeleteModalOpen(false);
      setSelectedDocId('');
      loadDocuments();
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocId.trim()) {
      toast.error('Document ID is required');
      return;
    }
    try {
      const parsed = JSON.parse(newDocContent);
      await saveRawDocument(activeCollectionPath, newDocId.trim(), parsed, false);
      toast.success(`Created document ${newDocId.trim()}`);
      setCreateModalOpen(false);
      setNewDocId('');
      setSelectedDocId(newDocId.trim());
      loadDocuments();
    } catch (e: any) {
      toast.error(`Create failed: ${e.message}`);
    }
  };

  const hasUnsavedChanges = jsonCode !== initialJsonCode;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Raw Firestore Document Editor
            </h1>
            <Badge variant="purple" size="sm">Direct DB</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-mono">
            Direct read/write access to Firestore collections, subcollections, and individual document schemas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreateModalOpen(true)}
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Document
          </Button>
          <Button
            onClick={loadDocuments}
            isLoading={loadingDocs}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Collection & Document Selector Bar */}
      <Card variant="default" className="p-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Collection Select */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> COLLECTION PATH
            </label>
            {!isCustomCol ? (
              <div className="flex gap-1.5">
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-[#E2E8F0] focus:outline-none focus:border-purple-500"
                >
                  {PRESET_COLLECTIONS.map(c => (
                    <option key={c.path} value={c.path}>{c.label} ({c.desc})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomCol(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono whitespace-nowrap cursor-pointer"
                  title="Enter nested path like users/{uid}/devices"
                >
                  Custom
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customCollectionPath}
                  onChange={(e) => setCustomCollectionPath(e.target.value)}
                  placeholder="e.g. users/xyz/devices"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-purple-500 text-xs font-mono text-slate-900 dark:text-[#E2E8F0] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomCol(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono cursor-pointer"
                >
                  Presets
                </button>
              </div>
            )}
          </div>

          {/* Document ID select */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> DOCUMENT ID ({docsList.length} docs found)
            </label>
            <div className="flex gap-2">
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                disabled={docsList.length === 0}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-[#E2E8F0] focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              >
                {docsList.length === 0 ? (
                  <option value="">No documents in this collection</option>
                ) : (
                  docsList.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.id} {d.data?.email ? `(${d.data.email})` : d.data?.device_name ? `(${d.data.device_name})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="md:col-span-3 flex items-end justify-end gap-2 pt-5">
            <button
              type="button"
              onClick={handleFormatJson}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer"
              title="Prettify JSON"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Format
            </button>

            <button
              type="button"
              disabled={!selectedDocId}
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs disabled:opacity-40 cursor-pointer"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Button
              variant="primary"
              size="sm"
              disabled={!selectedDocId || !hasUnsavedChanges}
              onClick={() => setSaveModalOpen(true)}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Doc
            </Button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 px-3 py-1.5 rounded-lg">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> You have unsaved document changes.
            </span>
            <button
              type="button"
              onClick={() => setJsonCode(initialJsonCode)}
              className="underline text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Revert
            </button>
          </div>
        )}
      </Card>

      {/* Monaco Code Editor */}
      <Card variant="default" className="overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Firestore Path: <strong className="text-slate-900 dark:text-white">{activeCollectionPath}/{selectedDocId || '<no document selected>'}</strong>
          </span>
          <span>Monaco JSON Language Mode</span>
        </div>

        <div className="h-[520px] w-full">
          {loadingDoc ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400 font-mono gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-600 dark:text-[#00E5FF]" />
              Loading Firestore document JSON...
            </div>
          ) : (
            <JsonCodeEditor
              height="100%"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={jsonCode}
              onChange={(value) => setJsonCode(value || '')}
            />
          )}
        </div>
      </Card>

      {/* Save Confirmation Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Commit JSON to Firestore"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-[#94A3B8]">
          <p>
            You are about to overwrite document <strong className="text-slate-900 dark:text-white">{activeCollectionPath}/{selectedDocId}</strong>.
          </p>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-[11px] space-y-1">
            <p className="font-bold">⚡ DIRECT DATABASE WRITE:</p>
            <p>This payload will replace the document fields in Firestore immediately. Client devices will ingest updates within seconds.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#334155]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleConfirmSave}
            >
              Commit to Firestore
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Firestore Document"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-[#94A3B8]">
          <p>
            Are you sure you want to permanently delete document <strong className="text-slate-900 dark:text-white">{activeCollectionPath}/{selectedDocId}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 font-mono text-[11px]">
            This action cannot be undone. Any client referencing this ID may lose sync.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#334155]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
            >
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Document Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Firestore Document"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-[#94A3B8] font-mono mb-1">Collection Target</label>
            <input
              type="text"
              readOnly
              value={activeCollectionPath}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-800 dark:text-[#E2E8F0] font-mono mb-1">Document ID</label>
            <input
              type="text"
              value={newDocId}
              onChange={(e) => setNewDocId(e.target.value)}
              placeholder="e.g. user_123 or device_abc"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-[#E2E8F0] font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-800 dark:text-[#E2E8F0] font-mono mb-1">Initial JSON Payload</label>
            <textarea
              rows={6}
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-[#00E5FF] focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateDocument}
            >
              Create Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
