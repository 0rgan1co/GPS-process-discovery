
import React, { useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Lector';
  avatar: string;
}

interface Props {
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

const Collaborators: React.FC<Props> = ({ onNotify }) => {
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Jorge Roldan', email: 'roldanj@gps.ai', role: 'Admin', avatar: 'JR' },
    { id: '2', name: 'Ana Smith', email: 'asmith@business.com', role: 'Editor', avatar: 'AS' },
  ]);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Lector'>('Lector');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.includes('@')) {
      onNotify('Correo electrónico inválido', 'error');
      return;
    }
    
    setIsSending(true);
    // Simulación de envío de invitación
    setTimeout(() => {
      const newMember: Member = {
        id: Math.random().toString(36).substr(2, 9),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteEmail.substring(0, 2).toUpperCase()
      };
      
      setMembers([...members, newMember]);
      setInviteEmail('');
      setIsSending(false);
      onNotify(`Invitación enviada a ${inviteEmail}`, 'success');
    }, 1000);
  };

  return (
    <div className="flex h-full gap-8 animate-in fade-in duration-700">
      {/* Lista de Colaboradores */}
      <div className="flex-[2] bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm overflow-hidden flex flex-col">
        <div className="mb-8">
          <h2 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.3em] mb-2">MIEMBROS DEL EQUIPO</h2>
          <p className="text-slate-400 text-[11px] font-bold">Gestiona quién tiene acceso a este análisis de proceso.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar">
          {members.map((member) => (
            <div key={member.id} className="group flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-[#5c56f1]/20 hover:shadow-lg transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5c56f1] to-blue-400 flex items-center justify-center text-white font-black text-xs shadow-md">
                  {member.avatar}
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-slate-900 tracking-tight">{member.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400">{member.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  member.role === 'Admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                  member.role === 'Editor' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {member.role}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de Invitación */}
      <div className="flex-1 bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#5c56f1]/5 blur-[60px] rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10 mb-8">
          <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-2">AÑADIR COLABORADOR</h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">Invita a un nuevo estratega para potenciar el análisis.</p>
        </div>

        <form onSubmit={handleInvite} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
            <input 
              type="email" 
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="ejemplo@empresa.com"
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-[#5c56f1]/40 transition text-[11px] font-bold text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nivel de Permisos</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Admin', 'Editor', 'Lector'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setInviteRole(role)}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    inviteRole === role 
                      ? 'bg-[#5c56f1] text-white border-[#5c56f1] shadow-lg shadow-indigo-200' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSending}
            className={`w-full py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-lg transition-all ${
              isSending ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#5c56f1] text-white hover:bg-[#4f46e5] active:scale-95'
            }`}
          >
            {isSending ? 'ENVIANDO...' : 'ENVIAR INVITACIÓN'}
          </button>
        </form>

        <div className="mt-auto pt-8 border-t border-slate-50 text-center">
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
            Las invitaciones expiran en 7 días.<br/>Solo correos verificados pueden acceder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Collaborators;
