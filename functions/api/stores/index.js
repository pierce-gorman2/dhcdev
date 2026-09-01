import { requireAdmin, jsonResponse } from '../../_lib/auth.js';
import { newId, nowIso } from '../../_lib/db.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM stores ORDER BY target_open_date IS NULL, target_open_date ASC, name ASC'
  ).all();
  return jsonResponse(results);
}

export const onRequestPost = requireAdmin(async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  const name = (body.name || '').trim();
  if (!name) return jsonResponse({ error: 'Store name is required.' }, 400);

  const id = newId('store');
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO stores (id, name, address, target_open_date, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      name,
      body.address || null,
      body.target_open_date || null,
      body.status || 'pre-buildout',
      body.notes || null,
      now,
      now
    )
    .run();

  const store = await env.DB.prepare('SELECT * FROM stores WHERE id = ?').bind(id).first();
  return jsonResponse(store, 201);
});
