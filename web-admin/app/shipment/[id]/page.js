'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getShipping, getCargo, getProof, proofPhotoUrl, isAuthed,
  getDrivers, getVehicles, assignDriver, assignVehicle, cancelShipment,
} from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';

const STEPS = ['CREATED', 'ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
const STEP_LABEL = {
  CREATED: 'Order created', ASSIGNED: 'Driver assigned', PICKUP_IN_PROGRESS: 'Heading to pickup',
  PICKED_UP: 'Cargo picked up', IN_TRANSIT: 'On the way', DELIVERED: 'Delivered',
};
const CANCELLABLE = ['CREATED', 'ASSIGNED'];

function Row({ k, v }) {
  return <div className="row"><span className="k">{k}</span><span className="v">{v ?? '—'}</span></div>;
}

export default function ShipmentDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [s, setS] = useState(null);
  const [cargo, setCargo] = useState([]);
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // admin action state
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driverSel, setDriverSel] = useState('');
  const [vehicleSel, setVehicleSel] = useState('');
  const [busy, setBusy] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const ship = await getShipping(id);
      setS(ship);
      setCargo(await getCargo(id).catch(() => []));
      setProof(ship.shippingStatus === 'DELIVERED' ? await getProof(id).catch(() => null) : null);
    } catch (e) {
      setErr(e.message); if (e.message === 'Session expired') router.replace('/');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!isAuthed()) { router.replace('/'); return; }
    load();
    getDrivers().then(setDrivers).catch(() => {});
    getVehicles().then(setVehicles).catch(() => {});
  }, [load, router]);

  const runAction = async (label, fn) => {
    setBusy(label); setActionMsg(''); setErr('');
    try {
      await fn();
      await load();
      setActionMsg('✓ ' + label + ' done');
    } catch (e) {
      setErr(e.message || (label + ' failed'));
    } finally {
      setBusy('');
    }
  };

  if (loading) return <div className="center">Loading…</div>;
  if (err && !s) return <div className="container"><div className="err">{err}</div></div>;
  if (!s) return <div className="center">Not found</div>;

  const idx = STEPS.indexOf(s.shippingStatus);
  const terminalBad = s.shippingStatus === 'CANCELLED' || s.shippingStatus === 'FAILED';
  const isTerminal = ['DELIVERED', 'CANCELLED', 'FAILED'].includes(s.shippingStatus);
  const lat = Number(s.trackingLatitude) || 41.6938;
  const lon = Number(s.trackingLongitude) || 44.8015;
  const dd = 0.02;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - dd}%2C${lat - dd}%2C${lon + dd}%2C${lat + dd}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div>
      <div className="topbar">
        <h1>🚛 ATOB — Control Tower</h1>
        <div className="right"><span>Shipment #{s.id?.slice(0, 8)}</span></div>
      </div>

      <div className="container">
        <span className="back" onClick={() => router.push('/dashboard')}>‹ Back to dashboard</span>

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>#{s.id?.slice(0, 8)}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{s.transportType}</div>
          </div>
          <StatusBadge status={s.shippingStatus} />
        </div>

        {/* Admin actions */}
        {!isTerminal && (
          <div className="card" style={{ border: '1.5px solid #e3f0ff' }}>
            <h3>⚙️ Admin actions</h3>
            {actionMsg && <div style={{ color: '#2e7d32', fontSize: 13, marginBottom: 10 }}>{actionMsg}</div>}
            {err && <div className="err">{err}</div>}
            <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="k" style={{ fontSize: 12 }}>Assign driver</label>
                <select className="field" value={driverSel} onChange={(e) => setDriverSel(e.target.value)} style={{ marginTop: 4 }}>
                  <option value="">— select driver —</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.firstName} {d.lastName || ''} ({d.email})</option>
                  ))}
                </select>
                <button className="btn-primary" disabled={!driverSel || busy} style={{ marginTop: 8 }}
                        onClick={() => runAction('Assign driver', () => assignDriver(s.id, driverSel))}>
                  {busy === 'Assign driver' ? 'Assigning…' : 'Assign driver'}
                </button>
              </div>
              <div>
                <label className="k" style={{ fontSize: 12 }}>Assign vehicle</label>
                <select className="field" value={vehicleSel} onChange={(e) => setVehicleSel(e.target.value)} style={{ marginTop: 4 }}>
                  <option value="">— select vehicle —</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.vehicleType} · {v.plateNumber}</option>
                  ))}
                </select>
                <button className="btn-primary" disabled={!vehicleSel || busy} style={{ marginTop: 8 }}
                        onClick={() => runAction('Assign vehicle', () => assignVehicle(s.id, vehicleSel))}>
                  {busy === 'Assign vehicle' ? 'Assigning…' : 'Assign vehicle'}
                </button>
              </div>
            </div>
            {CANCELLABLE.includes(s.shippingStatus) && (
              <button
                onClick={() => runAction('Cancel', () => cancelShipment(s.id))}
                disabled={busy}
                style={{ marginTop: 14, background: '#fff', color: '#c62828', border: '1.5px solid #f0c0c0', borderRadius: 10, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                {busy === 'Cancel' ? 'Cancelling…' : 'Cancel shipment'}
              </button>
            )}
          </div>
        )}

        <div className="grid2">
          <div>
            <div className="card">
              <h3>Status</h3>
              {terminalBad ? (
                <div className="err">{s.shippingStatus === 'CANCELLED' ? 'Order cancelled' : 'Delivery failed'}</div>
              ) : (
                STEPS.map((step, i) => (
                  <div className="timeline-step" key={step}>
                    <div className={`dot ${idx >= i ? 'done' : ''}`} />
                    <span className={`tl-label ${idx > i ? 'done' : ''} ${idx === i ? 'active' : ''}`}>{STEP_LABEL[step]}</span>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <h3>Route</h3>
              <Row k="From" v={s.fromCity ? `${s.fromCity}${s.fromAddress ? ', ' + s.fromAddress : ''}` : '—'} />
              <Row k="To" v={s.toCity ? `${s.toCity}${s.toAddress ? ', ' + s.toAddress : ''}` : '—'} />
              {s.deliveryEndAt && <Row k="Delivery date" v={s.deliveryEndAt} />}
            </div>

            <div className="card">
              <h3>Driver &amp; Vehicle</h3>
              <Row k="Driver" v={s.driverFirstName ? `${s.driverFirstName} ${s.driverLastName || ''}` : 'unassigned'} />
              <Row k="Vehicle" v={s.vehiclePlateNumber ? `${s.vehicleType || ''} · ${s.vehiclePlateNumber}` : '—'} />
            </div>

            {cargo.length > 0 && (
              <div className="card">
                <h3>Cargo</h3>
                {cargo.map((c) => (
                  <Row key={c.id} k={c.name} v={`${c.cargoType || ''}${c.weightKg ? ' · ' + c.weightKg + 'kg' : ''}${c.quantity ? ' · x' + c.quantity : ''}`} />
                ))}
              </div>
            )}

            {proof && (
              <div className="card">
                <h3>✅ Proof of Delivery</h3>
                <Row k="Received by" v={proof.receiverName} />
                {proof.deliveredAt && <Row k="Delivered at" v={String(proof.deliveredAt).slice(0, 16).replace('T', ' ')} />}
                {proof.notes && <Row k="Notes" v={proof.notes} />}
                {proof.hasPhoto && <img className="proof-photo" src={proofPhotoUrl(s.id)} alt="proof" />}
              </div>
            )}
          </div>

          <div className="card">
            <h3>Live location</h3>
            <iframe className="map-frame" src={mapUrl} title="map" />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>{lat.toFixed(5)}, {lon.toFixed(5)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
