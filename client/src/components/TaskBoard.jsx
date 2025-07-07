import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';
import ActionLogs from '../components/ActionLogs';


const statuses = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' }
];

const statusMap = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done'
};

function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [showLogs, setShowLogs] = useState(false);


  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const updatedTask = tasks.find(t => t._id === draggableId);
    updatedTask.status = statusMap[destination.droppableId];

    await axios.put(`/api/tasks/${draggableId}`, updatedTask, {
      headers: { Authorization: localStorage.getItem('token') }
    });
  };

 useEffect(() => {
  fetchTasks();      // already present
  fetchUsers();      // ✅ add this to call your function

  socket.on('task-created', (task) => {
    setTasks(prev => [...prev, task]);
  });

  socket.on('task-updated', (task) => {
    setTasks(prev => prev.map(t => t._id === task._id ? task : t));
  });

  socket.on('task-deleted', (taskId) => {
    setTasks(prev => prev.filter(t => t._id !== taskId));
  });

  return () => {
    socket.off('task-created');
    socket.off('task-updated');
    socket.off('task-deleted');
  };
}, []);

const handleLogout = () => {
  localStorage.removeItem('token');   // remove token
  window.location.href = '/login';    // redirect to login page
};



  const handleSmartAssign = async (taskId) => {
    try {
      await axios.post(`/api/tasks/${taskId}/smart-assign`, {}, {
        headers: { Authorization: localStorage.getItem('token') }
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Smart assign failed');
    }
  };

  const handleEditSave = async () => {
    try {
      const taskToSend = { ...editTask };

      if (!taskToSend.assignedTo) {
        taskToSend.assignedTo = null;
      }

      if (editTask._id) {
        await axios.put(`/api/tasks/${editTask._id}`, taskToSend, {
          headers: { Authorization: localStorage.getItem('token') }
        });
      } else {
        await axios.post(`/api/tasks`, taskToSend, {
          headers: { Authorization: localStorage.getItem('token') }
        });
      }

      setEditTask(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-4">
      {/* Header + Add Task */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
      <div className="flex gap-4">
  <button
    onClick={() =>
      setEditTask({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Todo',
        assignedTo: ''
      })
    }
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    ➕ Add Task
  </button>

  <button
    onClick={() => setShowLogs(true)}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    📜 Show Logs
  </button>

  {/* 🔐 Logout Button */}
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      🚪 Logout
    </button>
</div>


      </div>

      {/* 🔁 Drag and Drop Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statuses.map(({ id, label }) => (
            <Droppable droppableId={id} key={id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-3 rounded shadow min-h-[300px]"
                >
                  <h2 className="text-lg font-semibold mb-2">{label}</h2>

                  {tasks
                    .filter(task => task.status === label)
                    .map((task, index) => (
                      <Draggable draggableId={task._id} index={index} key={task._id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 mb-3 rounded shadow cursor-move"
                          >
                            <p className="font-bold">{task.title}</p>
                            <p className="text-sm text-gray-700">{task.description}</p>
                            <p className="text-xs mt-1 text-gray-500">Priority: {task.priority}</p>
                            <p className="text-xs text-gray-500 italic mb-1">
                              Assigned to: {task.assignedTo?.name || 'Unassigned'}
                            </p>

                            <div className="flex gap-3 mt-2">
                              <button
                                onClick={() => setEditTask(task)}
                                className="text-blue-600 text-xs underline"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(task._id)}
                                className="text-red-600 text-xs underline"
                              >
                                🗑 Delete
                              </button>
                              {!task.assignedTo && (
                                <button
                                  onClick={() => handleSmartAssign(task._id)}
                                  className="text-sm text-purple-600 underline ml-auto"
                                >
                                  🧠 Smart Assign
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* 🔲 Edit / Add Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {editTask._id ? 'Edit Task' : 'Add New Task'}
            </h2>
            <input
              type="text"
              placeholder="Title"
              value={editTask.title}
              onChange={e => setEditTask({ ...editTask, title: e.target.value })}
              className="w-full border p-2 rounded mb-3"
              required
            />
            <textarea
              placeholder="Description"
              value={editTask.description}
              onChange={e => setEditTask({ ...editTask, description: e.target.value })}
              className="w-full border p-2 rounded mb-3"
            />
            <div className="flex gap-4 mb-4">
              <select
                value={editTask.priority}
                onChange={e => setEditTask({ ...editTask, priority: e.target.value })}
                className="p-2 border rounded w-full"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select
                value={editTask.status}
                onChange={e => setEditTask({ ...editTask, status: e.target.value })}
                className="p-2 border rounded w-full"
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>

           <select
  value={editTask.assignedTo || ''}
  onChange={e => setEditTask({ ...editTask, assignedTo: e.target.value })}
  className="p-2 border rounded w-full"
>
  <option value="">-- Select Assignee --</option>
  {users.map(user => (
    <option key={user._id} value={user._id}>
      {user.name}
    </option>
  ))}
</select>


            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditTask(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {editTask._id ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showLogs && <ActionLogs onClose={() => setShowLogs(false)} />}

    </div>
  );
}

export default TaskBoard;
