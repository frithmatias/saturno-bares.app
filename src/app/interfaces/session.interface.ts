import { Section } from '../../../../api/models/section.model';
// ========================================================
// SECTOR SESSION
// ========================================================

export interface Session {
	id_waiter: string;
	id_section: Section;
    fc_start: Date;
    fc_end: Date;
	__v: number;
	_id: string;
}

export interface SessionResponse {
	ok: boolean;
	msg: string;
	session: Session | null;
}

export interface SessionsResponse {
	ok: boolean;
	msg: string;
	sessions: Session[] | null;
}
