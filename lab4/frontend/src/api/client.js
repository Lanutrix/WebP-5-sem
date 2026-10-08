const TOKEN_KEY = "zb_token";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function extractMessage(payload, status) {
  if (!payload) return `Ошибка запроса (${status})`;
  const { detail } = payload;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Ошибки валидации FastAPI/Pydantic
    return detail
      .map((e) => {
        const field = Array.isArray(e.loc) ? e.loc.filter((p) => p !== "body").join(".") : "";
        return field ? `${field}: ${e.msg}` : e.msg;
      })
      .join("; ");
  }
  return `Ошибка запроса (${status})`;
}

/**
 * Универсальный вызов REST API через Fetch.
 * @param {string} path  путь вида /api/...
 * @param {{method?: string, body?: any, auth?: boolean}} options
 */
export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) throw new ApiError(extractMessage(payload, res.status), res.status, payload);
  return payload;
}

export const AuthApi = {
  register: (data) => api("/api/auth/register", { method: "POST", body: data, auth: false }),
  login: (data) => api("/api/auth/login", { method: "POST", body: data, auth: false }),
  me: () => api("/api/auth/me"),
};

export const ServicesApi = {
  list: (includeInactive = false) =>
    api(`/api/services${includeInactive ? "?include_inactive=true" : ""}`),
  create: (data) => api("/api/services", { method: "POST", body: data }),
  update: (id, data) => api(`/api/services/${id}`, { method: "PUT", body: data }),
  remove: (id) => api(`/api/services/${id}`, { method: "DELETE" }),
};

export const OrdersApi = {
  create: (data) => api("/api/orders", { method: "POST", body: data }),
  my: () => api("/api/orders/my"),
  track: (code, email) =>
    api(
      `/api/orders/track?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,
      { auth: false }
    ),
};

export const AdminApi = {
  stats: () => api("/api/admin/stats"),
  orders: (status) => api(`/api/admin/orders${status ? `?status=${status}` : ""}`),
  setStatus: (id, status, note = "") =>
    api(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status, note } }),
  removeOrder: (id) => api(`/api/admin/orders/${id}`, { method: "DELETE" }),
  users: () => api("/api/admin/users"),
};
