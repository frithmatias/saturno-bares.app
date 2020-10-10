import { Table } from './table.interface';
import { Ticket } from './ticket.interface';

// ========================================================
// SECTOR SESSION
// ========================================================

export interface tableSession {
	id_tables: [Table];
	id_ticket: Ticket;
    fc_start: Date;
    fc_end: Date;
	__v: number;
	_id: string;
}

export interface tableSessionResponse {
	ok: boolean;
	msg: string;
	session: tableSession | null;
}

export interface tableSessionsResponse {
	ok: boolean;
	msg: string;
	sessions: tableSession[] | null;
}
