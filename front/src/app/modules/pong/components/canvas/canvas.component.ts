import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {io} from "socket.io-client"
import {UserModel} from "../../models/user.model";
import {BallModel} from "../../models/ball.model";


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {


  private apiRoute = "http://localhost:3000";
  private userId: number | any;
  public listOfUsers: any;

  // load sounds
  private hit = new Audio();
  private wall = new Audio();
  private userScore = new Audio();
  private comScore = new Audio();

  // User Paddle
  public user1: UserModel | any;

  // user2 Paddle
  public user2: UserModel | any;

  // user3 Paddle
  public user3: UserModel | any;

  // user4 Paddle
  public user4: UserModel | any;

  //ball
  private ball: BallModel | any

  @ViewChild('game', {static: false}) gameCanvas: ElementRef<HTMLCanvasElement> | any;

  private context: CanvasRenderingContext2D | any;
  private socket: any;

  constructor() {
    this.hit.src = "../../../assets/sounds/hit.mp3";
    this.wall.src = "../../../assets/sounds/wall.mp3";
    this.comScore.src = "../../../assets/sounds/comScore.mp3";
    this.userScore.src = "../../../assets/sounds/userScore.mp3";
    this.userId = new Date().getUTCMilliseconds();
    console.log(this.userId);
    window.addEventListener('beforeunload', function (e) {
      // Cancel the event
      e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      // Chrome requires returnValue to be set
      // e.returnValue = '';
    });
  }

  ngOnInit(): void {
    this.socket = io(this.apiRoute);
  }

  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext("2d");
    this.socket.on("position", (position: { ball: BallModel; user1: UserModel, user2: UserModel, user3: UserModel, user4: UserModel }) => {
      console.log(position);
      this.ball = position.ball;
      this.user1 = position.user1;
      this.user2 = position.user2;
      this.user3 = position.user3
      this.user4 = position.user4
      this.render();
    })

    this.socket.on("playSound", (sound: string) => {
      switch (sound) {
        case 'hit':
          this.hit.play();
          break;
        case 'wall':
          this.wall.play();
      }
    })
    this.socket.emit("registerUser", {userId: this.userId});

    this.socket.on("listOfUsers", (list: []) => {
      this.listOfUsers = list;
      console.log(this.listOfUsers);
    })

  }

  ngOnDestroy() {
    console.log('On destroy called.');
    const data = {
      userId: this.userId
    }
    this.socket.emit("deleteUser", data);
  }

  public logOut() {
    console.log('User wants to leave. Empty user');
    const data = {
      userId: this.userId
    }
    this.socket.emit("deleteUser", data);
  }

  public startGame() {
    this.socket.emit("start", true);
  }

  public endGame() {
    this.socket.emit("end", true)
  }

  /**
   * draw a rectangle, will be used to draw paddles
   * @param x
   * @param y
   * @param w
   * @param h
   * @param color
   */
  public drawRect(x: number, y: number, w: number, h: number, color: string) {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, w, h);
  }


  /**
   * draw circle, will be used to draw the ball
   * @param x
   * @param y
   * @param r
   * @param color
   */
  public drawArc(x: number, y: number, r: number, color: string) {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x, y, r, 0, Math.PI * 2, true);
    this.context.closePath();
    this.context.fill();
  }

  /**
   * Listen mouse event
   * @param evt
   */
  public getMousePos(evt: any) {
    // console.log(evt)
    let rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    if (rect) {
      const data = {
        clientRect: rect,
        mousePosition: {
          clientX: evt.clientX,
          clientY: evt.clientY,
        },
        userId: this.userId
      }
      // console.log(data);
      this.socket.emit("move", data);
    }

  }

  /**
   * draw text
   * @param text
   * @param x
   * @param y
   */
  public drawText(text: string, x: number, y: number) {
    this.context.fillStyle = "#FFF";
    this.context.font = "75px fantasy";
    this.context.fillText(text, x, y);
  }

  /**
   *  render public, the public that does al the drawing
   */
  public render() {

    // clear the canvas
    this.drawRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height, "#000");

    // draw the user1 score to the left
    if (this.user1.score === 'undefined') {
      debugger;
    }
    // this.drawText(this.user1.score, this.gameCanvas.nativeElement.width / 4, this.gameCanvas.nativeElement.height / 5);

    // draw the user2 score to the right
    // this.drawText(this.user2.score, 3 * this.gameCanvas.nativeElement.width / 4, this.gameCanvas.nativeElement.height / 5);

    // draw the user1's paddle
    this.drawRect(this.user1.x, this.user1.y, this.user1.width, this.user1.height, this.user1.color);

    // draw the user2 paddle
    this.drawRect(this.user2.x, this.user2.y, this.user2.width, this.user2.height, this.user2.color);

    // draw the user3 paddle
    if (this.user3) {
      this.drawRect(this.user3.x, this.user3.y, this.user3.width, this.user3.height, this.user3.color);
    }

    // draw the user4 paddle
    if (this.user4) {
      this.drawRect(this.user4.x, this.user4.y, this.user4.width, this.user4.height, this.user4.color);
    }

    // draw the ball
    this.drawArc(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
  }

}
