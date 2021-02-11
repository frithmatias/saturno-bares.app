import { Session } from './session.interface';
import { Table } from './table.interface';
import { Section } from './section.interface';
import { Company } from './company.interface';
// ========================================================
// TICKET
// ========================================================

export interface Ticket {
	id_company: Company;
	id_section: Section; 
	id_session: Session; 
	nm_persons: number;
	bl_contingent: boolean;
	bl_priority: boolean;
	tx_name: string;
	tx_platform: string | null;
	id_user: string | null;
	tx_call: string;
	tx_status: string; // waiting, pending, terminated, scheduled, queued, requested, assigned, cancelled, provided, finished, killed
	cd_tables?: number[]; // only for requested and assigned tickets
    id_position: number; // assigned
    id_socket_client: string; // primary
    id_socket_waiter?: string | null; // assigned
	tm_reserve: Date | null;
	tm_provided?: Date | null;
	tm_call: Date | null;
	tm_start: Date | null;
	tm_init: Date | null;
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



