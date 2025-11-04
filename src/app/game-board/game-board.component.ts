import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { oneOrZero } from '../helpers/oneOrZero';
import { matrixEquals } from '../helpers/matrixEquals';

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 800;
const RESOLUTION = 10;

type BitArray = number[];

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css'],
})
export class GameBoardComponent implements AfterViewInit {
  @ViewChild('gameboard', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  gameBoard!: BitArray[];
  private isFinalState = false;
  private iterations: number = 0;
  private animationFrameId: number | null = null;

  private rows = 0;
  private cols = 0;

  ngAfterViewInit(): void {
    const canvasEl = this.canvas.nativeElement;
    canvasEl.width = BOARD_WIDTH;
    canvasEl.height = BOARD_HEIGHT;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.rows = BOARD_HEIGHT / RESOLUTION;
    this.cols = BOARD_WIDTH / RESOLUTION;
    this.gameBoard = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, oneOrZero)
    );
    this.render(this.gameBoard);
    this.animate();
  }

  private animate(): void {
    this.iterations++;
    console.log(this.iterations);
    const next = this.createNextGeneration(this.gameBoard);
    const afterNext = this.createNextGeneration(next);
    this.isFinalState = matrixEquals(this.gameBoard, afterNext);
    if (this.isFinalState) {
      console.log(this.iterations);
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      return;
    }
    this.gameBoard = next;
    this.render(this.gameBoard);
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private render(board: BitArray[]): void {
    const c = this.ctx;
    const res = RESOLUTION;
    c.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        c.fillStyle = cell ? '#000' : '#fff';
        c.fillRect(x * res, y * res, res, res);
        c.strokeStyle = '#ddd';
        c.strokeRect(x * res, y * res, res, res);
      });
    });
  }

  private getCell(board: BitArray[], r: number, c: number): number {
    const row = (r + this.rows) % this.rows;
    const col = (c + this.cols) % this.cols;
    return board[row][col];
  }

  private createNextGeneration(board: BitArray[]): BitArray[] {
    const next: BitArray[] = board.map(row => [...row]);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let liveNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) continue;
            liveNeighbors += this.getCell(board, y + dy, x + dx);
          }
        }
        const cell = board[y][x];
        const survives = cell === 1 && (liveNeighbors === 2 || liveNeighbors === 3);
        const born = cell === 0 && liveNeighbors === 3;
        next[y][x] = survives || born ? 1 : 0;
      }
    }
    return next;
  }
}
