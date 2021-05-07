import { NgModule } from '@angular/core';
import { CapitalizarPipe } from './capitalizar.pipe';
import { DomseguroPipe } from './domseguro.pipe';
import { GetidstringPipe } from './getidstring.pipe';
import { ImagenPipe } from './imagen.pipe';
import { DiffToHMSPipe } from './diff-to-hms.pipe';
import { MessageTimePipe } from './message-time.pipe';
import { WordMaxLengthPipe } from './word-max-length.pipe';
import { GetOccupationPipe } from './get-ocuppation.pipe';
import { DateToStringPipe } from './date-to-string.pipe';
import { DateToRemainingPipe } from './date-to-remaining.pipe';
import { TicketStatusPipe } from './ticket-status.pipe';
import { IntervalToHmPipe } from './interval-to-hm.pipe';
import { StringReplaceDateTimePipe } from './string-replace-date-time.pipe';

@NgModule({
  declarations: [
    DomseguroPipe,
    GetidstringPipe,
    DiffToHMSPipe,
    MessageTimePipe,
    WordMaxLengthPipe,
    CapitalizarPipe,
    ImagenPipe,
    GetOccupationPipe,
    DateToStringPipe,
    DateToRemainingPipe,
    TicketStatusPipe,
    IntervalToHmPipe,
    StringReplaceDateTimePipe
  ],
  imports: [],
  exports: [
    DomseguroPipe,
    GetidstringPipe,
    DiffToHMSPipe,
    MessageTimePipe,
    WordMaxLengthPipe,
    CapitalizarPipe,
    ImagenPipe,
    GetOccupationPipe,
    DateToStringPipe,
    DateToRemainingPipe,
    TicketStatusPipe,
    IntervalToHmPipe,
    StringReplaceDateTimePipe

  ]
})
export class PipesModule { }
