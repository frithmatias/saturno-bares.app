// ========================================================
// SETTINGS
// ========================================================

export interface Settings {
	id_company: string,
	bl_spm_auto: boolean, // terraza, patio, etc
	__v?: number;
	_id?: string;
}

export interface SettingsResponse {
	ok: boolean;
	msg: string;
	settings: Settings | null;
}

