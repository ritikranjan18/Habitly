import API from "./api";

export const getHabits = async () => {
  const res = await API.get("/habits");
  return res.data;
};

export const createHabit = async (data) => {
  const res = await API.post("/habits", data);
  return res.data;
};

export const deleteHabit = async (id) => {
  const res = await API.delete(`/habits/${id}`);
  return res.data;
};

export const toggleHabit = async (id) => {
  const res = await API.put(`/habits/${id}`);
  return res.data;
};