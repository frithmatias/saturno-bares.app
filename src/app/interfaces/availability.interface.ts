import { Ticket } from './ticket.interface';

export interface availabilityResponse {
    ok: boolean;
    msg: string;
    availability: availability[];
}

export interface availability {
    interval: Date;
    compatible: number[];
    available: avData[] | null;
    capacity: number | null;

}

export interface avData {
    nmTable: number,
    nmPersons: number,
    blReserved: boolean,
    ticketOwner?: Ticket
}

// list of intervals to show in intervals select in create ticket page
export interface avInterval {
    disabled: boolean,
    date: Date,
    text: string,
    compatible: number[]
}
