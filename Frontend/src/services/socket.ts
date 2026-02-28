import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const socket: Socket = io(SOCKET_URL, {
    autoConnect: false, // We connect explicitly in components that need it
});

export default socket;
