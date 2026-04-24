import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';

let stompClient = null;

export const connectWebSocket = (userId, onMessageReceived) => {
    const socket = new SockJS('http://localhost:8080/ws');
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
        // Auto-reconnect after 5 seconds
        setTimeout(() => connectWebSocket(userId, onMessageReceived), 5000);
    });
};

export const disconnectWebSocket = () => {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
};
