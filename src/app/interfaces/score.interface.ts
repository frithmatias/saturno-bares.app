// ========================================================
// DESKTOPS
// ========================================================

export interface ScoreItem {
	id_section: string, 
	tx_item?: string, // idle, paused, busy
	__v?: number,
	_id?: string,
}

export interface ScoreItemResponse {
	ok: boolean;
	msg: string;
	scoreitem: ScoreItem | null;
}

export interface ScoreItemsResponse {
	ok: boolean;
	msg: string;
	scoreitems: ScoreItem[] | null;
}


export interface Score {
	cd_score: number, 
	id_scoreitem?: string, // idle, paused, busy
	id_ticket?: string,
	__v?: number,
	_id?: string,
}

export interface ScoresResponse {
	ok: boolean;
	msg: string;
	scores: Score[] | null;
}


