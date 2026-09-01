import { requireAdmin, jsonResponse } from '../../_lib/auth.js';
import { newId, nowIso } from '../../_lib/db.js';

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
`;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const storeId = url.searchParams.get('store_id');

  const query = storeId
    ? env.DB.prepare(`${JOIN_SELECT} WHERE sv.store_id = ? ORDER BY sv.last_updated DESC`).bind(storeId)
    : env.DB.prepare(`${JOIN_SELECT} ORDER BY sv.last_updated DESC`);

  const { results } = await query.all();
  return jsonResponse(results);
}

export const onRequestPost = requireAdmin(async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  const { store_id, vendor_id } = body;
  if (!store_id || !vendor_id) {
    return jsonResponse({ error: 'store_id and vendor_id are required.' }, 400);
  }

  const existing = await env.DB.prepare(
    'SELECT id FROM store_vendors WHERE store_id = ? AND vendor_id = ?'
  )
    .bind(store_id, vendor_id)
    .first();
  if (existing) {
    return jsonResponse({ error: 'That vendor is already on this store\'s board.' }, 409);
  }

  const id = newId('sv');
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO store_vendors (id, store_id, vendor_id, status, notes, last_updated)
     VALUES (?, ?, ?, 'not-started', NULL, ?)`
  )
    .bind(id, store_id, vendor_id, now)
    .run();

  const row = await env.DB.prepare(`${JOIN_SELECT} WHERE sv.id = ?`).bind(id).first();
  return jsonResponse(row, 201);
});
