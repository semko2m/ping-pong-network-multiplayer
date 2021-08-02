import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {io} from "socket.io-client"

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit {
  private apiRoute = "http://localhost:3000";

  @ViewChild('game', {static: false}) gameCanvas: ElementRef<HTMLCanvasElement> | any;

  private context: CanvasRenderingContext2D | any;
  private socket: any;

  constructor() {
  }

  ngOnInit(): void {
    this.socket = io(this.apiRoute);
  }

  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext("2d");
    this.socket.on("position", (position: { x: number; y: number }) => {
      this.context.clearRect(
        0,
        0,
        this.gameCanvas.nativeElement.width,
        this.gameCanvas.nativeElement.height
      )
      this.context.fillRect(position.x, position.y, 20, 20);
    })
    // this.context.fillRect(20,20,20,20);
  }

  public move(direction: string) {
    this.socket.emit("move", direction);
  }

}
