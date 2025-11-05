import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BitArray } from '../types/bit';
import { oneOrZero } from '../helpers/oneOrZero';
import { createNextGeneration } from './cellHandler';
import { matrixEquals } from '../helpers/matrixEquals';

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 800;
const RESOLUTION = 10;

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
    const next = createNextGeneration(this.gameBoard, this.rows, this.cols);
    const afterNext = createNextGeneration(next, this.rows, this.cols);
    this.isFinalState = matrixEquals(this.gameBoard, afterNext);
    if (this.isFinalState) {
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
}
