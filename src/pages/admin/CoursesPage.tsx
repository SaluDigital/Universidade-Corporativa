import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, Clock, Award, CheckCircle, Edit2, Eye, ToggleLeft, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { mockCourses } from '../../data/mock';
import type { Course } from '../../types';
import toast from 'react-hot-toast';

const categoryColors: Record<string, 'purple' | 'blue' | 'emerald' | 'amber' | 'cyan' | 'pink'> = {
  Onboarding: 'emerald',
  Cultura: 'blue',
  Comercial: 'violet' as any,
  Gestão: 'purple',
  Marketing: 'pink',
};

const courseGradients = [
  'from-violet-600/30 to-purple-900/20',
  'from-blue-600/30 to-cyan-900/20',
  'from-emerald-600/30 to-teal-900/20',
  'from-amber-600/30 to-orange-900/20',
  'from-pink-600/30 to-rose-900/20',
  'from-cyan-600/30 to-blue-900/20',
  'from-indigo-600/30 to-violet-900/20',
  'from-teal-600/30 to-emerald-900/20',
];

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [form, setForm] = useState({
    title: '', description: '', category: '', workload_hours: '', has_certificate: false, requires_exam: false, minimum_grade: ''
  });

  const filtered = mockCourses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditCourse(null);
    setForm({ title: '', description: '', category: '', workload_hours: '', has_certificate: false, requires_exam: false, minimum_grade: '' });
    setIsModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      title: course.title, description: course.description, category: course.category,
      workload_hours: course.workload_hours.toString(), has_certificate: course.has_certificate,
      requires_exam: course.requires_exam, minimum_grade: course.minimum_grade?.toString() ?? '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-screen-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Cursos</h2>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} cursos cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 glass rounded-xl border border-white/5">
            {(['grid', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === mode ? 'bg-violet-500/20 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {mode === 'grid' ? 'Grid' : 'Lista'}
              </button>
            ))}
          </div>
          <Button onClick={openCreate} icon={<Plus size={16} />}>Novo Curso</Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cursos..." className="input-base pl-10" />
      </div>

      {/* Grid */}
      <motion.div
        layout
        className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}
      >
        {filtered.map((course, i) => (
          <motion.div
            key={course.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-2xl overflow-hidden group ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : ''}`}
          >
            {viewMode === 'grid' ? (
              <>
                {/* Card thumbnail */}
                <div className={`relative h-36 bg-gradient-to-br ${courseGradients[i % courseGradients.length]} flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
                  <BookOpen size={40} className="text-white/20" />
                  <div className="absolute top-3 left-3">
                    <Badge variant={(categoryColors[course.category] || 'slate') as any}>{course.category}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    {course.has_certificate && (
                      <span className="w-6 h-6 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center" title="Emite certificado">
                        <Award size={11} className="text-amber-400" />
                      </span>
                    )}
                    {!course.is_active && (
                      <span className="w-6 h-6 bg-slate-500/20 border border-slate-500/30 rounded-lg flex items-center justify-center">
                        <ToggleLeft size={11} className="text-slate-400" />
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => openEdit(course)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-white glass rounded-lg hover:bg-white/20 transition-all">
                      <Edit2 size={11} /> Editar
                    </button>
                    <button onClick={() => toast('Módulos em breve!')} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-white glass rounded-lg hover:bg-white/20 transition-all">
                      <Eye size={11} /> Ver
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">{course.title}</h4>
                  <p className="text-slate-500 text-xs mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={11} /> {course.workload_hours}h</span>
                    {course.requires_exam && <span className="flex items-center gap-1"><CheckCircle size={11} className="text-violet-400" /> Avaliação</span>}
                    <span className="flex items-center gap-1 ml-auto"><Star size={11} className="text-slate-600" /> v{course.version}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${courseGradients[i % courseGradients.length]} flex items-center justify-center flex-shrink-0`}>
                  <BookOpen size={20} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium text-white text-sm">{course.title}</h4>
                    <Badge variant={(categoryColors[course.category] || 'slate') as any}>{course.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{course.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                  <span className="flex items-center gap-1"><Clock size={11} /> {course.workload_hours}h</span>
                  {course.has_certificate && <Award size={13} className="text-amber-400" />}
                  <StatusBadge status={course.is_active ? 'active' : 'inactive'} />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(course)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                    <Edit2 size={14} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editCourse ? 'Editar Curso' : 'Novo Curso'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success(editCourse ? 'Curso atualizado!' : 'Curso criado!'); setIsModalOpen(false); }}>
              {editCourse ? 'Salvar' : 'Criar curso'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Título do curso" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Onboarding Geral SuperDental" />
          <Textarea label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Descreva o objetivo do curso..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Categoria" options={[{ value: '', label: 'Selecione...' }, { value: 'Onboarding', label: 'Onboarding' }, { value: 'Cultura', label: 'Cultura' }, { value: 'Comercial', label: 'Comercial' }, { value: 'Gestão', label: 'Gestão' }, { value: 'Marketing', label: 'Marketing' }, { value: 'Técnico', label: 'Técnico' }]} value={form.category} onChange={v => setForm({ ...form, category: v })} />
            <Input label="Carga horária (h)" type="number" value={form.workload_hours} onChange={e => setForm({ ...form, workload_hours: e.target.value })} placeholder="8" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.has_certificate} onChange={e => setForm({ ...form, has_certificate: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 cursor-pointer" />
              <span className="text-sm text-slate-300">Emite certificado</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.requires_exam} onChange={e => setForm({ ...form, requires_exam: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 cursor-pointer" />
              <span className="text-sm text-slate-300">Requer avaliação</span>
            </label>
          </div>
          {form.requires_exam && (
            <Input label="Nota mínima (%)" type="number" value={form.minimum_grade} onChange={e => setForm({ ...form, minimum_grade: e.target.value })} placeholder="70" />
          )}
        </div>
      </Modal>
    </div>
  );
}
