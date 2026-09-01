import { requireAdmin, jsonResponse } from '../../_lib/auth.js';
import { nowIso } from '../../_lib/db.js';

const EDITABLE_FIELDS = ['name', 'address', 'target_open_date', 'status', 'notes'];

export const onRequestPatch = requireAdmin(async ({ request, env, params }) => {
  const body = await request.json().catch(() => ({}));
  const fields = EDITABLE_FIELDS.filter((f) => f in body);
  if (fields.length === 0) return jsonResponse({ error: 'No editable fields provided.' }, 400);

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => body[f]);
  await env.DB.prepare(`UPDATE stores SET ${setClause}, updated_at = ? WHERE id = ?`)
    .bind(...values, nowIso(), params.id)
    .run();

  const store = await env.DB.prepare('SELECT * FROM stores WHERE id = ?').bind(params.id).first();
  if (!store) return jsonResponse({ error: 'Store not found.' }, 404);
  return jsonResponse(store);
});

export const onRequestDelete = requireAdmin(async ({ env, params }) => {
  await env.DB.prepare('DELETE FROM stores WHERE id = ?').bind(params.id).run();
  return jsonResponse({ ok: true });
});
