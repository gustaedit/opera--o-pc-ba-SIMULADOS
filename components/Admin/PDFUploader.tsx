
import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, Sparkles, Database, CloudUpload } from 'lucide-react';
import { aiService } from '../../services/ai';
import { Question, Tags } from '../../types';

interface PDFUploaderProps {
  tags: Tags;
  onQuestionsExtracted: (questions: Question[]) => Promise<boolean>;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ tags, onQuestionsExtracted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'indexing' | 'success' | 'error'>('idle');
  const [extractedCount, setExtractedCount] = useState(0);

  const [board, setBoard] = useState(tags.boards[0]);
  const [institution, setInstitution] = useState(tags.institutions[0]);
  const [year, setYear] = useState(tags.years[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('scanning');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        // FASE 01: ESCANEAMENTO IA
        const questions = await aiService.processPDF(base64, board, institution, year);
        setExtractedCount(questions.length);
        
        // FASE 02: INDEXAÇÃO AUTOMÁTICA
        setStatus('indexing');
        const success = await onQuestionsExtracted(questions);
        
        if (success) {
          setStatus('success');
          setFile(null);
        } else {
          throw new Error("Falha na indexação SQL");
        }
      };
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-12 text-center space-y-4">
        <div className="inline-flex p-4 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 text-cyan-400 mb-2">
          <Sparkles className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className="text-4xl font-black uppercase tracking-widest italic text-gray-900 dark:text-white">
          Scanner Tático de Provas
        </h3>
        <p className="text-gray-500 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Alimentação Automática do Banco de Dados via Gemini 3</p>
      </div>

      <div className="bg-[#F8FAFC] dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-10">
        
        {/* Metadados da Prova */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminSelect label="Banca Originária" value={board} onChange={setBoard} options={tags.boards} />
          <AdminSelect label="Órgão Público" value={institution} onChange={setInstitution} options={tags.institutions} />
          <AdminSelect label="Ano do Certame" value={year} onChange={setYear} options={tags.years} />
        </div>

        {/* Dropzone de PDF */}
        <div className={`relative border-4 border-dashed rounded-[2.5rem] p-16 transition-all flex flex-col items-center justify-center gap-6 overflow-hidden ${file ? 'border-cyan-500 bg-cyan-500/5' : 'border-gray-300 dark:border-white/10 hover:border-cyan-500/40'}`}>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" disabled={status !== 'idle' && status !== 'error' && status !== 'success'} />
          
          {status === 'success' ? (
            <div className="text-center animate-in scale-in-95 duration-300">
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Missão Cumprida!</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">{extractedCount} questões indexadas com sucesso</p>
            </div>
          ) : file ? (
            <div className="text-center animate-in scale-in-95 duration-300">
              <FileText className={`w-20 h-20 mx-auto mb-6 ${status === 'scanning' ? 'text-cyan-400 animate-pulse' : 'text-gray-400'}`} />
              <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{file.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-cyan-400/60 font-black uppercase tracking-widest mt-2">
                {status === 'scanning' ? 'Analisando Estrutura...' : status === 'indexing' ? 'Gravando no Banco SQL...' : 'Documento pronto para análise'}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-20 h-20 text-gray-300 dark:text-white/10 mx-auto mb-6" />
              <p className="text-lg font-black text-gray-600 dark:text-white/40 uppercase tracking-tight">Arraste a prova em PDF aqui</p>
              <p className="text-[10px] text-gray-400 dark:text-white/10 font-black uppercase tracking-widest mt-2">Extração e Cadastro Automático de Questões</p>
            </div>
          )}
        </div>

        {/* Ação de Upload */}
        <button 
          onClick={handleUpload}
          disabled={!file || status === 'scanning' || status === 'indexing'}
          className="w-full py-8 bg-cyan-500 text-black font-black uppercase tracking-[0.4em] text-sm rounded-3xl shadow-xl shadow-cyan-500/20 hover:scale-[1.01] transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-4 active:scale-95"
        >
          {status === 'scanning' ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Escaneando PDF...</>
          ) : status === 'indexing' ? (
            <><CloudUpload className="w-6 h-6 animate-bounce" /> Alimentando Banco de Dados...</>
          ) : (
            <><FileText className="w-6 h-6" /> Iniciar Automação Tática</>
          )}
        </button>

        {/* Dica de Uso */}
        <div className="flex items-start gap-4 p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Protocolo de Alimentação</p>
            <p className="text-[10px] text-gray-600 dark:text-white/30 leading-relaxed uppercase tracking-wider">
              Ao clicar, a IA varre o PDF, extrai as questões e as cadastra IMEDIATAMENTE no banco de dados. Certifique-se de que os metadados acima (Banca, Órgão e Ano) correspondam à prova enviada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminSelect = ({ label, value, onChange, options }: any) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white/20 ml-4">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-200 dark:bg-black/50 border-2 border-gray-300 dark:border-white/10 p-5 text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white rounded-2xl outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer"
    >
      {options.map((o: any) => <option key={o} value={o} className="bg-white dark:bg-[#111]">{o}</option>)}
    </select>
  </div>
);
