import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Save, Clock, Info, Tag, ShieldAlert, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // Para o Hover/Detalhes

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Gira',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '20:00',
    description: '',
    observations: '' // Novo campo: Materiais e Vestimentas
  });

  const typeColors = {
    'Gira': 'border-red-700 bg-red-900/20 text-red-400',
    'Festa': 'border-amber-500 bg-amber-900/20 text-amber-400',
    'Amaci': 'border-white bg-slate-100/10 text-slate-100',
    'Reunião': 'border-blue-600 bg-blue-900/20 text-blue-400',
    'Outros': 'border-slate-500 bg-slate-800/20 text-slate-400'
  };

  useEffect(() => { loadEvents(); }, [currentMonth]);

  async function loadEvents() {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (err) {
      console.error("Erro ao carregar agenda", err);
    } finally { setLoading(false); }
  }

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', newEvent);
      setIsModalOpen(false);
      setNewEvent({ title: '', type: 'Gira', date: format(new Date(), 'yyyy-MM-dd'), time: '20:00', description: '', observations: '' });
      loadEvents();
    } catch (err) { alert("Erro ao salvar evento no banco."); }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Agenda de Giras</h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">TDU - 7 Caveiras</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"><ChevronLeft size={20}/></button>
            <span className="px-4 font-black text-white uppercase text-xs min-w-[140px] text-center tracking-widest italic">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"><ChevronRight size={20}/></button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition shadow-lg shadow-red-900/40 uppercase text-[10px] tracking-widest active:scale-95">
            <Plus size={18} /> Novo Evento
          </button>
        </div>
      </div>

      {/* Grid Calendário */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="grid grid-cols-7 border-b border-slate-800 bg-black/40 font-black text-slate-500 uppercase text-[10px] tracking-widest">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="p-4 text-center">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dayEvents = events.filter(ev => isSameDay(new Date(ev.eventDate), day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div key={i} className={`min-h-[140px] border-b border-r border-slate-800/40 p-3 hover:bg-slate-800/30 transition-all relative ${!isCurrentMonth ? 'opacity-10' : ''} ${isToday ? 'bg-red-900/5' : ''}`}>
                <span className={`text-sm font-black ${isToday ? 'text-red-500 underline' : 'text-slate-400'}`}>{format(day, 'd')}</span>
                
                <div className="mt-2 space-y-1">
                  {dayEvents.map((ev, idx) => (
                    <div 
                      key={idx} 
                      onMouseEnter={() => setSelectedEvent(ev)}
                      onMouseLeave={() => setSelectedEvent(null)}
                      className={`p-1.5 rounded-lg border-l-4 text-[9px] font-black uppercase shadow-md truncate cursor-help transition-transform hover:scale-105 ${typeColors[ev.type] || typeColors['Outros']}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOOLTIP / MODAL DE DETALHES (HOVER) */}
      {selectedEvent && (
        <div className="fixed bottom-10 right-10 z-50 w-80 bg-slate-900 border-2 border-red-700 rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${typeColors[selectedEvent.type]}`}>
                {selectedEvent.type}
              </span>
              <Clock size={16} className="text-slate-600" />
            </div>
            
            <div>
              <h3 className="text-white font-black uppercase italic tracking-tighter text-lg">{selectedEvent.title}</h3>
              <p className="text-red-500 font-bold text-[10px] uppercase">{selectedEvent.startTime}h - TDU 7 Caveiras</p>
            </div>

            {selectedEvent.observations && (
              <div className="bg-black/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-red-500">
                  <ShieldAlert size={14} />
                  <span className="text-[9px] font-black uppercase">Materiais e Vestimenta</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed font-medium italic">
                  "{selectedEvent.observations}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <h2 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2 italic">
                <AlertCircle size={18} className="text-red-600" /> Agendar Nova Gira
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Título do Evento</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-red-600 outline-none transition-all" placeholder="Ex: Gira de Pretos Velhos" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Tipo</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-red-600 outline-none appearance-none font-bold" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                    <option value="Gira">Gira</option>
                    <option value="Festa">Festa</option>
                    <option value="Amaci">Amaci</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Data</label>
                  <input required type="date" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-red-600 outline-none" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Início</label>
                  <input required type="time" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-red-600 outline-none" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest text-red-500">Observações Operacionais (Materiais/Roupas)</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-red-600 outline-none h-28 resize-none text-xs leading-relaxed" 
                  placeholder="Ex: Vestimenta Branca. Trazer velas pretas e vermelhas e elementos de Exu."
                  value={newEvent.observations}
                  onChange={e => setNewEvent({...newEvent, observations: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-red-700 hover:bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-900/40 active:scale-95">
                <Save size={18} /> Confirmar Gira
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}