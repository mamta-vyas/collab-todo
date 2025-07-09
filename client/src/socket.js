// client/src/socket.js
import { io } from 'socket.io-client';


// Use correct backend URL
const URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Connect socket
const socket = io(URL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

export default socket;
