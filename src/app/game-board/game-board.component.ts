// Angular component responsible for rendering and advancing the
// Game of Life simulation on an HTML canvas.
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { BitArray } from '../types/bit';
import { oneOrZero } from '../helpers/oneOrZero';
import { createNextGeneration } from './cellHandler';
import { matrixEquals } from '../helpers/matrixEquals';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';

// Canvas and simulation configuration constants.
// - BOARD_WIDTH / BOARD_HEIGHT: pixel size of the canvas element
// - RESOLUTION: the size (in pixels) of a single cell square
// The number of logical rows/cols is derived from these values.
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 800;
const RESOLUTION = 10;

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css'],
})
export class GameBoardComponent implements AfterViewInit {
  // Reference to the canvas element in the template. We use ViewChild
  // to obtain the native element after the view initializes.
  @ViewChild('gameboard', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  // Rendering context (Canvas 2D). This is assigned in ngAfterViewInit
  // after the canvas native element is available.
  private ctx!: CanvasRenderingContext2D;

  // Inject HttpClient and ConfigService using the `inject` function.
  // These are used for saving simple simulation stats to a backend API.
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  // The logical board is a 2D array of Bits (0 or 1).
  gameBoard!: BitArray[];

  // Public API URL configured via ConfigService. If empty, we skip
  // attempting to POST statistics at the end of the simulation.
  public apiUrl: string = '';

  // Track whether the simulation reached a final (stable) state.
  private isFinalState = false;

  // Counter of how many iterations/generations have been produced.
  private iterations: number = 0;

  // ID returned by requestAnimationFrame so we can cancel it if needed.
  private animationFrameId: number | null = null;

  // Calculated number of rows and columns based on canvas size & resolution.
  private rows = 0;
  private cols = 0;

  /**
   * Lifecycle hook: After the component view initializes we can access
   * the canvas element and perform setup.
   *
   * Steps performed here:
   * 1. Read API URL from configuration service.
   * 2. Size the canvas element to the configured width/height.
   * 3. Acquire the 2D drawing context and store it in `this.ctx`.
   * 4. Calculate logical rows/cols from RESOLUTION.
   * 5. Create an initial random board using `oneOrZero` for each cell.
   * 6. Render the initial board and start the animation loop.
   */
  ngAfterViewInit(): void {
    // Load API URL to use when saving stats (if present).
    this.apiUrl = this.config.apiUrl;

    // Obtain native canvas element and set its drawing buffer size.
    const canvasEl = this.canvas.nativeElement;
    canvasEl.width = BOARD_WIDTH;
    canvasEl.height = BOARD_HEIGHT;

    // Get 2D rendering context. If not available, throw an error since
    // rendering cannot continue without it.
    const ctx = canvasEl.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Compute number of logical rows/columns from canvas pixels and
    // the resolution (size of each cell in pixels).
    this.rows = BOARD_HEIGHT / RESOLUTION;
    this.cols = BOARD_WIDTH / RESOLUTION;

    // Initialize the game board with random bits using the `oneOrZero`
    // helper. We build an array with `this.rows` rows and each row is an
    // array of `this.cols` bits.
    this.gameBoard = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, oneOrZero)
    );

    // Draw the initial board and start animating.
    this.render(this.gameBoard);
    this.animate();
  }

  /**
   * Advance the simulation by one generation and schedule the next
   * animation frame. This method contains the core loop logic.
   *
   * Important points:
   * - We keep an `iterations` counter that increases each time this
   *   method runs.
   * - Compute `next` (the next generation) then `afterNext` (the
   *   generation after `next`). We compare `afterNext` with the current
   *   board to detect a 2-step cycle or a stable state. If equal,
   *   the simulation is considered final and we stop animating.
   * - If not final, we update the board, render it, and request the
   *   next animation frame.
   */
  private animate(): void {
    // Increment generation counter.
    this.iterations++;

    // Compute the immediate next generation.
    const next = createNextGeneration(this.gameBoard, this.rows, this.cols);

    // Compute the generation after the next. This two-step lookahead is
    // used to detect short cycles / stable states where the board
    // repeats after two generations.
    const afterNext = createNextGeneration(next, this.rows, this.cols);

    // If the current board equals afterNext, then the board has settled
    // into a repeating pattern with period <= 2, so we consider it final.
    this.isFinalState = matrixEquals(this.gameBoard, afterNext);

    if (this.isFinalState) {
      // If we had an animation scheduled, cancel it.
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.saveStats();
      return;
    }

    // Not final yet: install the computed `next` as the current board,
    // draw it and schedule another animation iteration.
    this.gameBoard = next;
    this.render(this.gameBoard);
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Save simple statistics about the run to the configured API.
   *
   * Behavior:
   * - If `apiUrl` is empty we skip the call (useful for local runs).
   * - The method POSTs a JSON payload with the number of iterations.
   * - Subscription logs success or failure to the console.
   */
  private saveStats(): void {
    if (!this.apiUrl) {
      console.warn('API URL not configured; skipping stats save');
      return;
    }
    const payload = { iterations: this.iterations };
    this.http.post(`${this.apiUrl}/stats`, payload).subscribe({
      next: (res) => console.log('Saved stats', res),
      error: (err) => console.error('Failed to save stats', err)
    });
  }

  /**
   * Render the given board to the canvas.
   *
   * For each cell we draw a filled rectangle (black for 1, white for 0)
   * and a light stroke to make the grid visible. The drawing is done in
   * pixel coordinates derived from the cell index and RESOLUTION.
   */
  private render(board: BitArray[]): void {
    const c = this.ctx;
    const res = RESOLUTION;

    // Clear the whole canvas before drawing the new state.
    c.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        // Fill cell: black for alive (1), white for dead (0).
        c.fillStyle = cell ? '#000' : '#fff';
        c.fillRect(x * res, y * res, res, res);

        // Draw a soft grid line to visually separate cells.
        c.strokeStyle = '#ddd';
        c.strokeRect(x * res, y * res, res, res);
      });
    });
  }
}
