import axios from 'axios';

const instance = axios.create({
  baseURL: "https://collab-todo.onrender.com",
  withCredentials: true,
});

export default instance;

