import { User } from "./user.interface";

export interface LoginResponse {
    ok: boolean;
    msg: string;
    token: string;
    user: User;
    menu: Menu[];
    home: string;
}

interface Menu {
    tx_titulo: string;
    tx_url: string;
    tx_icon: string;
    subitems: Subitem[];
    cd_pricing?: number;
}

interface Subitem {
    tx_titulo: string;
    tx_url: string;
    tx_icon: string;
    __v?: number;
}
