// ========================================================
// CHAT SESSION
// ========================================================

export interface chatSession {
    id_user: string;
    id_user_socket: string;
    id_assistant: string;
    id_assistant_socket: string;
    tx_assistant_name: string;
    tm_start: Date;
    tm_init: Date;
    tm_end: Date;
    tx_subject: string;
    nm_score: Date;
    __v: number;
    _id: string;
}

export interface chatSessionResponse {
    ok: boolean;
    msg: string;
    session: chatSession | null;
}

export interface chatsSessionsResponse {
    ok: boolean;
    msg: string;
    sessions: chatSession[] | null;
}
