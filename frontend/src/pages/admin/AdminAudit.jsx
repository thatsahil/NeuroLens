import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, AlertOctagon } from 'lucide-react';
import api from '../../services/api';

export default function AdminAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit')
      .then(res => {
        setAudits(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security & Administrative Audit Log</h2>
        <p className="text-sm text-[var(--nl-muted-forest)] mt-1">
          Append-only verifiable record of authentications, model registrations, and round configuration events.
        </p>
      </div>

      <div className="nl-card bg-white border border-[var(--nl-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-[var(--nl-border)] uppercase text-[10px] font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3">Timestamp (UTC)</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Client Scope</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nl-border)]">
              {audits.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3.5 font-mono text-gray-500">{new Date(a.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3.5 font-mono font-semibold text-gray-900">{a.action}</td>
                  <td className="px-6 py-3.5">
                    <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {a.role || 'system'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono">{a.client_id || 'Global'}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      a.status === 'success' ? 'badge-mint' :
                      a.status === 'failure' ? 'badge-coral' : 'badge-sage'
                    }`}>
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
