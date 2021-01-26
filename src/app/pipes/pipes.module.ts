import { NgModule } from '@angular/core';
import { CapitalizarPipe } from './capitalizar.pipe';
import { DomseguroPipe } from './domseguro.pipe';
import { GetidstringPipe } from './getidstring.pipe';
import { ImagenPipe } from './imagen.pipe';
import { IntervalToHmsPipe } from './interval-to-hms.pipe';
import { MessageTimePipe } from './message-time.pipe';
import { TimeToHmsPipe } from './time-to-hms.pipe';
import { WordMaxLengthPipe } from './word-max-length.pipe';
import { GetOccupationPipe } from './get-ocuppation.pipe';
import { DateToStringPipe } from './date-to-string.pipe';
import { DateToRemainingPipe } from './date-to-remaining.pipe';
import { TicketStatusPipe } from './ticket-status.pipe';

@NgModule({
  declarations: [
    DomseguroPipe,
    GetidstringPipe,
    IntervalToHmsPipe,
    MessageTimePipe,
    TimeToHmsPipe,
    WordMaxLengthPipe,
    CapitalizarPipe,
    ImagenPipe,
    GetOccupationPipe,
    DateToStringPipe,
    DateToRemainingPipe,
    TicketStatusPipe
  ],
  imports: [],
  exports: [
    DomseguroPipe,
    GetidstringPipe,
    IntervalToHmsPipe,
    MessageTimePipe,
    TimeToHmsPipe,
    WordMaxLengthPipe,
    CapitalizarPipe,
    ImagenPipe,
    GetOccupationPipe,
    DateToStringPipe,
    DateToRemainingPipe,
    TicketStatusPipe

  ]
})
export class PipesModule { }
