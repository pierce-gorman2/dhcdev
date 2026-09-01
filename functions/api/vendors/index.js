import { requireAdmin, jsonResponse } from '../../_lib/auth.js';
import { newId, nowIso } from '../../_lib/db.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM vendors ORDER BY company_name ASC, contact_name ASC'
  ).all();
  return jsonResponse(results);
}

export const onRequestPost = requireAdmin(async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  const companyName = (body.company_name || '').trim();
  const contactName = (body.contact_name || '').trim();
  if (!companyName && !contactName) {
    return jsonResponse({ error: 'Company name or contact name is required.' }, 400);
  }

  const id = newId('vendor');
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO vendors (id, company_name, contact_name, phone, email, industry, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      companyName || null,
      contactName || null,
      body.phone || null,
      body.email || null,
      body.industry || null,
      now,
      now
    )
    .run();

  const vendor = await env.DB.prepare('SELECT * FROM vendors WHERE id = ?').bind(id).first();
  return jsonResponse(vendor, 201);
});
