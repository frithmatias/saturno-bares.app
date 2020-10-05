// ========================================================
// DESKTOPS
// ========================================================

export interface ScoreItem {
	id_section: string, 
	tx_item?: string, // idle, paused, busy
	bl_active?: boolean,
	__v?: number,
	_id?: string,
}


export interface ScoreItemsResponse {
	ok: boolean;
	msg: string;
	scoreitems: ScoreItem[] | null;
}
