import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, User, BookOpen, Award, GitBranch, Shield } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { mockAuditLogs, mockUsers } from '../../data/mock';
import { formatDateTime } from '../../lib/utils';

const actionConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  CREATE_USER: { label: 'Criou usuário', icon: <User size={13} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ASSIGN_TRACK: { label: 'Atribuiu trilha', icon: <GitBranch size={13} />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  COMPLETE_LESSON: { label: 'Concluiu aula', icon: <BookOpen size={13} />, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  CREATE_COURSE: { label: 'Criou curso', icon: <BookOpen size={13} />, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  SUBMIT_QUIZ: { label: 'Enviou avaliação', icon: <Shield size={13} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ISSUE_CERTIFICATE: { label: 'Emitiu certificado', icon: <Award size={13} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

// Extend mock logs
const extendedLogs = [
  ...mockAuditLogs,
  { id: 'log6', user_id: 'u3', action: 'COMPLETE_LESSON', entity_type: 'lesson', entity_id: 'l5', ip_address: '192.168.1.10', created_at: '2024-04-08T10:15:00' },
  { id: 'log7', user_id: 'u1', action: 'ISSUE_CERTIFICATE', entity_type: 'certificate', entity_id: 'cert1', ip_address: '192.168.1.1', created_at: '2024-04-08T09:30:00' },
  { id: 'log8', user_id: 'u4', action: 'COMPLETE_LESSON', entity_type: 'lesson', entity_id: 'l3', ip_address: '192.168.1.15', created_at: '2024-04-07T16:45:00' },
];

export function LogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filtered = extendedLogs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter(log => {
      const user = mockUsers.find(u => u.id === log.user_id);
      const matchSearch = !search || user?.name.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase());
      const matchAction = !actionFilter || log.action === actionFilter;
      return matchSearch && matchAction;
    });

  return (
    <div className="max-w-screen-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Logs de Auditoria</h2>
          <p className="text-slate-500 text-sm mt-1">Histórico completo de ações no sistema</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-2 rounded-xl">
          <Shield size={13} />
          {filtered.length} registros
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário ou ação..." className="input-base pl-10" />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="input-base w-48 appearance-none">
          <option value="">Todas as ações</option>
          {Object.keys(actionConfig).map(a => (
            <option key={a} value={a} style={{ background: '#0d0d1f' }}>{actionConfig[a].label}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Usuário', 'Ação', 'Entidade', 'IP', 'Data/Hora'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const user = mockUsers.find(u => u.id === log.user_id);
                const action = actionConfig[log.action];

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user?.name ?? 'S'} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-white">{user?.name ?? 'Sistema'}</p>
                          <p className="text-xs text-slate-600 capitalize">{user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {action ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${action.color}`}>
                          {action.icon}
                          {action.label}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">{log.action}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                      {log.entity_type}:{log.entity_id}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 font-mono">{log.ip_address}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
