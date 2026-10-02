import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  ShieldAlert, 
  Database, 
  Flame, 
  Layers, 
  FileText, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const GodModeHubPage: React.FC = () => {
  const { isSuperAdmin, currentUser } = useAuth();

  const godModules = [
    {
      title: 'Administrator Access Management',
      desc: 'Provision new dashboard admins via secondary auth app and manage role clearance levels.',
      path: '/admin/god-mode/admins',
      icon: Users,
      badge: 'Super Admin',
      accent: 'from-amber-500/20 to-red-500/20 border-amber-500/40 text-amber-400'
    },
    {
      title: 'Raw Firestore Editor',
      desc: 'Direct JSON document inspection, live attribute mutations, and document deletion across all collections.',
      path: '/admin/god-mode/raw-editor',
      icon: Database,
      badge: 'Level 4 Clearance',
      accent: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400'
    },
    {
      title: 'Bulk Fleet Command & Sync',
      desc: 'Execute batch command dispatches, license updates, or bulk data purges across multiple devices.',
      path: '/admin/bulk-ops',
      icon: Layers,
      badge: 'Operational',
      accent: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-400'
    },
    {
      title: 'System Activity & Audit Logs',
      desc: 'Chronological timeline of remote hardware signals, authentication events, and screenshot dispatches.',
      path: '/admin/logs',
      icon: FileText,
      badge: 'Audit Trail',
      accent: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
    },
    {
      title: 'Global Telemetry & Fleet Export',
      desc: 'Download CSV and JSON snapshots of registered devices, users, and guest sessions for offline backup.',
      path: '/admin/export',
      icon: Download,
      badge: 'Export Engine',
      accent: 'from-slate-500/20 to-slate-700/20 border-slate-500/40 text-slate-400'
    },
    {
      title: 'Nuclear Danger Zone',
      desc: 'Irreversible emergency maintenance: purge guest tracking tokens, inactive hardware nodes, or total reset.',
      path: '/admin/god-mode/danger',
      icon: Flame,
      badge: 'Emergency Only',
      accent: 'from-red-600/30 to-red-950/50 border-red-500/60 text-red-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-red-950 via-[#121927] to-amber-950 border border-red-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-red-500 via-amber-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold font-heading text-white">
                  God Mode Control Center
                </h1>
                <Badge variant="warning" size="md">
                  Active Clearance
                </Badge>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Privileged administrative subsystem for root-level Firestore mutations, bulk commands, and security rule diagnostics.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-amber-300 bg-amber-950/80 px-3.5 py-1.5 rounded-xl border border-amber-600 block">
              UID: {currentUser?.uid?.substring(0, 12)}...
            </span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {godModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.path} to={mod.path} className="group">
              <Card 
                variant="default" 
                hoverEffect 
                className="p-6 h-full flex flex-col justify-between border transition-all duration-200 group-hover:border-red-500/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-linear-to-br ${mod.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="neutral" size="sm">
                      {mod.badge}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-red-500 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors">
                  <span>Enter Module</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
