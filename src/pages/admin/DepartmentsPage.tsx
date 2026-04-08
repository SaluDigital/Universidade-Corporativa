import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Layers, Users, Edit2, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { mockDepartments, mockPositions, mockUsers } from '../../data/mock';
import toast from 'react-hot-toast';

const deptColors = [
  'from-violet-500/20 to-purple-900/10 border-violet-500/20',
  'from-blue-500/20 to-cyan-900/10 border-blue-500/20',
  'from-emerald-500/20 to-teal-900/10 border-emerald-500/20',
  'from-amber-500/20 to-orange-900/10 border-amber-500/20',
  'from-pink-500/20 to-rose-900/10 border-pink-500/20',
  'from-cyan-500/20 to-blue-900/10 border-cyan-500/20',
];

export function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [posForm, setPosForm] = useState({ name: '', description: '' });

  const getUserCount = (deptId: string) => mockUsers.filter(u => u.department_id === deptId).length;
  const getPositions = (deptId: string) => mockPositions.filter(p => p.department_id === deptId);

  return (
    <div className="max-w-screen-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Departamentos e Cargos</h2>
          <p className="text-slate-500 text-sm mt-1">{mockDepartments.length} departamentos cadastrados</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>Novo Departamento</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDepartments.map((dept, i) => {
          const positions = getPositions(dept.id);
          const userCount = getUserCount(dept.id);
          const color = deptColors[i % deptColors.length];

          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card rounded-2xl overflow-hidden border ${color.split(' ')[2]}`}
            >
              <div className={`bg-gradient-to-br ${color.split(' ')[0]} ${color.split(' ')[1]} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Layers size={18} className="text-white/70" />
                  </div>
                  <button
                    onClick={() => { setForm({ name: dept.name, description: dept.description ?? '' }); setIsModalOpen(true); }}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{dept.name}</h3>
                <p className="text-white/50 text-sm">{dept.description}</p>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Users size={13} /> {userCount} colaboradores</span>
                  <span className="flex items-center gap-1.5"><Briefcase size={13} /> {positions.length} cargos</span>
                </div>

                {positions.length > 0 && (
                  <div className="space-y-1.5">
                    {positions.map(pos => (
                      <div key={pos.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-all group">
                        <span className="text-sm text-slate-400">{pos.name}</span>
                        <button className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-slate-300 transition-all">
                          <Edit2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { setSelectedDept(dept.id); setIsPosModalOpen(true); }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/10 text-xs text-slate-600 hover:text-slate-400 hover:border-violet-500/30 transition-all"
                >
                  <Plus size={12} /> Novo cargo
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Departamento"
        footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button onClick={() => { toast.success('Departamento criado!'); setIsModalOpen(false); }}>Criar</Button></>}
      >
        <div className="space-y-4">
          <Input label="Nome do departamento" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Comercial" />
          <Textarea label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} rows={3} />
        </div>
      </Modal>

      <Modal isOpen={isPosModalOpen} onClose={() => setIsPosModalOpen(false)} title="Novo Cargo"
        footer={<><Button variant="secondary" onClick={() => setIsPosModalOpen(false)}>Cancelar</Button><Button onClick={() => { toast.success('Cargo criado!'); setIsPosModalOpen(false); }}>Criar</Button></>}
      >
        <div className="space-y-4">
          <Input label="Nome do cargo" value={posForm.name} onChange={e => setPosForm({ ...posForm, name: e.target.value })} placeholder="Ex: Consultor de Vendas" />
          <Textarea label="Descrição" value={posForm.description} onChange={v => setPosForm({ ...posForm, description: v })} rows={3} />
        </div>
      </Modal>
    </div>
  );
}
