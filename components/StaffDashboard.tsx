
import React, { useState } from 'react';
import { MenuItem, Reservation } from '../types';
import { 
  LayoutDashboard, 
  Utensils, 
  CalendarDays, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3, 
  CreditCard,
  Clock,
  CheckSquare,
  Users2,
  Package,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface Props {
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

interface Task {
  id: string;
  title: string;
  status: 'done' | 'pending' | 'urgent';
  category: string;
}

export const StaffDashboard: React.FC<Props> = ({ menu, setMenu }) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Champagner-Lieferung prüfen', status: 'done', category: 'Logistik' },
    { id: 't2', title: 'Tischdeko Gold/Blau Aufbau', status: 'pending', category: 'Deko' },
    { id: 't3', title: 'Live-Band Soundcheck 17:00', status: 'urgent', category: 'Entertainment' },
    { id: 't4', title: 'Sicherheitsbriefing Feuerwerk', status: 'pending', category: 'Sicherheit' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };

  const toggleAvailability = (id: string) => {
    setMenu(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const mockReservations: Reservation[] = [
    { id: 'r1', name: 'Ziegler, Marc', date: '2025-12-31', time: '19:30', guests: 6, notes: 'Silvester Gala Menu' },
    { id: 'r2', name: 'Rossi, Giulia', date: '2025-12-31', time: '21:00', guests: 2, notes: 'Gute Sicht auf das Feuerwerk' },
  ];

  const financialStats = {
    dailyRevenue: 4280.50,
    averagePerGuest: 84.00,
    openTables: 4,
    totalGuests: 124
  };

  const hourlyRevenue = [
    { hour: '17:00', amount: 450 },
    { hour: '18:00', amount: 820 },
    { hour: '19:00', amount: 1250 },
    { hour: '20:00', amount: 1100 },
    { hour: '21:00', amount: 660 },
  ];

  const inventory = [
    { name: 'Hummer (frisch)', stock: 12, unit: 'Stk', level: 'warning' },
    { name: 'Veuve Clicquot', stock: 48, unit: 'Fl', level: 'good' },
    { name: 'Trüffel (schwarz)', stock: 250, unit: 'g', level: 'low' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold brand-font text-red-500 flex items-center gap-3 text-shadow-glow">
            Gala Management <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-sans tracking-normal">Project Manager</span>
          </h2>
          <p className="text-red-400/70">Operationeller Überblick • Silvester Nacht</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-900/40 backdrop-blur-sm p-4 rounded-2xl border border-red-500/20 text-center min-w-[120px] shadow-lg">
            <span className="block text-2xl font-bold text-red-500">{financialStats.totalGuests}</span>
            <span className="text-[10px] uppercase tracking-widest text-red-400">Erwartete Gäste</span>
          </div>
          <div className="bg-blue-900/40 backdrop-blur-sm p-4 rounded-2xl border border-yellow-500/20 text-center min-w-[140px] shadow-lg shadow-yellow-500/5">
            <span className="block text-2xl font-bold text-yellow-500">CHF {financialStats.dailyRevenue.toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-widest text-yellow-600">Umsatz Heute</span>
          </div>
        </div>
      </div>

      {/* --- Project Manager Overview --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Tracker */}
        <div className="lg:col-span-2 bg-blue-950/40 backdrop-blur-md p-8 rounded-3xl border border-red-500/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold brand-font text-red-500 flex items-center gap-2">
              <CheckSquare size={20} /> Gala Checkliste
            </h3>
            <div className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold">
              {tasks.filter(t => t.status === 'done').length}/{tasks.length} Erledigt
            </div>
          </div>
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  task.status === 'done' 
                    ? 'bg-green-500/5 border-green-500/20 opacity-60' 
                    : task.status === 'urgent'
                    ? 'bg-red-500/10 border-red-500/40 animate-pulse'
                    : 'bg-blue-900/30 border-red-500/10 hover:border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-red-500/40'}`}>
                    {task.status === 'done' && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${task.status === 'done' ? 'line-through text-green-500' : 'text-white'}`}>{task.title}</p>
                    <span className="text-[10px] uppercase tracking-widest text-red-400/50 font-black">{task.category}</span>
                  </div>
                </div>
                {task.status === 'urgent' && <AlertTriangle size={16} className="text-red-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Monitor */}
        <div className="bg-blue-950/40 backdrop-blur-md p-8 rounded-3xl border border-yellow-500/10 shadow-xl">
           <h3 className="text-xl font-bold brand-font text-yellow-500 mb-6 flex items-center gap-2">
             <Package size={20} /> Kritische Ressourcen
           </h3>
           <div className="space-y-6">
              {inventory.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{item.name}</span>
                    <span className={item.level === 'low' ? 'text-red-500' : 'text-yellow-500'}>
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        item.level === 'low' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                        item.level === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${(item.stock / (idx === 0 ? 50 : 100)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-yellow-500/10">
                 <div className="flex items-center gap-3 text-red-400 p-3 bg-red-950/20 rounded-xl border border-red-500/10">
                    <Activity size={20} className="animate-pulse" />
                    <div className="text-[10px] font-bold leading-tight">
                       PERSONAL-STATUS: Alle Stationen besetzt. Küche auf Höchstlast.
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Umsatz-Sektion (Teil des Billing Admin Kontexts) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-blue-950/40 backdrop-blur-md p-8 rounded-3xl border border-yellow-500/10 shadow-xl">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold brand-font text-yellow-500 flex items-center gap-2">
                <BarChart3 size={20} /> Live Umsatzverlauf
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-yellow-500/60 font-bold uppercase tracking-widest">
                <Clock size={12} /> Letztes Update: Vor 2 Min.
              </div>
           </div>
           <div className="flex items-end gap-4 h-48 px-2">
              {hourlyRevenue.map((data, idx) => {
                const height = (data.amount / 1500) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative">
                      <div 
                        className="w-full bg-gradient-to-t from-yellow-700 to-yellow-500 rounded-t-lg transition-all duration-1000 group-hover:from-yellow-500 group-hover:to-white shadow-lg" 
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-yellow-400 text-[10px] px-2 py-1 rounded border border-yellow-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          CHF {data.amount}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-red-400/50 font-bold">{data.hour}</span>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="space-y-4">
           <div className="bg-blue-900/30 p-6 rounded-2xl border border-red-500/10 flex items-center gap-4">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-xl">
                 <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-[10px] text-red-400/60 uppercase font-black">Durchschnitt/Gast</span>
                <p className="text-xl font-bold text-red-500">CHF {financialStats.averagePerGuest.toFixed(2)}</p>
              </div>
           </div>
           <div className="bg-blue-900/30 p-6 rounded-2xl border border-red-500/10 flex items-center gap-4">
              <div className="p-3 bg-yellow-600/20 text-yellow-500 rounded-xl">
                 <CreditCard size={24} />
              </div>
              <div>
                <span className="text-[10px] text-yellow-600 uppercase font-black">Offene Rechnungen</span>
                <p className="text-xl font-bold text-yellow-500">{financialStats.openTables} Tische</p>
              </div>
           </div>
           <div className="bg-blue-900/30 p-6 rounded-2xl border border-red-500/10 flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
                 <Users size={24} />
              </div>
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-black">Auslastung</span>
                <p className="text-xl font-bold text-white">92% <span className="text-xs text-blue-400/60">(Ausgebucht)</span></p>
              </div>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-blue-950/40 backdrop-blur-md p-8 rounded-3xl border border-red-500/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold brand-font text-red-500 flex items-center gap-2">
              <Utensils size={20} /> Gala Karte
            </h3>
            <button className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition shadow-lg">
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {menu.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-blue-900/30 rounded-xl border border-red-500/10 group hover:border-red-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <img src={item.image} className="w-12 h-12 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div>
                    <h4 className="font-bold text-red-500 text-sm">{item.name}</h4>
                    <span className="text-xs text-red-400/60">CHF {item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleAvailability(item.id)}
                    className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                      item.available 
                        ? 'border-green-500/50 text-green-500 bg-green-500/10' 
                        : 'border-red-500/50 text-red-500 bg-red-500/10'
                    }`}
                  >
                    {item.available ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {item.available ? 'AKTIV' : 'AUSVERKAUFT'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-blue-950/40 backdrop-blur-md p-8 rounded-3xl border border-red-500/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold brand-font text-red-500 flex items-center gap-2">
              <CalendarDays size={20} /> Gala Reservationen
            </h3>
          </div>
          <div className="space-y-4">
            {mockReservations.map(res => (
              <div key={res.id} className="p-4 bg-blue-900/30 rounded-xl border border-red-500/10 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-red-500">{res.name}</h4>
                  <p className="text-xs text-red-400/60">{res.date} um {res.time} • {res.guests} Personen</p>
                  {res.notes && <p className="text-[10px] text-red-300 italic mt-1">"{res.notes}"</p>}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition">
                    <CheckCircle size={16} />
                  </button>
                  <button className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
