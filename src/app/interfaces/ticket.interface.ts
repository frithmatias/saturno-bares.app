import { Session } from './session.interface';
import { Table } from './table.interface';
import { Section } from './section.interface';
// ========================================================
// TICKET
// ========================================================

export interface Ticket {
	id_company: string;
	id_section: Section; 
	id_session: Session; 
	nm_persons: number;
	bl_priority: boolean;
	bl_called: boolean;
	tx_status: string; // assigned [privided, assigned, queued, requested]
	cd_tables?: [number]; // only for requested and assigned tickets
    id_position: number; // assigned
    id_socket_client: string; // primary
    id_socket_waiter?: string | null; // assigned
    tm_start: number;
    tm_provided?: number | null;
    tm_att?: number | null;
    tm_end?: number | null;
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



