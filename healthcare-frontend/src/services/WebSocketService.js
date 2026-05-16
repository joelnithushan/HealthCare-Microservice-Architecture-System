import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';

let stompClient = null;
const MAX_RECONNECT_DELAY = 30000;

const scheduleReconnect = (userId, onMessageReceived, delay) => {
    setTimeout(() => connectWebSocket(userId, onMessageReceived, Math.min(delay * 2, MAX_RECONNECT_DELAY)), delay);
};

export const connectWebSocket = (userId, onMessageReceived, reconnectDelay = 1000) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const socket = new SockJS(`${baseUrl}/ws`);
    stompClient = Stomp.over(socket);
    
    // Disable debug logging to keep console clean
    stompClient.debug = () => {};

    stompClient.connect({}, function (frame) {
        stompClient.subscribe('/topic/notifications/' + userId, function (message) {
            const parsedMessage = JSON.parse(message.body);
            if (parsedMessage.type === 'APPOINTMENT_STATUS') {
                toast(parsedMessage.message, {
                    icon: '🔔',
                    duration: 5000,
                });
                if (onMessageReceived) {
                    onMessageReceived(parsedMessage);
                }
            }
        });
    }, function (error) {
        console.error('WebSocket connection error:', error);
        scheduleReconnect(userId, onMessageReceived, reconnectDelay);
    });
};

export const disconnectWebSocket = () => {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
};
