const COLORS = {
  CREATED:            { bg: '#f3e5f5', fg: '#7b1fa2' },
  ASSIGNED:           { bg: '#e3f2fd', fg: '#1565c0' },
  PICKUP_IN_PROGRESS: { bg: '#fff9c4', fg: '#f57f17' },
  PICKED_UP:          { bg: '#fff3e0', fg: '#e65100' },
  IN_TRANSIT:         { bg: '#e8eaf6', fg: '#283593' },
  DELIVERED:          { bg: '#e8f5e9', fg: '#2e7d32' },
  CANCELLED:          { bg: '#ffebee', fg: '#c62828' },
  FAILED:             { bg: '#efebe9', fg: '#4e342e' },
};
const LABELS = {
  CREATED: 'Created', ASSIGNED: 'Assigned', PICKUP_IN_PROGRESS: 'Pickup →',
  PICKED_UP: 'Picked Up', IN_TRANSIT: 'In Transit', DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled', FAILED: 'Failed',
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || { bg: '#eee', fg: '#666' };
  return (
    <span className="badge" style={{ background: c.bg, color: c.fg }}>
      {LABELS[status] || status}
    </span>
  );
}
