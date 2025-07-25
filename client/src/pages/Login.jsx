// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios'; // ✅ using your custom axios instance

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/auth/login', form); // ✅ no baseURL here
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      alert('Login failed');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 mt-10 border rounded shadow">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button className="w-full bg-blue-500 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
