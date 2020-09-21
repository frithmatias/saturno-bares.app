import { User } from './user.interface';
import { Desktop } from './desktop.interface';

// ========================================================
// DESKTOPS
// ========================================================

export interface Session {
	id_assistant: User;
    id_desktop: Desktop;
    fc_start: Date;
    fc_end: Date;
	__v: number;
	_id: string;
}

export interface DesktopSessionResponse {
	ok: boolean;
	msg: string;
	session: Session | null;
}

export interface DesktopSessionsResponse {
	ok: boolean;
	msg: string;
	session: Session[] | null;
}
