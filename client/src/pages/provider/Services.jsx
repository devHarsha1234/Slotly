import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Clock, DollarSign, Briefcase, X } from 'lucide-react';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expectedDurationMinutes: 20,
    price: 50
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      expectedDurationMinutes: 20,
      price: 50
    });
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      expectedDurationMinutes: service.expectedDurationMinutes,
      price: service.price
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        expectedDurationMinutes: parseInt(formData.expectedDurationMinutes),
        price: parseFloat(formData.price)
      };

      if (editingService) {
        await api.put(`/services/${editingService._id}`, payload);
      } else {
        await api.post('/services', payload);
      }

      setShowModal(false);
      fetchServices();
    } catch (err) {
      alert(err.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate "${name}"?`)) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert(err.message || 'Failed to deactivate service');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Services Management</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your offered services, expected durations, and pricing.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Service
        </button>
      </div>

      {services.filter((s) => s.active !== false).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services
            .filter((s) => s.active !== false)
            .map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-400 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-extrabold text-xl text-gray-900">{service.name}</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-500 mb-4">{service.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm font-bold text-gray-700 my-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="flex items-center text-primary-700">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {service.expectedDurationMinutes} min
                    </span>
                    <span className="flex items-center text-gray-900">
                      <DollarSign className="w-4 h-4 mr-0.5" />
                      {service.price}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(service)}
                    className="inline-flex items-center text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id, service.name)}
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
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No services registered yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first service to start accepting customer bookings.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add First Service
          </button>
        </div>
      )}

      {/* SERVICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Consultation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Short description of this service"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Expected Duration (Min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.expectedDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, expectedDurationMinutes: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

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
                  {submitting ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderServices;
