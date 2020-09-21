import { Session } from './session.interface';
// ========================================================
// DESKTOPS
// ========================================================

export interface Desktop {
	id_company: string,
	cd_desktop: string,
	id_session: Session,
	bl_generic: boolean,
	__v: number;
	_id: string;
}

export interface DesktopResponse {
	ok: boolean;
	msg: string;
	desktop: Desktop | null;
}

export interface DesktopsResponse {
	ok: boolean;
	msg: string;
	desktops: Desktop[] | null;
}
