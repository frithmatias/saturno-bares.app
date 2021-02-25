import { Company } from './company.interface';


export interface User {
	tx_name: string;
	tx_email: string;
	bl_active?: boolean;
	tx_password?: string;
	id_company?: Company;
	id_role?: string;
	id_socket?: string; //only frontend
	tx_img?: string | null;
	bl_social?: boolean;
	tx_platform?: string;
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

