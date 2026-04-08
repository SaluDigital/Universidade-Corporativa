import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, GitBranch, Shield, Clock, Users, BookOpen, ChevronRight, Edit2, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { mockTracks, mockCourses, mockUserTracks } from '../../data/mock';
import type { Track } from '../../types';
import toast from 'react-hot-toast';

const trackColors = [
  { bg: 'from-violet-600/20 to-purple-900/10', icon: 'text-violet-400', border: 'border-violet-500/20' },
  { bg: 'from-blue-600/20 to-cyan-900/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
  { bg: 'from-emerald-600/20 to-teal-900/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  { bg: 'from-amber-600/20 to-orange-900/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
];

export function TracksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', is_mandatory: true, is_blocking: false, deadline_days: '' });

  const openCreate = () => {
    setEditTrack(null);
    setForm({ title: '', description: '', is_mandatory: true, is_blocking: false, deadline_days: '' });
    setIsModalOpen(true);
  };

  const openEdit = (track: Track) => {
    setEditTrack(track);
    setForm({ title: track.title, description: track.description, is_mandatory: track.is_mandatory, is_blocking: track.is_blocking, deadline_days: track.deadline_days?.toString() ?? '' });
    setIsModalOpen(true);
  };

  const getTrackUsers = (trackId: string) => mockUserTracks.filter(t => t.track_id === trackId);
  const getTrackCompletionRate = (trackId: string) => {
    const userTracks = getTrackUsers(trackId);
    if (!userTracks.length) return 0;
    const completed = userTracks.filter(t => t.status === 'completed').length;
    return Math.round((completed / userTracks.length) * 100);
  };

  return (
    <div className="max-w-screen-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trilhas de Aprendizado</h2>
          <p className="text-slate-500 text-sm mt-1">Configure e gerencie trilhas de desenvolvimento</p>
        </div>
        <Button onClick={openCreate} icon={<Plus size={16} />}>Nova Trilha</Button>
      </div>

      {/* Tracks */}
      <div className="space-y-4">
        {mockTracks.map((track, i) => {
          const color = trackColors[i % trackColors.length];
          const users = getTrackUsers(track.id);
          const completionRate = getTrackCompletionRate(track.id);
          const isExpanded = expandedTrack === track.id;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-2xl overflow-hidden border ${color.border}`}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${color.bg} p-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.bg} border ${color.border} flex items-center justify-center flex-shrink-0`}>
                      <GitBranch size={22} className={color.icon} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{track.title}</h3>
                        {track.is_mandatory && (
                          <Badge variant="red">Obrigatória</Badge>
                        )}
                        {track.is_blocking && (
                          <Badge variant="amber"><AlertTriangle size={10} className="mr-1" />Bloqueante</Badge>
                        )}
                        {!track.is_active && <Badge variant="slate">Inativa</Badge>}
                      </div>
                      <p className="text-slate-400 text-sm">{track.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(track)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                      className={`p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all ${isExpanded ? 'bg-white/10 text-white' : ''}`}
                    >
                      <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Users size={13} className="text-slate-500" />
                    {users.length} matriculados
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <BookOpen size={13} className="text-slate-500" />
                    {3} cursos
                  </div>
                  {track.deadline_days && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Clock size={13} className="text-slate-500" />
                      {track.deadline_days} dias
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm ml-auto">
                    <span className={color.icon + ' font-bold text-lg'}>{completionRate}%</span>
                    <span className="text-slate-500 text-xs">concluído</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${color.icon === 'text-violet-400' ? 'from-violet-500 to-purple-400' : color.icon === 'text-blue-400' ? 'from-blue-500 to-cyan-400' : color.icon === 'text-emerald-400' ? 'from-emerald-500 to-teal-400' : 'from-amber-500 to-orange-400'} rounded-full`}
                  />
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 border-t border-white/5"
                >
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Cursos nesta trilha</h4>
                  <div className="space-y-2">
                    {mockCourses.slice(0, 3).map((course, j) => (
                      <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                        <span className="text-xs font-bold text-slate-600 w-5">{j + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{course.title}</p>
                          <p className="text-xs text-slate-500">{course.workload_hours}h · {course.category}</p>
                        </div>
                        {course.has_certificate && (
                          <span className="text-xs text-amber-400">🏆 Certifica</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => toast('Adicionar curso em breve!')}>Adicionar curso</Button>
                    <Button variant="ghost" size="sm" onClick={() => toast('Reordenar em breve!')}>Reordenar</Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editTrack ? 'Editar Trilha' : 'Nova Trilha'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success(editTrack ? 'Trilha atualizada!' : 'Trilha criada!'); setIsModalOpen(false); }}>
              {editTrack ? 'Salvar' : 'Criar trilha'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome da trilha" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Trilha Comercial" />
          <Textarea label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} />
          <Input label="Prazo (dias)" type="number" value={form.deadline_days} onChange={e => setForm({ ...form, deadline_days: e.target.value })} placeholder="30" />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_mandatory} onChange={e => setForm({ ...form, is_mandatory: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-500 cursor-pointer" />
              <span className="text-sm text-slate-300">Trilha obrigatória</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_blocking} onChange={e => setForm({ ...form, is_blocking: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-500 cursor-pointer" />
              <span className="text-sm text-slate-300">Bloqueante</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
