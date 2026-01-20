
import React, { useState } from 'react';
import { Shield, Lock, ChevronRight, User } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-yellow-400 text-black brutal-border mb-6">
            <Shield className="w-10 h-10 stroke-[3px]" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Terminal de Comando</h2>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Área Restrita ao Administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="OPERADOR"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-4 pl-12 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="password"
                placeholder="CHAVE DE ACESSO"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-4 pl-12 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">Acesso Negado: Credenciais Inválidas</p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-yellow-400 text-black font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            Autenticar <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
