import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Plus, Edit2, Trash2, X, Mail, Phone, Briefcase } from 'lucide-react';

const ProviderStaff = () => {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    services: []
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaffAndServices = async () => {
    try {
      const [staffRes, servicesRes] = await Promise.all([
        api.get('/staff'),
        api.get('/services').catch(() => ({ data: { data: [] } }))
      ]);
      setStaff(staffRes.data.data || []);
      setServices(servicesRes.data.data?.filter(s => s.active !== false) || []);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndServices();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      services: []
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || '',
      services: member.services?.map(s => typeof s === 'object' ? s._id : s) || []
    });
    setShowModal(true);
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const exists = prev.services.includes(serviceId);
      return {
        ...prev,
        services: exists 
          ? prev.services.filter(id => id !== serviceId)
          : [...prev.services, serviceId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role || undefined,
        services: formData.services
      };

      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, payload);
      } else {
        await api.post('/staff', payload);
      }

      setShowModal(false);
      fetchStaffAndServices();
    } catch (err) {
      alert(err.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate staff member "${name}"?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaffAndServices();
    } catch (err) {
      alert(err.message || 'Failed to deactivate staff member');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-gray-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const activeStaff = staff.filter(m => m.active !== false);

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage practitioners, staff roles, and service assignments.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Staff Member
        </button>
      </div>

      {activeStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeStaff.map(member => (
            <div key={member._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-400 transition">
              <div>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="h-12 w-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-lg text-gray-900 truncate">{member.name}</h3>
                    <p className="text-xs font-bold text-primary-700 uppercase tracking-wider">{member.role || 'Staff Member'}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 my-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {member.email && (
                    <p className="flex items-center truncate">
                      <Mail className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" /> {member.email}
                    </p>
                  )}
                  {member.phone && (
                    <p className="flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" /> {member.phone}
                    </p>
                  )}
                  <p className="flex items-center font-medium text-gray-700">
                    <Briefcase className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" /> 
                    {member.services?.length || 0} Assigned Services
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => openEditModal(member)}
                  className="inline-flex items-center text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(member._id, member.name)}
                  className="inline-flex items-center text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No staff members configured</h3>
          <p className="text-gray-500 text-sm mb-6">Add staff members to assign them to queues and services.</p>
          <button 
            onClick={openAddModal}
            className="inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add First Staff Member
          </button>
        </div>
      )}

      {/* STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Role / Specialization
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Lead Physician / Senior Stylist"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    placeholder="jane@slotly.demo"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Phone</label>
                  <input 
                    type="text"
                    placeholder="555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {services.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Assigned Services
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2.5 bg-gray-50/50">
                    {services.map(s => {
                      const isChecked = formData.services.includes(s._id);
                      return (
                        <label key={s._id} className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleServiceToggle(s._id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span>{s.name} ({s.expectedDurationMinutes}m)</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderStaff;
