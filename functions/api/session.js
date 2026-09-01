import { isAdminRequest, jsonResponse } from '../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const admin = await isAdminRequest(request, env);
  return jsonResponse({ isAdmin: admin });
}
