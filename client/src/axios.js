import axios from 'axios';

const instance = axios.create({
  baseURL: "https://collab-todo.onrender.com/api",
  withCredentials: true,
});

export default instance;

