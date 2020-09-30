import { Table } from 'src/app/interfaces/table.interface';
import { Session } from './session.interface';
// ========================================================
// SECTIONS
// ========================================================

export interface Section {
	id_company: string,
    tx_section: string, // terraza, patio, etc
    id_session: Session | null,
	__v: number;
	_id: string;
}

export interface SectionResponse {
	ok: boolean;
	msg: string;
	section: Section | null;
}

export interface SectionsResponse {
	ok: boolean;
	msg: string;
	sections: Section[] | null;
}
