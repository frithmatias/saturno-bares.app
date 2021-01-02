// ========================================================
// COMPANY
// ========================================================

export interface Company {

	id_user: string;
	
	// register data
	tx_company_name: string;
	tx_company_slogan: string;
	tx_company_string: string;
	tx_company_location: string;
	cd_company_location: string;
    tx_company_lat: string;
    tx_company_lng: string;
    tx_address_street: string;
	tx_address_number: string;

	// webpage data
	tx_company_welcome: string;
	tx_email: string;
	tx_whatsapp: string;
	tx_facebook: string;
	tx_twitter: string;
	tx_instagram: string;
	
	//uploader
    tx_company_logo: string;
	tx_company_banners: string[];

	tm_start: Date;
    tm_end: Date;
	__v?: number;
	_id?: string;
}

export interface CompanyResponse {
	ok: boolean;
	msg: string;
	company: Company | null;
}

export interface CompaniesResponse {
	ok: boolean;
	msg: string;
	companies: Company[] | null;
}