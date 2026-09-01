export const STATUS_ORDER = ['not-started', 'in-progress', 'scheduled', 'blocked', 'complete'];

export const STATUS_META = {
  'not-started': { label: 'Not Started', dot: 'bg-ink-400' },
  'in-progress': { label: 'In Progress', dot: 'bg-amber-500' },
  scheduled: { label: 'Scheduled', dot: 'bg-blue-500' },
  blocked: { label: 'Blocked', dot: 'bg-red-600' },
  complete: { label: 'Complete', dot: 'bg-emerald-500' },
};

export const STORE_STATUS_META = {
  'pre-buildout': { label: 'Pre-Buildout', dot: 'bg-ink-400' },
  'in-progress': { label: 'In Progress', dot: 'bg-amber-500' },
  'final-prep': { label: 'Final Prep', dot: 'bg-blue-500' },
  open: { label: 'Open', dot: 'bg-emerald-500' },
};

export function effectiveContact(sv) {
  return {
    contactName: sv.contact_name_override || sv.vendor_contact_name || '',
    phone: sv.phone_override || sv.vendor_phone || '',
    email: sv.email_override || sv.vendor_email || '',
  };
}
