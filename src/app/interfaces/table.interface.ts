import { Session } from './session.interface';
// ========================================================
// DESKTOPS
// ========================================================

export interface Table {
	id_section: string, 
	nm_table: number, // 15, 16, 17, etc, número de mesa
	nm_persons: number,  
	tx_status: string, // idle, paused, busy
	id_ticket: string | null,
	__v?: number,
	_id?: string,
}

export interface TableResponse {
	ok: boolean;
	msg: string;
	table: Table | null;
}

export interface TablesResponse {
	ok: boolean;
	msg: string;
	tables: Table[] | null;
}
