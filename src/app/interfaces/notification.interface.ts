// ========================================================
// SYSTEM NOTIFICATIONS
// ========================================================

export interface Notification {
	id_owner: string, 
	tx_icon: string,
	tx_title: string,
	tx_message: string,  
	tm_notification: Date, 
	tm_event: Date,
	__v?: number,
	_id?: string,
}

export interface NotificationResponse {
	ok: boolean;
	msg: string;
	notification: Notification | null;
}

export interface NotificationsResponse {
	ok: boolean;
	msg: string;
	notifications: Notification[] | null;
}
