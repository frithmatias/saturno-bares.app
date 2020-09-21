import { NgModule } from '@angular/core';
import { DomseguroPipe } from './domseguro.pipe';
import { GetidstringPipe } from './getidstring.pipe';
import { IntervalToHmsPipe } from './interval-to-hms.pipe';
import { MessageTimePipe } from './message-time.pipe';
import { TimeToHmsPipe } from './time-to-hms.pipe';
import { WordMaxLengthPipe } from './word-max-length.pipe';

@NgModule({
  declarations: [
    DomseguroPipe,
    GetidstringPipe,
    IntervalToHmsPipe,
    MessageTimePipe,
    TimeToHmsPipe,
    WordMaxLengthPipe
  ],
  imports: [],
  exports: [
    DomseguroPipe,
    GetidstringPipe,
    IntervalToHmsPipe,
    MessageTimePipe,
    TimeToHmsPipe,
    WordMaxLengthPipe
  ]
})
export class PipesModule { }
