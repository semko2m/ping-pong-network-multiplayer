import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent} from "./components/canvas/canvas.component";


@NgModule({
  declarations: [
    CanvasComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PongModule { }
