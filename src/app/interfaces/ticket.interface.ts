import { Skill } from 'src/app/interfaces/skill.interface';
import { Session } from './session.interface';
// ========================================================
// TICKET
// ========================================================

export interface Ticket {
	id_root: string | null;
	id_child: string | null;
	bl_priority: boolean;
	id_position: number;
	id_socket: string;
	id_socket_desk: string | null;
	id_session: Session;
	id_company: string;
	id_skill: Skill;
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



