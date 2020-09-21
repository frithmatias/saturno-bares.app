// ========================================================
// SUPERUSER
// ========================================================

export interface MenusResponse {
	ok: boolean;
	msg: string;
	menuitem: MenuItem[] | null;
}

export interface MenuResponse {
	ok: boolean;
	msg: string;
	menuitem: MenuItem | null;
}

export interface MenuItem { // menu OR submenu
	id_parent: string | null;
    cd_role: number;
	cd_pricing: number;
	tx_titulo: string,
	tx_icon?: string,
	tx_url?: string,
	_id: string;
}



