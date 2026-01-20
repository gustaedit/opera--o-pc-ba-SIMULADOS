
import React, { useState } from 'react';
import { Shield, Lock, ChevronRight, Mail, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        onLoginSuccess();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert("Conta criada! Verifique seu e-mail se necessário ou faça login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Erro de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ba-blue/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block p-5 bg-primary text-black rounded-[2rem] shadow-[0_0_50px_rgba(250,204,21,0.3)] mb-8">
            <Shield className="w-12 h-12 stroke-[2.5px]" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">Acesso Tático</h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-4 leading-relaxed">
            {isLogin ? 'Autenticação de Operador' : 'Cadastro de Novo Recruta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card !bg-white/[0.03] p-8 md:p-10 space-y-6 border-white/10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Identificação (E-mail)</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="email"
                  placeholder="EX: OPERADOR@MISSÃO.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 p-5 pl-14 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Chave de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="password"
                  placeholder="SUA SENHA"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 p-5 pl-14 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all rounded-2xl"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-500 text-[10px] font-black uppercase leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Engajar Sistema' : 'Criar Credencial'} 
            <ChevronRight className="w-5 h-5" />
          </button>

          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3 h-3" /> {isLogin ? 'Ainda não é membro? Cadastre-se' : 'Já possui acesso? Volte ao Login'}
          </button>
        </form>

        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/20 leading-relaxed">
            Conta de Teste Liberada:<br/>
            <span className="text-primary/60">Email: teste@gmail.com | Senha: teste</span>
          </p>
        </div>
      </div>
    </div>
  );
};
