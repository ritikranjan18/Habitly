import API from "./api";

// LOGIN
export const login = async (data) => {
  const res = await API.post("/auth/login", data);

  // user data + token save
  localStorage.setItem("user", JSON.stringify(res.data));

  return res.data;
};

// REGISTER
export const register = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};
