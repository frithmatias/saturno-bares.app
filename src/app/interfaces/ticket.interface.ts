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
	bl_contingent: boolean;
	bl_priority: boolean;
	tx_name: string;
	tx_platform: string | null;
	id_user: string | null;
	nm_phone: number | null;
	tx_email: string | null;
	tx_call: string;
	tx_status: string; // assigned [privided, assigned, queued, requested]
	cd_tables?: number[]; // only for requested and assigned tickets
    id_position: number; // assigned
    id_socket_client: string; // primary
    id_socket_waiter?: string | null; // assigned
	tm_reserve: Date;
	tm_provided?: Date | null;
	tm_call: Date;
    tm_start: Date;
    tm_att?: Date | null;
    tm_end?: Date | null;
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



