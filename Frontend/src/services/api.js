
const API_BASE_URL =
  "https://gestion-hotel-backend-x1st.onrender.com/api";

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer le jeton CSRF auprès de Django."
    );
  }

  const data = await response.json();

  if (!data.csrfToken) {
    throw new Error("Django n'a pas fourni le jeton CSRF.");
  }

  return data.csrfToken;
}

async function apiRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    headers["X-CSRFToken"] = await getCsrfToken();
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error(
      "Authentification nécessaire. Connecte-toi pour accéder aux données."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Accès refusé. Vérifie ta session ou la protection CSRF."
    );
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text.trim()) {
    if (!response.ok) {
      throw new Error(`Erreur serveur (${response.status}).`);
    }

    return null;
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Le serveur a renvoyé une réponse invalide.");
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        data.error ||
        `Erreur HTTP ${response.status}.`
    );
  }

  return data;
}

export function apiGet(endpoint) {
  return apiRequest(endpoint, { method: "GET" });
}

export function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function apiPatch(endpoint, data) {
  return apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}

export default apiRequest;
