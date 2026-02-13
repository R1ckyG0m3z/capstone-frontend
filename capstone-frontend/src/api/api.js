const API = import.meta.env.VITE_API;

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }

  return response;
};

// Auth API
export const authAPI = {
  register: async (credentials) => {
    const response = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const result = await response.text();
    if (!response.ok) throw Error(result);
    return result;
  },

  login: async (credentials) => {
    const response = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const result = await response.text();
    if (!response.ok) throw Error(result);
    return result;
  },
};

// Trips API
export const tripsAPI = {
  getAll: async () => {
    const response = await fetchWithAuth(`${API}/trips`);
    return response.json();
  },

  getById: async (id) => {
    const response = await fetchWithAuth(`${API}/trips/${id}`);
    return response.json();
  },

  getByUserId: async (userId) => {
    const response = await fetchWithAuth(`${API}/trips/user/${userId}`);
    return response.json();
  },
};

// User Profile API
export const userProfileAPI = {
  getByUserId: async (userId) => {
    const response = await fetchWithAuth(`${API}/user_profile/${userId}`);
    return response.json();
  },

  create: async () => {
    const response = await fetchWithAuth(`${API}/user_profile`, {
      method: "POST",
    });
    return response.json();
  },

  update: async (data) => {
    const response = await fetchWithAuth(`${API}/user_profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  assignTrip: async (tripId) => {
    const response = await fetchWithAuth(`${API}/user_profile/assign-trip`, {
      method: "POST",
      body: JSON.stringify({ tripId }),
    });
    return response.json();
  },

  removeTrip: async (tripId) => {
    const response = await fetchWithAuth(`${API}/user_profile/remove-trip`, {
      method: "POST",
      body: JSON.stringify({ tripId }),
    });
    return response.json();
  },

  getTrips: async (userId) => {
    const response = await fetchWithAuth(`${API}/user_profile/${userId}/trips`);
    return response.json();
  },
};
