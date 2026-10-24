
const API_BASE_URL =
  "https://gestion-hotel-backend-x1st.onrender.com/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("hotelToken");

  const headers = {
    ...(options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    throw new Error(
      "Authentification nécessaire. Connecte-toi pour accéder aux données."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Accès refusé. Vérifie tes autorisations."
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
    console.error("Réponse non JSON reçue :", text);

    throw new Error(
      `Réponse invalide du serveur (${response.status}).`
    );
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
