import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { Users, Search, Plus, UserPlus, Edit, Trash2, FileScan, Calendar, Phone, ArrowRight, X } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', age: 65, gender: 'Female', contact: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/patients', { params: search ? { search } : {} });
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setError("Failed to fetch patient records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/patients', formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', age: 65, gender: 'Female', contact: '' });
      fetchPatients();
    } catch (err) {
      alert("Failed to create patient record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      await api.put(`/patients/${selectedPatient._id || selectedPatient.id}`, formData);
      setIsEditModalOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      alert("Failed to update patient record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    try {
      await api.delete(`/patients/${selectedPatient._id || selectedPatient.id}`);
      fetchPatients();
    } catch (err) {
      alert("Failed to delete patient record.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Patient Records Directory
          </h1>
          <p className="text-sm text-slate-400">Manage patient cohort records & associated MRI longitudinal scans</p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', age: 65, gender: 'Female', contact: '' });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-100 focus:outline-none placeholder-slate-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-200">
            Clear
          </button>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Fetching patient cohort registry..." />
      ) : error ? (
        <ErrorState title="Error Loading Patients" message={error} onRetry={fetchPatients} />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No Patients Found"
          message="There are no patient records matching your criteria."
          actionText="Register Patient"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((pat) => {
            const patId = pat._id || pat.id;
            return (
              <div
                key={patId}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {pat.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">ID: {patId}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                      {pat.gender}, {pat.age} yrs
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    {pat.contact && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{pat.contact}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Created {new Date(pat.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(pat);
                        setFormData({ name: pat.name, age: pat.age, gender: pat.gender, contact: pat.contact || '' });
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Edit Patient"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPatient(pat);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Delete Patient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/patients/${patId}`}
                    className="text-xs font-medium text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    View History & Scans <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-slate-100">
              {isEditModalOpen ? 'Edit Patient Record' : 'Register New Patient'}
            </h3>

            <form onSubmit={isEditModalOpen ? handleUpdatePatient : handleCreatePatient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Eleanor Vance"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Age (Years)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Contact Information</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="+1 (555) 019-2831"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm shadow-md shadow-cyan-600/20"
                >
                  {submitting ? 'Saving...' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePatient}
        title="Delete Patient Record?"
        message={`Are you sure you want to remove ${selectedPatient?.name}? This action cannot be undone.`}
        confirmText="Delete Record"
        isDanger={true}
      />
    </div>
  );
};

export default Patients;
