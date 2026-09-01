import { requireAdmin, jsonResponse } from '../../_lib/auth.js';

const EDITABLE_FIELDS = ['title', 'date', 'completed'];

export const onRequestPatch = requireAdmin(async ({ request, env, params }) => {
  const body = await request.json().catch(() => ({}));
  const fields = EDITABLE_FIELDS.filter((f) => f in body);
  if (fields.length === 0) return jsonResponse({ error: 'No editable fields provided.' }, 400);

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (f === 'completed' ? (body[f] ? 1 : 0) : body[f]));
  await env.DB.prepare(`UPDATE milestones SET ${setClause} WHERE id = ?`)
    .bind(...values, params.id)
    .run();

  const row = await env.DB.prepare('SELECT * FROM milestones WHERE id = ?').bind(params.id).first();
  if (!row) return jsonResponse({ error: 'Not found.' }, 404);
  return jsonResponse(row);
});

export const onRequestDelete = requireAdmin(async ({ env, params }) => {
  await env.DB.prepare('DELETE FROM milestones WHERE id = ?').bind(params.id).run();
  return jsonResponse({ ok: true });
});
