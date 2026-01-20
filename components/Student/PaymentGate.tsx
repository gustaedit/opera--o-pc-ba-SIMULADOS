
import React from 'react';
import { ShieldAlert, CreditCard, ChevronRight, Zap, CheckCircle2, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const PaymentGate: React.FC = () => {
  const handleLogout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="max-w-2xl w-full animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="glass-card !bg-white/[0.02] border-white/10 p-10 md:p-16 text-center space-y-10">
          <div className="inline-block p-6 bg-red-500/10 text-red-500 rounded-[2.5rem] border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
            <ShieldAlert className="w-16 h-16" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Acesso Restrito</h1>
            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Sua conta ainda não possui autorização de nível operacional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <Benefit icon={<Zap />} text="Banco de Questões Completo" />
            <Benefit icon={<Zap />} text="Simulados Táticos Ilimitados" />
            <Benefit icon={<Zap />} text="Inteligência Artificial Ativa" />
            <Benefit icon={<Zap />} text="Análise de Desempenho Real" />
          </div>

          <div className="pt-6 space-y-4">
            <button 
              className="w-full py-6 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              onClick={() => window.open('https://chat.whatsapp.com/B8ySbaIg1E2H8tc3i42HYl', '_blank')}
            >
              Liberar Acesso Agora <CreditCard className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full py-4 text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Benefit = ({ icon, text }: any) => (
  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
    <div className="text-primary">{React.cloneElement(icon, { className: "w-4 h-4" })}</div>
    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{text}</span>
  </div>
);
