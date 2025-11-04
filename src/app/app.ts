import { Component, signal } from '@angular/core';
import { GameBoardComponent } from './game-board/game-board.component';
@Component({
  selector: 'app-root',
  imports: [GameBoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('game-of-life');
}
