import { motion } from 'framer-motion';
import { Award, Download, Share2, Shield, Calendar, Hash, BookOpen, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { mockCertificates, mockCourses } from '../../data/mock';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useState } from 'react';

export function MyCertificatesPage() {
  const { user } = useAuthStore();
  const [showConfetti, setShowConfetti] = useState(false);

  const myCerts = mockCertificates
    .filter(c => c.user_id === user?.id)
    .map(cert => ({
      ...cert,
      course: mockCourses.find(c => c.id === cert.course_id),
    }));

  const handleDownload = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
    toast.success('Certificado baixado com sucesso!');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} colors={['#6B35B0', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b']} />}

      <div>
        <h2 className="text-2xl font-bold text-white">Meus Certificados</h2>
        <p className="text-slate-500 text-sm mt-1">{myCerts.length} certificados obtidos</p>
      </div>

      {myCerts.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Award size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-lg">Nenhum certificado ainda</p>
          <p className="text-slate-600 text-sm mt-2">Conclua seus cursos para ganhar certificados.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {myCerts.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
              className="glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 transition-all group"
            >
              {/* Certificate visual */}
              <div className="relative bg-gradient-to-br from-amber-600/25 via-orange-600/15 to-red-900/10 p-6 border-b border-white/5">
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, rgba(251,191,36,0.1) 0px, rgba(251,191,36,0.1) 1px, transparent 1px, transparent 10px)'
                }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Award size={20} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-400/70 font-semibold uppercase tracking-wide">Certificado</p>
                        <p className="text-xs text-slate-500">de Conclusão</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                      <Shield size={11} /> Válido
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs mb-1">Certificamos que</p>
                  <p className="text-white font-bold text-lg">{user?.name}</p>
                  <p className="text-slate-400 text-xs mt-1">concluiu com êxito o curso</p>
                  <h3 className="text-white font-semibold text-base mt-1 leading-snug">{cert.course?.title}</h3>
                </div>
              </div>

              {/* Certificate info */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-slate-600" />
                    {formatDate(cert.issued_at)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-slate-600" />
                    {cert.course?.workload_hours}h de conteúdo
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Hash size={11} className="text-slate-600" />
                    <span className="font-mono text-slate-600 truncate text-xs">{cert.certificate_code}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/25 text-xs font-semibold text-amber-400 hover:from-amber-600/30 hover:to-orange-600/30 transition-all"
                  >
                    <Download size={13} /> Baixar PDF
                  </button>
                  <button
                    onClick={() => toast.success('Link copiado!')}
                    className="p-2.5 rounded-xl glass border border-white/10 text-slate-500 hover:text-white hover:border-[#6B35B0]/20 transition-all"
                  >
                    <Share2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
