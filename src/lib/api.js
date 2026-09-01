async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  session: {
    get: () => request('/session'),
    login: (passphrase) =>
      request('/login', { method: 'POST', body: JSON.stringify({ passphrase }) }),
    logout: () => request('/logout', { method: 'POST' }),
  },
  stores: {
    list: () => request('/stores'),
    create: (data) => request('/stores', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/stores/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => request(`/stores/${id}`, { method: 'DELETE' }),
  },
  vendors: {
    list: () => request('/vendors'),
    create: (data) => request('/vendors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => request(`/vendors/${id}`, { method: 'DELETE' }),
  },
  storeVendors: {
    list: (storeId) => request(storeId ? `/store-vendors?store_id=${storeId}` : '/store-vendors'),
    create: (data) => request('/store-vendors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/store-vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => request(`/store-vendors/${id}`, { method: 'DELETE' }),
  },
  updateLog: {
    list: (storeId) => request(`/update-log?store_id=${storeId}`),
    create: (data) => request('/update-log', { method: 'POST', body: JSON.stringify(data) }),
  },
  milestones: {
    list: (storeId) => request(`/milestones?store_id=${storeId}`),
    create: (data) => request('/milestones', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/milestones/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => request(`/milestones/${id}`, { method: 'DELETE' }),
  },
};
