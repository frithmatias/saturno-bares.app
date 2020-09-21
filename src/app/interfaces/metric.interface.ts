import { Company } from './company.interface';
import { Ticket } from 'src/app/interfaces/ticket.interface';

// ========================================================
// METRICS
// ========================================================

export interface Metrics {
    tickets: Ticket[],
    total: number,
	avg: number,
}

export interface MetricResponse {
	ok: boolean;
    msg: string;
	metrics: Metrics | null;
}

export interface MetricsResponse {
	ok: boolean;
    msg: string;
	metrics: Metrics[] | null;
}

