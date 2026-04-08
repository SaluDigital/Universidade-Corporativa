import { motion } from 'framer-motion';
import {
  Users, BookOpen, GitBranch, Award, TrendingUp, AlertTriangle,
  Clock, CheckCircle2, BarChart2, Zap, Activity, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { StatCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { monthlyProgress, completionByDepartment, topCourses, mockUsers, mockUserTracks } from '../../data/mock';
import { formatDate } from '../../lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export function AdminDashboard() {
  const overdueTracks = mockUserTracks.filter(t => t.status === 'overdue');
  const recentUsers = mockUsers.slice(-3);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-screen-xl">
      {/* Welcome banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-violet-600/20 via-blue-600/10 to-cyan-600/10 border border-violet-500/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-violet-400" />
              <span className="text-violet-400 text-sm font-medium">Painel Administrativo</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Visão Geral do Sistema</h2>
            <p className="text-slate-400 text-sm">Acompanhe o desempenho da sua universidade corporativa em tempo real.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 text-sm font-medium">
            <Activity size={14} />
            Sistema operacional
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Colaboradores" value="7" subtitle="6 ativos" icon={<Users />} color="purple" trend={{ value: 12, label: 'esse mês' }} />
        <StatCard title="Cursos ativos" value="8" subtitle="120h de conteúdo" icon={<BookOpen />} color="blue" trend={{ value: 2, label: 'novos' }} />
        <StatCard title="Trilhas" value="4" subtitle="3 obrigatórias" icon={<GitBranch />} color="cyan" />
        <StatCard title="Certificados" value="3" subtitle="emitidos no período" icon={<Award />} color="emerald" trend={{ value: 18, label: 'esse mês' }} />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly chart */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">Progresso Mensal</h3>
              <p className="text-slate-500 text-sm">Conclusões e certificados emitidos</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-violet-500 rounded-full inline-block" />Conclusões</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-cyan-500 rounded-full inline-block" />Certificados</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyProgress}>
              <defs>
                <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#12122b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' }}
                cursor={{ stroke: 'rgba(139,92,246,0.2)', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="completions" stroke="#8b5cf6" fill="url(#gComp)" strokeWidth={2} dot={false} name="Conclusões" />
              <Area type="monotone" dataKey="certificates" stroke="#06b6d4" fill="url(#gCert)" strokeWidth={2} dot={false} name="Certificados" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-1">Conclusão por Área</h3>
          <p className="text-slate-500 text-sm mb-4">Taxa geral de conclusão</p>
          <div className="flex justify-center mb-4">
            <PieChart width={160} height={160}>
              <Pie
                data={completionByDepartment}
                cx={80} cy={80} innerRadius={50} outerRadius={75}
                dataKey="rate" nameKey="name" strokeWidth={0}
              >
                {completionByDepartment.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} opacity={0.85} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {completionByDepartment.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                <span className="text-xs text-slate-400 flex-1 truncate">{d.name}</span>
                <span className="text-xs font-semibold text-white">{d.rate}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department completion */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">Taxa de Conclusão por Área</h3>
              <p className="text-slate-500 text-sm">Desempenho atual dos departamentos</p>
            </div>
          </div>
          <div className="space-y-4">
            {completionByDepartment.map((dept, i) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm text-slate-400 w-28 flex-shrink-0">{dept.name}</span>
                <ProgressBar value={dept.rate} size="md" className="flex-1" />
                <div className="flex items-center gap-2 w-28 justify-end">
                  <span className="text-sm font-semibold text-white">{dept.rate}%</span>
                  <span className="text-xs text-slate-600">{dept.completed}/{dept.total}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <h3 className="font-semibold text-white">Trilhas Vencidas</h3>
            <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full">
              {overdueTracks.length}
            </span>
          </div>
          <div className="space-y-3">
            {overdueTracks.map(track => {
              const user = mockUsers.find(u => u.id === track.user_id);
              return (
                <div key={track.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <Avatar name={user?.name ?? 'U'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-red-400">Trilha Comercial</p>
                    <p className="text-xs text-slate-600">{track.progress_percent}% concluído</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock size={14} />
              <span>Próximos vencimentos</span>
            </div>
            <div className="mt-3 space-y-2">
              {mockUserTracks.filter(t => t.status === 'in_progress').slice(0, 2).map(track => {
                const user = mockUsers.find(u => u.id === track.user_id);
                return (
                  <div key={track.id} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    <span className="flex-1 truncate">{user?.name.split(' ')[0]}</span>
                    <span>{track.progress_percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top courses + Recent users */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Cursos mais assistidos</h3>
            <BarChart2 size={16} className="text-slate-500" />
          </div>
          <div className="space-y-3">
            {topCourses.map((course, i) => (
              <div key={course.name} className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-600 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{course.name}</p>
                  <ProgressBar value={course.rate} size="xs" className="mt-1" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{course.completions}</p>
                  <p className="text-xs text-slate-600">concl.</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Atividade recente</h3>
            <Activity size={16} className="text-slate-500" />
          </div>
          <div className="space-y-3">
            {[
              { user: 'Ana Paula Lima', action: 'concluiu CRM e Funil', time: '2h atrás', icon: '✓', color: 'emerald' },
              { user: 'Pedro Souza', action: 'iniciou Atendimento e Conversão', time: '4h atrás', icon: '▶', color: 'blue' },
              { user: 'Fernanda Costa', action: 'obteve certificado Onboarding', time: '1d atrás', icon: '🏆', color: 'amber' },
              { user: 'Rafael Torres', action: 'foi matriculado em trilha', time: '2d atrás', icon: '+', color: 'violet' },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0
                  ${event.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                    event.color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
                    event.color === 'amber' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-violet-500/15 text-violet-400'}`}
                >
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white"><span className="font-medium">{event.user}</span> {event.action}</p>
                  <p className="text-xs text-slate-600">{event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
