const API_BASE_URL = "/api";

async function apiRequest(endpoint, options = {}) {

  const token = localStorage.getItem("hotelToken");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
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

    localStorage.removeItem("hotelLoggedIn");
    localStorage.removeItem("hotelToken");
    localStorage.removeItem("hotelUser");

    window.location.reload();

    throw new Error(
      "Session expirée. Veuillez vous reconnecter."
    );
  }


  if (response.status === 204) {
    return null;
  }

  // Lire d'abord la réponse sous forme de texte
  const text = await response.text();

  // Réponse vide
  if (!text.trim()) {

    if (!response.ok) {
      throw new Error(
        `Erreur serveur (${response.status}).`
      );
    }

    return null;
  }

  // Essayer de convertir en JSON
  let data;

  try {

    data = JSON.parse(text);

  } catch (error) {

    console.error(
      "Réponse non JSON reçue par l'API :",
      text
    );

    throw new Error(
      `Le serveur a renvoyé une réponse invalide (${response.status}).`
    );
  }

  // Erreur HTTP
  if (!response.ok) {

    throw new Error(
      data.detail ||
      data.message ||
      data.error ||
      "Une erreur est survenue."
    );
  }

  return data;
}


// GET
export function apiGet(endpoint) {

  return apiRequest(endpoint, {
    method: "GET",
  });
}


// POST
export function apiPost(endpoint, data) {

  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// PUT
export function apiPut(endpoint, data) {

  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


// PATCH
export function apiPatch(endpoint, data) {

  return apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}


// DELETE
export function apiDelete(endpoint) {

  return apiRequest(endpoint, {
    method: "DELETE",
  });
}


export default apiRequest;