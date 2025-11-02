export const fetchWithAuth = async (token, url, options = {}) => {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
};
