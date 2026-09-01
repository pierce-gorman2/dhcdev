import { requireAdmin, jsonResponse } from '../../_lib/auth.js';
import { newId, nowIso } from '../../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const storeId = url.searchParams.get('store_id');
  if (!storeId) return jsonResponse({ error: 'store_id is required.' }, 400);

  const { results } = await env.DB.prepare(
    'SELECT * FROM milestones WHERE store_id = ? ORDER BY date ASC'
  )
    .bind(storeId)
    .all();
  return jsonResponse(results);
}

export const onRequestPost = requireAdmin(async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  const title = (body.title || '').trim();
  if (!body.store_id || !title || !body.date) {
    return jsonResponse({ error: 'store_id, title, and date are required.' }, 400);
  }

  const id = newId('milestone');
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO milestones (id, store_id, title, date, completed, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`
  )
    .bind(id, body.store_id, title, body.date, now)
    .run();

  const row = await env.DB.prepare('SELECT * FROM milestones WHERE id = ?').bind(id).first();
  return jsonResponse(row, 201);
});
