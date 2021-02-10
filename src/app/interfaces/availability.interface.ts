import { Ticket } from './ticket.interface';

export interface availabilityResponse {
    ok: boolean;
    msg: string;
    availability: availability[];
}

export interface availability {
    capacity: number;
    interval: number;
    tables: avTable[];
}

export interface avTable {
    nmTable: number,
    nmPersons: number,
    blReserved: boolean,
    ticketOwner?: Ticket
}