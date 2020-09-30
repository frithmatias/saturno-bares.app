import { Company } from './company.interface';

export interface User {
    tx_name: string;
	tx_email: string;
    tx_password?: string;
	id_company?: Company;
    bl_google?: boolean;
    tx_img?: string | null;
	id_role?: string;
	cd_pricing?: number;
	fc_createdat?: Date;
	fc_lastlogin?: Date;
	__v?: number;
	_id?: string;
}

export interface UserResponse {
	ok: boolean;
	msg: string;
	user: User | null;
}

export interface UsersResponse {
	ok: boolean;
	msg: string;
	users: User[] | null;
}

