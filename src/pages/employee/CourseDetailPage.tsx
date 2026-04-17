import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Clock, Award, CheckCircle, HelpCircle, Video,
  Loader2, AlertCircle, Trophy, RotateCcw, XCircle, BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import {
  getCourseById, getCourseQuiz, getUserCourseProgress,
  upsertCourseProgress, saveExamAttempt, getUserExamAttempts,
} from '../../lib/api';
import type { Course, Quiz, QuizQuestion, ExamAttempt } from '../../types';
import toast from 'react-hot-toast';

type Phase = 'viewing' | 'exam' | 'result';

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const categoryColors: Record<string, string> = {
  Onboarding: 'emerald', Cultura: 'cyan', Comercial: 'purple',
  Gestão: 'amber', Marketing: 'pink', Técnico: 'blue',
};

const ALT_LABELS = ['A', 'B', 'C', 'D'];

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userProgress, setUserProgress] = useState<any | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [phase, setPhase] = useState<Phase>('viewing');
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<{ score: number; passed: boolean; correct: number } | null>(null);
  const examStartRef = useRef<string>('');

  useEffect(() => {
    if (!courseId || !user) return;
    loadData();
  }, [courseId, user]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: courseData }, { data: progressData }, { data: quizData }] = await Promise.all([
      getCourseById(courseId!),
      getUserCourseProgress(user!.id),
      getCourseQuiz(courseId!),
    ]);

    const course = courseData as Course;
    setCourse(course);

    const prog = (progressData as any[])?.find(p => p.course_id === courseId) ?? null;
    setUserProgress(prog);

    if (quizData) {
      const q = quizData as Quiz;
      q.questions = [...(q.questions ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      q.questions.forEach(question => {
        question.answers = [...(question.answers ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      });
      setQuiz(q);

      const { data: attemptsData } = await getUserExamAttempts(user!.id, q.id);
      setAttempts((attemptsData as ExamAttempt[]) ?? []);
    }

    // Inicia progresso automaticamente na primeira visita
    if (!prog && course) {
      await upsertCourseProgress({
        user_id: user!.id,
        course_id: courseId,
        status: 'in_progress',
        progress_percent: 0,
        started_at: new Date().toISOString(),
        last_access_at: new Date().toISOString(),
      });
    } else if (prog) {
      await upsertCourseProgress({
        user_id: user!.id,
        course_id: courseId,
        status: prog.status,
        progress_percent: prog.progress_percent,
        last_access_at: new Date().toISOString(),
      });
    }

    setLoading(false);
  };

  const startExam = () => {
    if (!quiz?.questions?.length) return toast.error('Prova ainda não disponível');
    const shuffled = shuffleArray(quiz.questions).slice(0, 10);
    setExamQuestions(shuffled);
    setAnswers({});
    examStartRef.current = new Date().toISOString();
    setPhase('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeCourseWithoutExam = async () => {
    try {
      await upsertCourseProgress({
        user_id: user!.id,
        course_id: courseId,
        status: 'completed',
        progress_percent: 100,
        completed_at: new Date().toISOString(),
        last_access_at: new Date().toISOString(),
      });
      toast.success('Curso concluído!');
      setUserProgress((prev: any) => ({ ...prev, status: 'completed', progress_percent: 100 }));
    } catch {
      toast.error('Erro ao concluir curso');
    }
  };

  const submitExam = async () => {
    if (Object.keys(answers).length < examQuestions.length) {
      return toast.error('Responda todas as perguntas antes de enviar');
    }

    setSubmitting(true);
    try {
      let correct = 0;
      examQuestions.forEach(q => {
        const selectedId = answers[q.id];
        const correctAnswer = q.answers?.find(a => a.is_correct);
        if (selectedId && correctAnswer && selectedId === correctAnswer.id) correct++;
      });

      const score = Math.round((correct / examQuestions.length) * 100);
      const minimumGrade = quiz?.minimum_grade ?? 70;
      const passed = score >= minimumGrade;

      const attemptNumber = attempts.length + 1;

      const { error: attemptErr } = await saveExamAttempt({
        user_id: user!.id,
        quiz_id: quiz!.id,
        score,
        passed,
        attempt_number: attemptNumber,
        started_at: examStartRef.current,
        finished_at: new Date().toISOString(),
      });
      if (attemptErr) throw attemptErr;

      // Atualiza progresso do curso — o trigger auto_issue_certificate dispara aqui
      await upsertCourseProgress({
        user_id: user!.id,
        course_id: courseId,
        status: passed ? 'completed' : 'in_progress',
        progress_percent: passed ? 100 : userProgress?.progress_percent ?? 50,
        grade: score,
        completed_at: passed ? new Date().toISOString() : null,
        last_access_at: new Date().toISOString(),
      });

      setExamResult({ score, passed, correct });
      setPhase('result');

      if (passed) {
        setUserProgress((prev: any) => ({ ...prev, status: 'completed', progress_percent: 100, grade: score }));
        setAttempts(prev => [{ id: '', user_id: user!.id, quiz_id: quiz!.id, score, passed, attempt_number: attemptNumber, started_at: examStartRef.current, created_at: new Date().toISOString() }, ...prev]);
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao enviar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  const retryExam = () => {
    setExamResult(null);
    startExam();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-[#6B35B0]" />
    </div>
  );

  if (!course) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500">Curso não encontrado.</p>
    </div>
  );

  const embedUrl = course.video_url ? extractYouTubeId(course.video_url) : null;
  const isCompleted = userProgress?.status === 'completed';
  const hasQuiz = !!quiz && (quiz.questions?.length ?? 0) > 0;
  const minimumGrade = quiz?.minimum_grade ?? 70;
  const bestAttempt = attempts.reduce<ExamAttempt | null>((best, a) => (!best || a.score > best.score ? a : best), null);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/employee/courses')}
          className="mt-1 p-2 rounded-xl glass border border-white/5 text-slate-500 hover:text-white transition-all flex-shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {course.category && (
              <Badge variant={(categoryColors[course.category] ?? 'slate') as any}>{course.category}</Badge>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle size={12} /> Concluído
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white leading-snug">{course.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock size={11} />{course.workload_hours}h de conteúdo</span>
            {course.has_certificate && <span className="flex items-center gap-1 text-amber-400"><Award size={11} />Emite certificado</span>}
            {course.requires_exam && <span className="flex items-center gap-1 text-[#9B6FD4]"><HelpCircle size={11} />Requer avaliação</span>}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── FASE: ASSISTINDO ── */}
        {phase === 'viewing' && (
          <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

            {/* Player YouTube */}
            {embedUrl ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${embedUrl}?rel=0&modestbranding=1`}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-[#6B35B0]/20 to-slate-900 border border-white/5 flex flex-col items-center justify-center gap-3">
                <Video size={40} className="text-slate-700" />
                <p className="text-slate-600 text-sm">Vídeo não configurado</p>
              </div>
            )}

            {/* Descrição */}
            {course.description && (
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={15} className="text-[#9B6FD4]" />
                  <h3 className="text-sm font-semibold text-white">Sobre este curso</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{course.description}</p>
              </div>
            )}

            {/* Progresso */}
            {userProgress && (
              <div className="glass-card rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2 text-xs text-slate-500">
                  <span>Seu progresso</span>
                  <span>{userProgress.progress_percent ?? 0}%</span>
                </div>
                <ProgressBar value={userProgress.progress_percent ?? 0} size="sm" />
                {userProgress.grade != null && (
                  <p className="text-xs text-slate-500 mt-2">
                    Melhor nota: <span className={userProgress.grade >= minimumGrade ? 'text-emerald-400' : 'text-red-400'}>{userProgress.grade}%</span>
                  </p>
                )}
              </div>
            )}

            {/* Seção de avaliação */}
            {course.requires_exam && (
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-[#9B6FD4]" />
                  <h3 className="text-sm font-semibold text-white">Avaliação Final</h3>
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Trophy size={18} className="text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-300">Aprovado!</p>
                      <p className="text-xs text-emerald-400/70">
                        Nota: {userProgress?.grade}% · Nota mínima: {minimumGrade}%
                      </p>
                    </div>
                    {course.has_certificate && (
                      <Button
                        variant="secondary"
                        className="ml-auto"
                        onClick={() => navigate('/employee/certificates')}
                        icon={<Award size={14} />}
                      >
                        Ver certificado
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• A prova contém <span className="text-white">10 perguntas</span> selecionadas aleatoriamente</p>
                      <p>• Nota mínima para aprovação: <span className="text-white">{minimumGrade}%</span></p>
                      <p>• Você pode refazer a prova quantas vezes precisar</p>
                    </div>

                    {attempts.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">Tentativas anteriores</p>
                        {attempts.slice(0, 3).map((a, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/5 text-xs">
                            <span className="text-slate-500">Tentativa {a.attempt_number}</span>
                            <span className={a.passed ? 'text-emerald-400' : 'text-red-400'}>
                              {a.score}% {a.passed ? '✓' : '✗'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!hasQuiz ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                        <AlertCircle size={13} />
                        Avaliação em preparação — disponível em breve.
                      </div>
                    ) : (
                      <Button onClick={startExam} icon={<HelpCircle size={15} />} className="w-full justify-center">
                        {attempts.length > 0 ? 'Refazer Avaliação' : 'Iniciar Avaliação'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Concluir sem prova */}
            {!course.requires_exam && !isCompleted && (
              <Button onClick={completeCourseWithoutExam} icon={<CheckCircle size={15} />} className="w-full justify-center">
                Marcar como concluído
              </Button>
            )}

            {!course.requires_exam && isCompleted && course.has_certificate && (
              <Button variant="secondary" onClick={() => navigate('/employee/certificates')} icon={<Award size={15} />} className="w-full justify-center">
                Ver meu certificado
              </Button>
            )}
          </motion.div>
        )}

        {/* ── FASE: PROVA ── */}
        {phase === 'exam' && (
          <motion.div key="exam" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-[#9B6FD4]" />
                <span className="text-sm font-medium text-white">Avaliação Final</span>
              </div>
              <span className="text-xs text-slate-500">
                {Object.keys(answers).length}/{examQuestions.length} respondidas
              </span>
            </div>

            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(Object.keys(answers).length / examQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-[#6B35B0] to-[#4BC8C8] rounded-full"
              />
            </div>

            <div className="space-y-5">
              {examQuestions.map((q, qi) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.04 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-[#6B35B0]/20 border border-[#6B35B0]/20 flex items-center justify-center text-xs font-bold text-[#C4A8E8] flex-shrink-0">
                      {qi + 1}
                    </span>
                    <p className="text-sm font-medium text-white leading-relaxed">{q.question_text}</p>
                  </div>
                  <div className="space-y-2 pl-10">
                    {[...(q.answers ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((ans, ai) => (
                      <button
                        key={ans.id}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: ans.id }))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                          answers[q.id] === ans.id
                            ? 'bg-[#6B35B0]/20 border-[#6B35B0]/40 text-white'
                            : 'border-white/5 text-slate-400 hover:border-[#6B35B0]/20 hover:text-white'
                        }`}
                      >
                        <span className={`text-xs font-bold w-5 flex-shrink-0 ${answers[q.id] === ans.id ? 'text-[#C4A8E8]' : 'text-slate-600'}`}>
                          {ALT_LABELS[ai]}.
                        </span>
                        {ans.answer_text}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setPhase('viewing')}>
                <ChevronLeft size={15} /> Voltar
              </Button>
              <Button
                onClick={submitExam}
                disabled={submitting || Object.keys(answers).length < examQuestions.length}
                className="flex-1 justify-center"
                icon={submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              >
                {submitting ? 'Enviando...' : 'Enviar Respostas'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── FASE: RESULTADO ── */}
        {phase === 'result' && examResult && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className={`glass-card rounded-2xl p-8 text-center border ${
              examResult.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
            }`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="mb-4"
              >
                {examResult.passed
                  ? <Trophy size={52} className="text-amber-400 mx-auto" />
                  : <XCircle size={52} className="text-red-400 mx-auto" />}
              </motion.div>

              <h3 className={`text-2xl font-bold mb-1 ${examResult.passed ? 'text-emerald-300' : 'text-red-300'}`}>
                {examResult.passed ? 'Aprovado!' : 'Não aprovado'}
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                {examResult.passed
                  ? 'Parabéns! Você atingiu a nota mínima.'
                  : `Você precisa de ${minimumGrade}% para ser aprovado. Tente novamente!`}
              </p>

              <div className="flex items-center justify-center gap-8 mb-6">
                <div>
                  <p className={`text-4xl font-bold ${examResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {examResult.score}%
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">sua nota</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-4xl font-bold text-slate-300">{examResult.correct}/10</p>
                  <p className="text-xs text-slate-600 mt-0.5">acertos</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-4xl font-bold text-slate-500">{minimumGrade}%</p>
                  <p className="text-xs text-slate-600 mt-0.5">mínimo</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                {examResult.passed ? (
                  <>
                    {course.has_certificate && (
                      <Button onClick={() => navigate('/employee/certificates')} icon={<Award size={15} />}>
                        Ver certificado
                      </Button>
                    )}
                    <Button variant="secondary" onClick={() => setPhase('viewing')}>
                      Voltar ao curso
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={retryExam} icon={<RotateCcw size={15} />}>
                      Tentar novamente
                    </Button>
                    <Button variant="secondary" onClick={() => setPhase('viewing')}>
                      Voltar ao curso
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
