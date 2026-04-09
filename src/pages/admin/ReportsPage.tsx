import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, TrendingDown, Users, Award, AlertTriangle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { completionByDepartment, monthlyProgress, topCourses, mockUsers, mockUserTracks } from '../../data/mock';
import toast from 'react-hot-toast';

const managerData = [
  { name: 'Carlos M.', team: 5, completion: 68, overdue: 1 },
  { name: 'Maria S.', team: 4, completion: 85, overdue: 0 },
  { name: 'João P.', team: 6, completion: 52, overdue: 2 },
  { name: 'Ana C.', team: 3, completion: 100, overdue: 0 },
];

const abandonedCourses = [
  { name: 'Tráfego Pago Avançado', rate: 52, started: 25, dropped: 13 },
  { name: 'Gestão por Indicadores', rate: 35, started: 20, dropped: 7 },
  { name: 'CRM e Funil', rate: 28, started: 43, dropped: 12 },
];

const radarData = [
  { subject: 'Onboarding', A: 94, fullMark: 100 },
  { subject: 'Comercial', A: 68, fullMark: 100 },
  { subject: 'CS', A: 82, fullMark: 100 },
  { subject: 'Gestão', A: 55, fullMark: 100 },
  { subject: 'Marketing', A: 91, fullMark: 100 },
  { subject: 'Cultura', A: 88, fullMark: 100 },
];

const COLORS = ['#6B35B0', '#4BC8C8', '#10b981', '#f59e0b', '#9B6FD4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 rounded-xl border border-white/10 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function ReportsPage() {
  const overdueUsers = mockUserTracks.filter(t => t.status === 'overdue');
  const pendingUsers = mockUserTracks.filter(t => t.status === 'not_started');

  return (
    <div className="max-w-screen-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Relatórios e Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">Inteligência de dados para decisões estratégicas</p>
        </div>
        <Button variant="secondary" icon={<Download size={15} />} onClick={() => toast('Exportando relatório...')}>
          Exportar PDF
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Taxa de conclusão geral" value="74%" subtitle="Última atualização hoje" icon={<TrendingUp />} color="emerald" trend={{ value: 6, label: 'vs mês anterior' }} />
        <StatCard title="Trilhas vencidas" value={overdueUsers.length.toString()} subtitle="Requerem atenção" icon={<AlertTriangle />} color="red" />
        <StatCard title="Pendentes" value={pendingUsers.length.toString()} subtitle="Não iniciadas" icon={<Clock />} color="amber" />
        <StatCard title="Certificados no mês" value="35" subtitle="Abril 2024" icon={<Award />} color="purple" trend={{ value: 23, label: 'vs março' }} />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-1">Evolução de Certificados</h3>
          <p className="text-slate-500 text-sm mb-4">Certificados emitidos mês a mês</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyProgress}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="certificates" stroke="#6B35B0" strokeWidth={2.5} dot={{ r: 4, fill: '#6B35B0', strokeWidth: 0 }} name="Certificados" />
              <Line type="monotone" dataKey="completions" stroke="#4BC8C8" strokeWidth={2} dot={{ r: 3, fill: '#4BC8C8', strokeWidth: 0 }} strokeDasharray="4 2" name="Conclusões" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-1">Radar por Categoria</h3>
          <p className="text-slate-500 text-sm mb-4">Cobertura de treinamento</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
              <Radar dataKey="A" stroke="#6B35B0" fill="#6B35B0" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.15 } }} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-1">Taxa por Departamento</h3>
          <p className="text-slate-500 text-sm mb-4">Conclusão de trilhas obrigatórias</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completionByDepartment} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" name="% Conclusão" radius={[6, 6, 0, 0]}>
                {completionByDepartment.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-1">Desempenho por Gestor</h3>
          <p className="text-slate-500 text-sm mb-4">Taxa de conclusão da equipe</p>
          <div className="space-y-4">
            {managerData.map((mgr, i) => (
              <div key={mgr.name} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 w-24">{mgr.name}</span>
                  <ProgressBar value={mgr.completion} size="sm" className="flex-1" />
                  <span className="text-sm font-semibold text-white w-10 text-right">{mgr.completion}%</span>
                  {mgr.overdue > 0 && (
                    <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">{mgr.overdue} atrasado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Abandonment */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-red-400" />
            <h3 className="font-semibold text-white">Cursos com Maior Abandono</h3>
          </div>
          <div className="space-y-3">
            {abandonedCourses.map(c => (
              <div key={c.name} className="flex items-center gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <ProgressBar value={100 - c.rate} color="red" size="xs" className="mt-1.5" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">{c.rate}% abandono</p>
                  <p className="text-xs text-slate-600">{c.dropped}/{c.started} desistiram</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue users */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <h3 className="font-semibold text-white">Colaboradores com Atraso</h3>
            <span className="ml-auto text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">{overdueUsers.length}</span>
          </div>
          <div className="space-y-2">
            {overdueUsers.map(ut => {
              const user = mockUsers.find(u => u.id === ut.user_id);
              return (
                <div key={ut.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <Avatar name={user?.name ?? 'U'} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500">Trilha Comercial</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status="overdue" />
                    <p className="text-xs text-slate-600 mt-0.5">{ut.progress_percent}% concl.</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
