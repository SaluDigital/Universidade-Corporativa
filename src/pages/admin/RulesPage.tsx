import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Zap, GitBranch, Building2, Briefcase, ArrowRight, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { mockTracks, mockDepartments, mockPositions } from '../../data/mock';
import toast from 'react-hot-toast';

interface Rule {
  id: string;
  track_id: string;
  department_id?: string;
  position_id?: string;
  auto_assign: boolean;
}

const mockRules: Rule[] = [
  { id: 'r1', track_id: 't1', department_id: undefined, position_id: undefined, auto_assign: true },
  { id: 'r2', track_id: 't2', department_id: 'd1', position_id: undefined, auto_assign: true },
  { id: 'r3', track_id: 't3', department_id: undefined, position_id: 'p2', auto_assign: true },
  { id: 'r4', track_id: 't4', department_id: 'd4', position_id: undefined, auto_assign: false },
];

export function RulesPage() {
  const [rules, setRules] = useState(mockRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ track_id: '', department_id: '', position_id: '', auto_assign: true });

  const getTrack = (id: string) => mockTracks.find(t => t.id === id);
  const getDept = (id?: string) => id ? mockDepartments.find(d => d.id === id)?.name : null;
  const getPos = (id?: string) => id ? mockPositions.find(p => p.id === id)?.name : null;

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success('Regra removida!');
  };

  const addRule = () => {
    if (!form.track_id) return toast.error('Selecione uma trilha');
    const newRule: Rule = { id: `r${Date.now()}`, track_id: form.track_id, department_id: form.department_id || undefined, position_id: form.position_id || undefined, auto_assign: form.auto_assign };
    setRules(prev => [...prev, newRule]);
    toast.success('Regra criada com sucesso!');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-screen-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Regras de Atribuição</h2>
          <p className="text-slate-500 text-sm mt-1">Defina quem recebe qual trilha automaticamente</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>Nova Regra</Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
        <Zap size={18} className="text-violet-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-violet-300">Atribuição automática inteligente</p>
          <p className="text-xs text-slate-500 mt-1">
            Quando um colaborador é cadastrado ou tem seu cargo/área alterado, o sistema atribui automaticamente
            as trilhas baseadas nas regras abaixo. Regras de cargo têm prioridade sobre regras de departamento.
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule, i) => {
          const track = getTrack(rule.track_id);
          const dept = getDept(rule.department_id);
          const pos = getPos(rule.position_id);

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-5 flex items-center gap-4 group"
            >
              {/* Target */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  {!dept && !pos ? (
                    <Target size={18} className="text-violet-400" />
                  ) : dept ? (
                    <Building2 size={18} className="text-blue-400" />
                  ) : (
                    <Briefcase size={18} className="text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    {!dept && !pos && <Badge variant="purple">Todos os colaboradores</Badge>}
                    {dept && <Badge variant="blue">{dept}</Badge>}
                    {pos && <Badge variant="emerald">{pos}</Badge>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {!dept && !pos ? 'Qualquer cargo ou departamento' : dept ? `Departamento: ${dept}` : `Cargo: ${pos}`}
                  </p>
                </div>
              </div>

              <ArrowRight size={16} className="text-slate-600 flex-shrink-0" />

              {/* Track */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <GitBranch size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{track?.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {track?.is_mandatory && <Badge variant="red">Obrigatória</Badge>}
                    {track?.is_blocking && <Badge variant="amber">Bloqueante</Badge>}
                    {track?.deadline_days && <span className="text-xs text-slate-500">{track.deadline_days} dias</span>}
                  </div>
                </div>
              </div>

              {/* Auto assign */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {rule.auto_assign ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={12} /> Auto
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    Manual
                  </div>
                )}
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Regra de Atribuição"
        footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button onClick={addRule}>Criar regra</Button></>}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Configure qual trilha será atribuída com base em departamento e/ou cargo.</p>
          <Select label="Trilha" options={[{ value: '', label: 'Selecione a trilha...' }, ...mockTracks.map(t => ({ value: t.id, label: t.title }))]} value={form.track_id} onChange={v => setForm({ ...form, track_id: v })} />
          <Select label="Departamento (opcional)" options={[{ value: '', label: 'Todos os departamentos' }, ...mockDepartments.map(d => ({ value: d.id, label: d.name }))]} value={form.department_id} onChange={v => setForm({ ...form, department_id: v })} />
          <Select label="Cargo (opcional)" options={[{ value: '', label: 'Todos os cargos' }, ...mockPositions.map(p => ({ value: p.id, label: p.name }))]} value={form.position_id} onChange={v => setForm({ ...form, position_id: v })} />
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.auto_assign} onChange={e => setForm({ ...form, auto_assign: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-500 cursor-pointer" />
            <span className="text-sm text-slate-300">Atribuição automática ao cadastrar colaborador</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
