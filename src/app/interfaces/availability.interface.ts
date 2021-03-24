import { Ticket } from './ticket.interface';

export interface availabilityResponse {
    ok: boolean;
    msg: string;
    compatible: boolean; //tiene mesas compatibles
    availability: avInterval[];
}

export interface avInterval {
    interval: Date;
    compatible: number[];
    available: avTable[] | null;
    capacity: number | null;

}

export interface avTable {
    nmTable: number,
    nmPersons: number,
    blReserved: boolean,
    ticketOwner?: Ticket
}

// list of intervals to show in intervals select in create ticket page
export interface optionInterval {
    disabled: boolean,
    date: Date,
    text: string,
    compatible: number[]
}
