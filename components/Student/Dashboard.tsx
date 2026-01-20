
import React, { useMemo } from 'react';
import { UserAttempt } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, Zap, Crosshair, BarChart, Clock } from 'lucide-react';

interface DashboardProps {
  attempts: UserAttempt[];
}

export const Dashboard: React.FC<DashboardProps> = ({ attempts }) => {
  const stats = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter(a => a.isCorrect).length;
    const rate = total > 0 ? (correct / total) * 100 : 0;

    // Cálculo de tempo médio
    const timedAttempts = attempts.filter(a => a.timeSpent !== undefined);
    const totalTime = timedAttempts.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
    const avgTimeMs = timedAttempts.length > 0 ? totalTime / timedAttempts.length : 0;
    
    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
      return `${remainingSeconds}s`;
    };

    const lastAttempts = attempts.slice(-20).map((a, i) => ({
      index: i + 1,
      val: a.isCorrect ? 100 : 0
    }));

    return { total, correct, rate, lastAttempts, avgTime: formatTime(avgTimeMs) };
  }, [attempts]);

  return (
    <div className="space-y-10 md:space-y-16 pb-24">
      {/* HUD Units */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusBlock icon={<Crosshair />} label="Efetividade" value={`${stats.rate.toFixed(0)}%`} color="text-primary" />
        <StatusBlock icon={<Clock />} label="Tempo Médio" value={stats.avgTime} color="text-cyan-600 dark:text-cyan-400" />
        <StatusBlock icon={<Zap />} label="Concluídas" value={stats.total} color="text-gray-900 dark:text-white" />
        <StatusBlock icon={<Activity />} label="Sequência" value="04" color="text-emerald-700 dark:text-emerald-500" />
      </div>

      {/* Main Efficiency Graph */}
      <div className="bg-[#F1F5F9] dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/40">Radar de Consistência</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">Últimas Interações Operacionais</p>
          </div>
          <div className="p-4 bg-primary/20 rounded-2xl shadow-sm shadow-primary/10">
            <BarChart className="text-yellow-800 dark:text-primary w-6 h-6" />
          </div>
        </div>
        
        <div className="h-48 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.lastAttempts}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke="#FACC15" 
                fillOpacity={1} 
                fill="url(#colorVal)" 
                strokeWidth={4}
                isAnimationActive={true}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000', 
                  borderRadius: '16px',
                  border: 'none', 
                  color: '#fff', 
                  fontSize: '11px',
                  padding: '12px'
                }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Feed */}
      <div className="space-y-6">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/40 px-4">Log Detalhado de Operações</h4>
        <div className="grid grid-cols-1 gap-3">
          {attempts.slice(-6).reverse().map((a, i) => (
            <div key={i} className="flex items-center justify-between p-5 md:p-6 bg-[#F8FAFC] dark:bg-white/[0.02] border border-gray-300 dark:border-white/5 rounded-3xl hover:bg-white dark:hover:bg-white/[0.05] transition-all shadow-sm">
              <div className="flex items-center gap-5 overflow-hidden">
                <div className={`w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.1)] ${a.isCorrect ? 'bg-emerald-600' : 'bg-red-600'}`} />
                <div className="truncate">
                  <p className="text-sm md:text-base font-black uppercase italic text-gray-900 dark:text-white truncate tracking-tight">{a.discipline}</p>
                  <p className="text-[10px] text-gray-600 dark:text-white/30 uppercase tracking-[0.2em] mt-1 truncate font-bold">{a.topic}</p>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 ml-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-600 dark:text-white/20">
                  <Clock className="w-3 h-3" />
                  {a.timeSpent ? Math.floor(a.timeSpent / 1000) + 's' : '--'}
                </div>
                <span className={`text-[8px] font-black uppercase mt-1 ${a.isCorrect ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'}`}>
                  {a.isCorrect ? 'Sucesso' : 'Falha'}
                </span>
              </div>
            </div>
          ))}
          {attempts.length === 0 && (
            <div className="text-center py-16 bg-[#F8FAFC] dark:bg-white/[0.02] border border-dashed border-gray-400 dark:border-white/10 rounded-[2.5rem] text-gray-500 dark:text-white/20 italic font-bold uppercase tracking-[0.5em] text-xs">
              Sem registros operacionais
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBlock = ({ icon, label, value, color }: any) => (
  <div className="bg-[#F8FAFC] dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 p-8 md:p-10 rounded-[2.5rem] group hover:border-primary transition-all flex flex-row sm:flex-col items-center sm:items-start gap-6 sm:gap-0 shadow-sm">
    <div className="text-gray-500 dark:text-white/20 sm:mb-6 group-hover:text-primary transition-colors transform group-hover:scale-110 duration-300">
      {React.cloneElement(icon, { className: "w-8 h-8 stroke-[2px]" })}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-white/30 sm:mb-2">{label}</p>
      <p className={`text-2xl md:text-4xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
  </div>
);
