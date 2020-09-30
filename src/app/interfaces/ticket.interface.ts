import { Session } from './session.interface';
import { Table } from './table.interface';
import { Section } from './section.interface';
// ========================================================
// TICKET
// ========================================================

export interface Ticket {
	id_company: string;
	id_socket_client: string;
	id_socket_waiter: string | null;

	// requested
	id_section: Section; 
	id_position: number;
	
	// assigned
	id_session: Session; 
	id_table: Table | null;
	
	tm_start: number;
	tm_att: number | null;
	tm_end: number | null;
	_id: string;
}

export interface TicketResponse {
	ok: boolean;
	msg: string;
	ticket: Ticket | null;
}

export interface TicketsResponse {
	ok: boolean;
	msg: string;
	tickets: Ticket[];
}



