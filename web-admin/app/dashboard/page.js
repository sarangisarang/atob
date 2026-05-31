'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getShippings, getStoredUser, isAuthed, logout } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

const ACTIVE = ['ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT'];

export default function Dashboard() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const user = getStoredUser();

  useEffect(() => {
    if (!isAuthed()) { router.replace('/'); return; }
    getShippings()
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch((e) => { setErr(e.message); if (e.message === 'Session expired') router.replace('/'); })
      .finally(() => setLoading(false));
  }, [router]);

  const doLogout = () => { logout(); router.replace('/'); };

  const stats = {
    total: rows.length,
    active: rows.filter((r) => ACTIVE.includes(r.shippingStatus)).length,
    delivered: rows.filter((r) => r.shippingStatus === 'DELIVERED').length,
    created: rows.filter((r) => r.shippingStatus === 'CREATED').length,
  };

  return (
    <div>
      <div className="topbar">
        <h1>🚛 ATOB — Control Tower</h1>
        <div className="right">
          <span>{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'admin'} · ADMIN</span>
          <button className="btn-logout" onClick={doLogout}>Logout</button>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="center">Loading shipments…</div>
        ) : err ? (
          <div className="err">{err}</div>
        ) : (
          <>
            <div className="stats">
              <div className="stat"><div className="n">{stats.total}</div><div className="l">Total shipments</div></div>
              <div className="stat"><div className="n">{stats.active}</div><div className="l">In progress</div></div>
              <div className="stat"><div className="n">{stats.created}</div><div className="l">Awaiting assign</div></div>
              <div className="stat"><div className="n">{stats.delivered}</div><div className="l">Delivered</div></div>
            </div>

            <table>
              <thead>
                <tr><th>ID</th><th>Status</th><th>Route</th><th>Driver</th><th>Vehicle</th><th>Type</th></tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 28 }}>No shipments</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="clickable" onClick={() => router.push(`/shipment/${r.id}`)}>
                    <td>#{r.id?.slice(0, 8)}</td>
                    <td><StatusBadge status={r.shippingStatus} /></td>
                    <td className="route">{r.fromCity || '—'} → {r.toCity || '—'}</td>
                    <td>{r.driverFirstName ? `${r.driverFirstName} ${r.driverLastName || ''}` : <span style={{ color: '#9ca3af' }}>unassigned</span>}</td>
                    <td>{r.vehiclePlateNumber || '—'}</td>
                    <td>{r.transportType || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
