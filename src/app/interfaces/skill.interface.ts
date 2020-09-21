import { Company } from './company.interface';

// ========================================================
// SKILLS
// ========================================================

export interface Skill {
	id_company: string,
	cd_skill?: string,
	tx_skill?: string,
	bl_generic: boolean, 
	_id: string;
}

export interface SkillResponse {
	ok: boolean;
	msg: string;
	skill: Skill | null;
}

export interface SkillsResponse {
	ok: boolean;
	msg: string;
	skills: Skill[] | null;
}

