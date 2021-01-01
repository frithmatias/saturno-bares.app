import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  percent: string = '0';
  constructor() { }

  ngOnInit(): void {
  }


  myFunction(e){
    // console.log(e.target.currentTime)
     console.log(e.target.currentTime * 100 / e.target.duration)
     this.percent = String(e.target.currentTime * 100 / e.target.duration);

  }
}
