import {ref} from 'vue';

export type NotificationType = 'success' | 'error' | 'warning';

interface NotificationItem {
    id: string;
    message: string;
    type: NotificationType;
    duration: number;
}

// Create a notification service singleton
const notifications = ref<NotificationItem[]>([]);

export const notificationService = {
    notifications,
    show(message: string, type: NotificationType = 'success', duration: number = 3000) {
        const id = Date.now().toString();
        notifications.value.push({id, message, type, duration});

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    },
    remove(id: string) {
        notifications.value = notifications.value.filter(n => n.id !== id);
    }
};

export const showNotification = (message: string, type: NotificationType = 'success', duration: number = 3000) => {
    notificationService.show(message, type, duration);
}