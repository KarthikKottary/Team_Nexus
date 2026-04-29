import React, { useState, useEffect } from 'react';
import { Users, Phone, Trash2, Plus, Loader2 } from 'lucide-react';
import { apiGetVolunteers, apiCreateVolunteer, apiDeleteVolunteer } from '../../api/client';

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchVolunteers = async () => {
    try {
      const data = await apiGetVolunteers();
      setVolunteers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setAdding(true);
    try {
      await apiCreateVolunteer({ name, phone });
      setName('');
      setPhone('');
      fetchVolunteers();
    } catch (err) {
      alert("Failed to add volunteer");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this volunteer?")) return;
    try {
      await apiDeleteVolunteer(id);
      fetchVolunteers();
    } catch (err) {
      alert("Failed to delete volunteer");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" /> Volunteers Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage on-site volunteers and helpers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {volunteers.map(v => (
            <div key={v._id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex justify-between items-center hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Phone className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-200">{v.name}</h3>
                  <p className="text-sm font-mono text-gray-500">{v.phone}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(v._id)} className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {volunteers.length === 0 && (
            <div className="text-center py-12 bg-gray-900/30 border border-gray-800 border-dashed rounded-xl">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No volunteers assigned.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-6 h-fit sticky top-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Add Volunteer</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1">NAME / ROLE</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alice (Logistics)"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1">PHONE NUMBER</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>
            <button 
              disabled={adding}
              type="submit" 
              className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-orange-400 rounded-lg text-sm font-semibold transition-all flex justify-center items-center gap-2"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add to Directory
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
