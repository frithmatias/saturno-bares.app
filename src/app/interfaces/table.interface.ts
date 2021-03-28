import { Session } from './session.interface';
import { tableSession } from './table.session.interface';
// ========================================================
// DESKTOPS
// ========================================================

export interface Table {
	id_section: string, 
	nm_table: number, // 15, 16, 17, etc, número de mesa
	nm_persons: number,  
	tx_status?: string, // idle, paused, busy, reserved, waiting 
	id_session?: tableSession,
	id_ticket?: string, // if tx_status === 'reserved'
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
