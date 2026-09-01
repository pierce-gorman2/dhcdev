import { requireAdmin, jsonResponse } from '../../_lib/auth.js';
import { newId, nowIso } from '../../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const storeId = url.searchParams.get('store_id');
  if (!storeId) return jsonResponse({ error: 'store_id is required.' }, 400);

  const { results } = await env.DB.prepare(
    'SELECT * FROM update_log WHERE store_id = ? ORDER BY created_at DESC LIMIT 200'
  )
    .bind(storeId)
    .all();
  return jsonResponse(results);
}

export const onRequestPost = requireAdmin(async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  const note = (body.note || '').trim();
  if (!body.store_id || !note) {
    return jsonResponse({ error: 'store_id and note are required.' }, 400);
  }

  const id = newId('log');
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO update_log (id, store_id, store_vendor_id, note, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, 'admin')`
  )
    .bind(id, body.store_id, body.store_vendor_id || null, note, now)
    .run();

  const row = await env.DB.prepare('SELECT * FROM update_log WHERE id = ?').bind(id).first();
  return jsonResponse(row, 201);
});
