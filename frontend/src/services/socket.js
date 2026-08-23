/**
 * Socket.IO client singleton for Debal.
 *
 * Usage:
 *   import { connectSocket, getSocket, disconnectSocket } from './socket';
 *
 *   connectSocket(accessToken);          // call once after login
 *   const socket = getSocket();          // anywhere you need the socket
 *   disconnectSocket();                  // call on logout
 */
import { io } from "socket.io-client";

let _socket = null;

/**
 * Create (or reuse) the Socket.IO connection.
 * Pass the JWT accessToken so the server can identify the user.
 */
export function connectSocket(token) {
  if (_socket) {
    _socket.auth = { token };
    if (!_socket.connected) {
      _socket.connect();
    }
    return _socket;
  }

  _socket = io("/", {
    // Vite proxies "/" to localhost:4001 in dev
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  _socket.on("connect", () => {
    console.log("[socket] connected:", _socket.id);
  });

  _socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
  });

  _socket.on("connect_error", (err) => {
    console.warn("[socket] connection error:", err.message);
  });

  return _socket;
}

/**
 * Return the active socket instance (or null if not yet connected).
 */
export function getSocket() {
  return _socket;
}

/**
 * Tear down the connection (call on logout).
 */
export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
