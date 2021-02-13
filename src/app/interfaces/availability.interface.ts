import { Ticket } from './ticket.interface';

export interface availabilityResponse {
    ok: boolean;
    msg: string;
    availability: availability[];
}

export interface availability {
    capacity: number;
    interval: Date;
    tables: avTable[];
}

export interface avTable {
    nmTable: number,
    nmPersons: number,
    blReserved: boolean,
    ticketOwner?: Ticket
}