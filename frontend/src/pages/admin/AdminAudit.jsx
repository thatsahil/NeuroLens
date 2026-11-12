import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, AlertOctagon, Filter } from 'lucide-react';
import api from '../../services/api';

export default function AdminAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/audit')
      .then((res) => {
        setAudits(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold badge-teal">
            Append-Only
          </span>
          <span className="text-xs font-mono text-slate-500">Security & Diagnostics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Audit & Compliance Log
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Cryptographically recorded ledger of authentications, model registrations, and MRI analysis actions.
        </p>
      </div>

      <div className="apple-card bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Timestamp (UTC)</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Client Scope</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 font-mono text-slate-500">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">{a.action}</td>
                  <td className="px-6 py-3.5">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {a.role || 'system'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-700">{a.client_id || 'Global'}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.status === 'success'
                          ? 'badge-teal'
                          : a.status === 'failure'
                          ? 'badge-rose'
                          : 'badge-slate'
                      }`}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
