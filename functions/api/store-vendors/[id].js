import { requireAdmin, jsonResponse } from '../../_lib/auth.js';

const EDITABLE_FIELDS = [
  'status',
  'notes',
  'contact_name_override',
  'phone_override',
  'email_override',
];

const JOIN_SELECT = `
  SELECT
    sv.id, sv.store_id, sv.vendor_id, sv.status, sv.notes,
    sv.contact_name_override, sv.phone_override, sv.email_override, sv.last_updated,
    v.company_name, v.industry,
    v.contact_name AS vendor_contact_name,
    v.phone AS vendor_phone,
    v.email AS vendor_email
  FROM store_vendors sv
  JOIN vendors v ON v.id = sv.vendor_id
  WHERE sv.id = ?
`;

export const onRequestPatch = requireAdmin(async ({ request, env, params }) => {
  const body = await request.json().catch(() => ({}));
  const fields = EDITABLE_FIELDS.filter((f) => f in body);
  if (fields.length === 0) return jsonResponse({ error: 'No editable fields provided.' }, 400);

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => body[f]);
  await env.DB.prepare(`UPDATE store_vendors SET ${setClause}, last_updated = datetime('now') WHERE id = ?`)
    .bind(...values, params.id)
    .run();

  const row = await env.DB.prepare(JOIN_SELECT).bind(params.id).first();
  if (!row) return jsonResponse({ error: 'Not found.' }, 404);
  return jsonResponse(row);
});

export const onRequestDelete = requireAdmin(async ({ env, params }) => {
  await env.DB.prepare('DELETE FROM store_vendors WHERE id = ?').bind(params.id).run();
  return jsonResponse({ ok: true });
});
