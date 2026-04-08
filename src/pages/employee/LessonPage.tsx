import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle, ChevronLeft, ChevronRight, CheckCircle, BookOpen,
  FileText, Link2, HelpCircle, Clock, Award, Menu, X, Volume2
} from 'lucide-react';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { mockCourses } from '../../data/mock';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const demoModules = [
  {
    id: 'm1', title: 'Introdução', lessons: [
      { id: 'l1', title: 'Bem-vindo à SuperDental', type: 'video', duration: 8, completed: true },
      { id: 'l2', title: 'Nossa história', type: 'video', duration: 12, completed: true },
      { id: 'l3', title: 'Missão e Valores', type: 'text', duration: 5, completed: false },
    ]
  },
  {
    id: 'm2', title: 'Cultura e Processos', lessons: [
      { id: 'l4', title: 'O Jeito SuperDental de Trabalhar', type: 'video', duration: 15, completed: false },
      { id: 'l5', title: 'Material complementar', type: 'pdf', duration: 10, completed: false },
      { id: 'l6', title: 'Avaliação do módulo', type: 'quiz', duration: 20, completed: false },
    ]
  },
  {
    id: 'm3', title: 'Ferramentas e Sistemas', lessons: [
      { id: 'l7', title: 'CRM e Pipeline', type: 'video', duration: 18, completed: false },
      { id: 'l8', title: 'Comunicação Interna', type: 'link', duration: 5, completed: false },
    ]
  },
];

const typeIcon: Record<string, React.ReactNode> = {
  video: <PlayCircle size={13} />,
  text: <FileText size={13} />,
  pdf: <BookOpen size={13} />,
  link: <Link2 size={13} />,
  quiz: <HelpCircle size={13} />,
};

const allLessons = demoModules.flatMap(m => m.lessons);
const totalLessons = allLessons.length;
const completedLessons = allLessons.filter(l => l.completed).length;

export function LessonPage() {
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(allLessons.find(l => !l.completed) ?? allLessons[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const course = mockCourses[0];

  const progress = Math.round((completedLessons / totalLessons) * 100);
  const currentIdx = allLessons.findIndex(l => l.id === currentLesson?.id);

  const handleNext = () => {
    if (currentIdx < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIdx + 1]);
      setQuizAnswer(null);
      setQuizSubmitted(false);
    }
  };

  const handleComplete = () => {
    toast.success('Aula concluída! 🎉');
    handleNext();
  };

  return (
    <div className="flex gap-0 -m-6 h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 bg-[#0a0a1a] border-r border-white/5 overflow-y-auto"
          >
            <div className="p-4">
              {/* Course info */}
              <div className="mb-4">
                <button onClick={() => navigate('/employee/courses')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-3">
                  <ChevronLeft size={13} /> Voltar
                </button>
                <h3 className="font-semibold text-white text-sm leading-snug mb-2">{course.title}</h3>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>{completedLessons}/{totalLessons} aulas</span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar value={progress} size="xs" />
              </div>

              {/* Modules */}
              <div className="space-y-4">
                {demoModules.map(module => (
                  <div key={module.id}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">{module.title}</p>
                    <div className="space-y-1">
                      {module.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => { setCurrentLesson(lesson); setQuizAnswer(null); setQuizSubmitted(false); }}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                            currentLesson?.id === lesson.id
                              ? 'bg-violet-500/15 border border-violet-500/20 text-violet-300'
                              : lesson.completed
                              ? 'text-emerald-400/70 hover:bg-white/3'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/3'
                          }`}
                        >
                          <span className={`mt-0.5 flex-shrink-0 ${currentLesson?.id === lesson.id ? 'text-violet-400' : lesson.completed ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {lesson.completed ? <CheckCircle size={13} /> : typeIcon[lesson.type]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium leading-snug truncate">{lesson.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{lesson.duration}min</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-[#070711]/80 backdrop-blur">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg glass text-slate-500 hover:text-white transition-all">
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{currentLesson?.title}</p>
            <p className="text-xs text-slate-500">{course.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg glass text-slate-500 hover:text-white transition-all"><Volume2 size={14} /></button>
          </div>
        </div>

        {/* Lesson content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {currentLesson?.type === 'video' && (
              <motion.div key={currentLesson.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Fake video player */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-white/5 group cursor-pointer">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800')] bg-cover bg-center opacity-10" />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 cursor-pointer"
                  >
                    <PlayCircle size={36} className="text-white ml-1" />
                  </motion.div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-violet-500 rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs text-white/40 mt-1">
                      <span>3:24</span>
                      <span>{currentLesson.duration}:00</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-3">{currentLesson.title}</h2>
                <p className="text-slate-400 leading-relaxed">
                  Nesta aula, você vai entender os fundamentos e a história da SuperDental, nossa jornada, nossos valores e o que nos torna únicos no mercado odontológico brasileiro. Preparado para essa imersão?
                </p>
              </motion.div>
            )}

            {currentLesson?.type === 'text' && (
              <motion.div key={currentLesson.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold text-white mb-4">{currentLesson.title}</h2>
                <div className="prose prose-invert prose-sm max-w-none space-y-4">
                  <p className="text-slate-300 leading-relaxed">
                    A SuperDental nasceu com uma missão clara: democratizar o acesso à saúde bucal de qualidade no Brasil. Desde nossa fundação, acreditamos que um sorriso saudável é um direito, não um privilégio.
                  </p>
                  <h3 className="text-lg font-semibold text-white">Nossa Missão</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Transformar a experiência odontológica, tornando o cuidado com a saúde bucal acessível, humanizado e de alta qualidade para todos os brasileiros.
                  </p>
                  <h3 className="text-lg font-semibold text-white">Nossos Valores</h3>
                  <ul className="text-slate-400 space-y-2">
                    {['Excelência no atendimento', 'Transparência e ética', 'Inovação constante', 'Cuidado genuíno com pessoas', 'Resultados com propósito'].map(v => (
                      <li key={v} className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" />{v}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {currentLesson?.type === 'quiz' && (
              <motion.div key={currentLesson.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle size={20} className="text-violet-400" />
                  <h2 className="text-xl font-bold text-white">Avaliação do Módulo</h2>
                </div>
                <div className="glass-card rounded-2xl p-6">
                  <p className="text-slate-300 font-medium mb-4">Qual é a missão da SuperDental?</p>
                  <div className="space-y-3">
                    {[
                      'Maximizar lucros da empresa',
                      'Democratizar o acesso à saúde bucal de qualidade',
                      'Vender o maior número de planos possível',
                      'Expandir para mercados internacionais',
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => !quizSubmitted && setQuizAnswer(opt)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-sm
                          ${quizAnswer === opt
                            ? quizSubmitted
                              ? i === 1 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'
                              : 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                            : quizSubmitted && i === 1
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'text-slate-400 border-white/8 hover:border-violet-500/20 hover:text-white'}`}
                      >
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {!quizSubmitted && quizAnswer && (
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setQuizSubmitted(true);
                        if (quizAnswer === 'Democratizar o acesso à saúde bucal de qualidade') {
                          toast.success('Correto! Excelente! 🎯');
                        } else {
                          toast.error('Resposta incorreta. Revise o conteúdo.');
                        }
                      }}
                    >
                      Confirmar resposta
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {currentLesson?.type === 'pdf' && (
              <motion.div key={currentLesson.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold text-white mb-4">{currentLesson.title}</h2>
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center py-12">
                  <BookOpen size={48} className="text-violet-400 mb-4" />
                  <p className="text-white font-medium mb-2">Material Complementar em PDF</p>
                  <p className="text-slate-500 text-sm mb-4">Manual de Integração SuperDental - v2.0</p>
                  <Button icon={<BookOpen size={15} />}>Abrir documento</Button>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => currentIdx > 0 && setCurrentLesson(allLessons[currentIdx - 1])}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/8 text-sm text-slate-400 hover:text-white hover:border-violet-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} /> Anterior
              </button>

              {currentIdx === allLessons.length - 1 ? (
                <Button icon={<Award size={15} />} onClick={() => { toast.success('Curso concluído! Certificado gerado! 🏆'); navigate('/employee/certificates'); }}>
                  Concluir curso
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  Marcar como concluído <ChevronRight size={15} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
