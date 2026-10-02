import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Database, 
  FileJson, 
  FileSpreadsheet, 
  Check, 
  RefreshCw, 
  Layers, 
  CheckSquare, 
  Square,
  ShieldCheck,
  Eye,
  Copy
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  fetchAdminUsers, 
  fetchAdminDevices, 
  fetchAdminGuestUsers, 
  fetchActivityLogs, 
  getTimestampSeconds 
} from '../../services/deviceService';
import toast from 'react-hot-toast';

export const AdminExportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Selection
  const [includeUsers, setIncludeUsers] = useState(true);
  const [includeDevices, setIncludeDevices] = useState(true);
  const [includeGuests, setIncludeGuests] = useState(true);
  const [includeLogs, setIncludeLogs] = useState(true);

  // Formatting options
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [isoTimestamps, setIsoTimestamps] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, d, g] = await Promise.all([
        fetchAdminUsers(false),
        fetchAdminDevices(false),
        fetchAdminGuestUsers(false)
      ]);
      setUsers(u);
      setDevices(d);
      setGuests(g);
      setLogs(fetchActivityLogs());
    } catch {
      toast.error('Failed to pull Firestore tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Format record helper
  const cleanRecord = (item: any) => {
    const copy = { ...item };
    if (isoTimestamps) {
      for (const [key, val] of Object.entries(copy)) {
        if (val && typeof val === 'object' && ('seconds' in val || 'toDate' in val)) {
          const sec = getTimestampSeconds(val);
          if (sec) copy[key] = new Date(sec * 1000).toISOString();
        }
      }
    }
    return copy;
  };

  // Build bundle
  const getCompiledData = () => {
    const payload: Record<string, any[]> = {};
    if (includeUsers) payload.users = users.map(cleanRecord);
    if (includeDevices) payload.devices = devices.map(cleanRecord);
    if (includeGuests) payload.guest_users = guests.map(cleanRecord);
    if (includeLogs) payload.admin_logs = logs.map(cleanRecord);
    return payload;
  };

  const compiledData = getCompiledData();
  const totalRecords = Object.values(compiledData).reduce((acc, arr) => acc + arr.length, 0);

  // Preview snippet
  const previewJsonString = JSON.stringify(compiledData, null, prettyPrint ? 2 : undefined);
  const estimatedKb = (new Blob([previewJsonString]).size / 1024).toFixed(1);

  const handleDownload = () => {
    if (totalRecords === 0) {
      toast.error('No collections selected');
      return;
    }

    if (format === 'json') {
      const blob = new Blob([previewJsonString], { type: 'application/json' });
      downloadBlob(blob, `project101_firestore_backup_${Date.now()}.json`);
      toast.success('JSON export downloaded');
    } else {
      // Export as multi-part or dominant collection CSV
      let csvContent = '';
      for (const [colName, rows] of Object.entries(compiledData)) {
        if (rows.length === 0) continue;
        csvContent += `=== COLLECTION: ${colName.toUpperCase()} ===\n`;
        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
        csvContent += headers.join(',') + '\n';
        for (const row of rows) {
          const line = headers.map(h => {
            const val = row[h];
            if (val === undefined || val === null) return '';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(',');
          csvContent += line + '\n';
        }
        csvContent += '\n\n';
      }
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, `project101_firestore_export_${Date.now()}.csv`);
      toast.success('CSV export downloaded');
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Database Exporter & Backup
            </h1>
            <Badge variant="teal" size="sm">Snapshots</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-mono">
            Full client-side dump of user documents, device telemetry, guest sessions, and logs.
          </p>
        </div>

        <Button
          onClick={loadAll}
          isLoading={loading}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Collections
        </Button>
      </div>

      {/* Grid: Settings on left, Preview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="default" className="p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-teal-600 dark:text-teal-300 flex items-center gap-2">
              <Database className="w-4 h-4" /> 1. SELECT COLLECTIONS
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5 text-xs">
                  <input
                    type="checkbox"
                    checked={includeUsers}
                    onChange={(e) => setIncludeUsers(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="font-semibold text-slate-900 dark:text-white">Users Collection</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{users.length} docs</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5 text-xs">
                  <input
                    type="checkbox"
                    checked={includeDevices}
                    onChange={(e) => setIncludeDevices(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="font-semibold text-slate-900 dark:text-white">Fleet Devices (Subcollections)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{devices.length} docs</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5 text-xs">
                  <input
                    type="checkbox"
                    checked={includeGuests}
                    onChange={(e) => setIncludeGuests(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="font-semibold text-slate-900 dark:text-white">Guest Users</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{guests.length} docs</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5 text-xs">
                  <input
                    type="checkbox"
                    checked={includeLogs}
                    onChange={(e) => setIncludeLogs(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="font-semibold text-slate-900 dark:text-white">Admin Activity Logs</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{logs.length} entries</span>
              </label>
            </div>
          </Card>

          <Card variant="default" className="p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-teal-600 dark:text-teal-300 flex items-center gap-2">
              <FileJson className="w-4 h-4" /> 2. FORMAT & TRANSFORM
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  format === 'json'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileJson className="w-4 h-4" /> JSON Format
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  format === 'csv'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV Format
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={prettyPrint}
                  onChange={(e) => setPrettyPrint(e.target.checked)}
                  disabled={format === 'csv'}
                  className="accent-teal-500 rounded"
                />
                <span>Pretty Print JSON (2 spaces)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isoTimestamps}
                  onChange={(e) => setIsoTimestamps(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>Convert Firestore Timestamps to ISO Strings</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="primary"
                size="md"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold"
                onClick={handleDownload}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Export ({totalRecords} items, ~{estimatedKb} KB)
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Data Preview */}
        <div className="lg:col-span-7">
          <Card variant="default" className="h-full flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Export Preview
              </span>
              <span className="text-[11px] text-slate-500">
                {totalRecords} Documents • ~{estimatedKb} KB
              </span>
            </div>

            <div className="flex-1 p-4 bg-slate-900 dark:bg-[#141E33] overflow-auto max-h-[520px] font-mono text-[11px] text-teal-300">
              <pre className="whitespace-pre-wrap break-all">
                {previewJsonString.slice(0, 5000)}
                {previewJsonString.length > 5000 && '\n\n... [truncated preview for browser performance] ...'}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
