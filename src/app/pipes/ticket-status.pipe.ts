import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ticketStatus'
})
export class TicketStatusPipe implements PipeTransform {

  transform(txStatus: string): unknown {

    const statusList: any[] = [
      { tx_status: 'waiting', tx_label: 'A Confirmar' },
      { tx_status: 'pending', tx_label: 'Pendiente' },
      { tx_status: 'scheduled', tx_label: 'Agendado' },
      { tx_status: 'queued', tx_label: 'En Cola' },
      { tx_status: 'requested', tx_label: 'Requerido' },
      { tx_status: 'assigned', tx_label: 'Asignado' },
      { tx_status: 'provided', tx_label: 'Proveído' },
      { tx_status: 'finished', tx_label: 'Finalizado' },
      { tx_status: 'cancelled', tx_label: 'Cancelado' },
      { tx_status: 'terminated', tx_label: 'Terminado' },
      { tx_status: 'killed', tx_label: 'Caducado' },

    ];

    const item: string = statusList.find(status => status.tx_status === txStatus).tx_label;

    return item ? item : null;
  }

}
