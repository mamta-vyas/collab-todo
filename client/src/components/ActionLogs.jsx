import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ActionLogs({ onClose }) {
  const API_BASE = process.env.REACT_APP_API_BASE || '/api';
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/logs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }

        });
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };

    fetchLogs();
  }, [API_BASE]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">📜 Action Logs</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            ✖ Close
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-600 text-sm">No logs available.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log._id} className="border p-3 rounded">
                  <p className="text-sm">
                    <strong>{log.user?.name || 'Unknown user'}</strong> <span className="italic">{log.action}</span> task <strong>"{log.task?.title || 'Untitled'}"</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActionLogs;
