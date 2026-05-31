import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n';

const ORDER_COLORS = {
  Pending:        { bg: '#FFF8E1', text: '#F9A825' },
  Processing:     { bg: '#E1F5FE', text: '#0277BD' },
  WaitingCarrier: { bg: '#FBE9E7', text: '#E64A19' },
  Shipped:        { bg: '#F3E5F5', text: '#7B1FA2' },
  Delivered:      { bg: '#E8F5E9', text: '#2E7D32' },
  Cancelled:      { bg: '#FFEBEE', text: '#C62828' },
};

const SHIPPING_COLORS = {
  CREATED:            { bg: '#F3E5F5', text: '#7B1FA2' },
  ASSIGNED:           { bg: '#E3F2FD', text: '#1565C0' },
  PICKUP_IN_PROGRESS: { bg: '#FFF9C4', text: '#F57F17' },
  PICKED_UP:          { bg: '#FFF3E0', text: '#E65100' },
  IN_TRANSIT:         { bg: '#E8EAF6', text: '#283593' },
  DELIVERED:          { bg: '#E8F5E9', text: '#2E7D32' },
  CANCELLED:          { bg: '#FFEBEE', text: '#C62828' },
  FAILED:             { bg: '#EFEBE9', text: '#4E342E' },
};

const SHIPPING_LABELS = {
  CREATED:            'Created',
  ASSIGNED:           'Assigned',
  PICKUP_IN_PROGRESS: 'Pickup →',
  PICKED_UP:          'Picked Up',
  IN_TRANSIT:         'In Transit',
  DELIVERED:          'Delivered',
  CANCELLED:          'Cancelled',
  FAILED:             'Failed',
};

export default function StatusBadge({ status, type = 'order' }) {
  const { t } = useTranslation();

  let colors, label;

  if (type === 'shipping') {
    colors = SHIPPING_COLORS[status] ?? { bg: '#F0F0F0', text: '#666' };
    label  = SHIPPING_LABELS[status] ?? status;
  } else if (type === 'carrier') {
    // Legacy — map old CarrierStatus values to shipping colors
    const mapped = { Assigned: 'ASSIGNED', PickedUp: 'PICKED_UP', Delivered: 'DELIVERED' };
    const key = mapped[status] ?? status;
    colors = SHIPPING_COLORS[key] ?? { bg: '#F0F0F0', text: '#666' };
    label  = t(`carrierStatus.${status}`) || SHIPPING_LABELS[key] || status;
  } else {
    colors = ORDER_COLORS[status] ?? { bg: '#F0F0F0', text: '#666' };
    label  = t(`status.${status}`) || status;
  }

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  label: { fontSize: 11, fontWeight: '700' },
});
