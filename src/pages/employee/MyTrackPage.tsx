import { motion } from 'framer-motion';
import { GitBranch, BookOpen, Clock, Award, ChevronRight, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { ProgressBar, CircularProgress } from '../../components/ui/ProgressBar';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { mockUserTracks, mockTracks, mockCourses, mockCourseProgress } from '../../data/mock';
import { useNavigate } from 'react-router-dom';

export function MyTrackPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const userTracks = mockUserTracks.filter(t => t.user_id === user?.id);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Minha Trilha</h2>
        <p className="text-slate-500 text-sm mt-1">Seu caminho de desenvolvimento na SaluDigital</p>
      </div>

      {userTracks.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <GitBranch size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma trilha atribuída ainda</p>
          <p className="text-slate-600 text-sm mt-1">Fale com seu gestor para ser matriculado em uma trilha.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userTracks.map((ut, i) => {
            const track = mockTracks.find(t => t.id === ut.track_id);
            const isOverdue = ut.status === 'overdue';
            const isCompleted = ut.status === 'completed';

            return (
              <motion.div
                key={ut.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card rounded-2xl overflow-hidden border
                  ${isOverdue ? 'border-red-500/25' : isCompleted ? 'border-emerald-500/20' : 'border-white/7'}`}
              >
                {/* Track header */}
                <div className={`p-5 ${isCompleted ? 'bg-gradient-to-r from-emerald-600/15 to-teal-900/5' : isOverdue ? 'bg-gradient-to-r from-red-600/15 to-rose-900/5' : 'bg-gradient-to-r from-violet-600/15 to-blue-900/5'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                        ${isCompleted ? 'bg-emerald-500/20' : isOverdue ? 'bg-red-500/20' : 'bg-violet-500/20'}`}>
                        {isCompleted ? <CheckCircle size={24} className="text-emerald-400" /> :
                          isOverdue ? <AlertTriangle size={24} className="text-red-400" /> :
                          <GitBranch size={24} className="text-violet-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{track?.title}</h3>
                          {track?.is_mandatory && <Badge variant="red">Obrigatória</Badge>}
                          {track?.is_blocking && <Badge variant="amber">Bloqueante</Badge>}
                        </div>
                        <p className="text-slate-400 text-sm">{track?.description}</p>
                        {ut.deadline_at && (
                          <p className={`text-xs mt-1 flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                            <Clock size={11} />
                            Prazo: {new Date(ut.deadline_at).toLocaleDateString('pt-BR')}
                            {isOverdue && ' — Vencido!'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <CircularProgress
                        value={ut.progress_percent}
                        size={70}
                        color={isCompleted ? '#10b981' : isOverdue ? '#ef4444' : '#8b5cf6'}
                      />
                    </div>
                  </div>
                </div>

                {/* Courses in track */}
                <div className="p-5">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Cursos nesta trilha</h4>
                  <div className="space-y-3">
                    {mockCourses.slice(0, 3).map((course, j) => {
                      const cp = mockCourseProgress.find(p => p.user_id === user?.id && p.course_id === course.id);
                      const courseStatus = cp?.status ?? 'not_started';

                      return (
                        <motion.div
                          key={course.id}
                          whileHover={{ x: 4 }}
                          onClick={() => navigate('/employee/lesson')}
                          className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all group
                            ${courseStatus === 'completed' ? 'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30' :
                              courseStatus === 'in_progress' ? 'bg-violet-500/5 border-violet-500/15 hover:border-violet-500/30' :
                              'bg-white/3 border-white/5 hover:border-violet-500/20'}`}
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                            ${courseStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              courseStatus === 'in_progress' ? 'bg-violet-500/20 text-violet-400' :
                              'bg-white/5 text-slate-600'}`}>
                            {courseStatus === 'completed' ? '✓' : j + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-white">{course.title}</p>
                              <StatusBadge status={courseStatus} />
                            </div>
                            {cp && <ProgressBar value={cp.progress_percent} size="xs" />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                            <span className="flex items-center gap-1"><Clock size={10} />{course.workload_hours}h</span>
                            {course.has_certificate && <Award size={12} className="text-amber-400" />}
                            <ChevronRight size={13} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <StatusBadge status={ut.status} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
