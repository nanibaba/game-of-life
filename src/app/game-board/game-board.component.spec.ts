import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameBoardComponent } from './game-board.component';
import { ConfigService } from '../config.service';
import { ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { createNextGeneration } from './cellHandler';

describe('GameBoardComponent', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;
  let configService: ConfigService;
  let canvasEl: HTMLCanvasElement;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    canvasEl = document.createElement('canvas');
    canvasEl.width = 800;
    canvasEl.height = 800;

    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);
    mockHttpClient.post.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      imports: [
        GameBoardComponent
      ],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ConfigService, useValue: { apiUrl: '' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
    component.canvas = new ElementRef(canvasEl);
    configService = TestBed.inject(ConfigService);

    // Initialize board before running tests
    component.ngAfterViewInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize board after view init', () => {
    component.ngAfterViewInit();
    expect(component.gameBoard).toBeDefined();
    expect(component.gameBoard.length).toBeGreaterThan(0);
    expect(component.gameBoard[0].length).toBeGreaterThan(0);
  });

  it('should initialize canvas with correct dimensions', () => {
    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    expect(canvas.width).toBe(800); // BOARD_WIDTH
    expect(canvas.height).toBe(800); // BOARD_HEIGHT
  });

  it('should animate game board', fakeAsync(() => {
    component.ngAfterViewInit();
    const initialBoard = component.gameBoard.map(row => [...row]);

    // Force a few animation frames
    for (let i = 0; i < 3; i++) {
      tick(16); // Simulate ~60fps
    }

    // Board should have changed from initial state
    expect(component.gameBoard).not.toEqual(initialBoard);
  }));

  it('should render board correctly', () => {
    component.ngAfterViewInit();
    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    // Spy on context methods
    const fillRectSpy = spyOn(ctx, 'fillRect');
    const strokeRectSpy = spyOn(ctx, 'strokeRect');

    component['render'](component.gameBoard);

    expect(fillRectSpy).toHaveBeenCalled();
    expect(strokeRectSpy).toHaveBeenCalled();
  });

  it('should create board with correct dimensions', () => {
    const expectedRows = 800 / 10; // BOARD_HEIGHT / RESOLUTION
    const expectedCols = 800 / 10; // BOARD_WIDTH / RESOLUTION

    expect(component.gameBoard.length).toBe(expectedRows);
    expect(component.gameBoard[0].length).toBe(expectedCols);
  });

  it('should properly initialize cells with binary values', () => {
    const allCellsAreBinary = component.gameBoard.every(row =>
      row.every(cell => cell === 0 || cell === 1)
    );
    expect(allCellsAreBinary).toBe(true);
  });

  it('should evolve stable patterns correctly', fakeAsync(() => {
    // Create a stable block pattern
    const centerRow = Math.floor(component.gameBoard.length / 2);
    const centerCol = Math.floor(component.gameBoard[0].length / 2);

    // Clear the board
    component.gameBoard = component.gameBoard.map(row => row.map(() => 0));

    // Set up a block pattern (2x2)
    component.gameBoard[centerRow][centerCol] = 1;
    component.gameBoard[centerRow][centerCol + 1] = 1;
    component.gameBoard[centerRow + 1][centerCol] = 1;
    component.gameBoard[centerRow + 1][centerCol + 1] = 1;

    const initialState = component.gameBoard.map(row => [...row]);

    // Run multiple generations
    for (let i = 0; i < 5; i++) {
      tick(16);
    }

    // Block pattern should remain unchanged
    expect(component.gameBoard).toEqual(initialState);
  }));

  it('should evolve oscillating patterns correctly', () => {
    // Create a blinker pattern
    const centerRow = Math.floor(component.gameBoard.length / 2);
    const centerCol = Math.floor(component.gameBoard[0].length / 2);

    // Clear the board
    for (let i = 0; i < component.gameBoard.length; i++) {
      for (let j = 0; j < component.gameBoard[0].length; j++) {
        component.gameBoard[i][j] = 0;
      }
    }

    // Set up a vertical blinker
    component.gameBoard[centerRow - 1][centerCol] = 1;
    component.gameBoard[centerRow][centerCol] = 1;
    component.gameBoard[centerRow + 1][centerCol] = 1;

    // Get first generation - should be horizontal
    const gen1 = createNextGeneration(component.gameBoard, component.gameBoard.length, component.gameBoard[0].length);

    // Verify horizontal pattern
    expect(gen1[centerRow][centerCol - 1]).toBe(1, 'Left cell should be alive in horizontal state');
    expect(gen1[centerRow][centerCol]).toBe(1, 'Center cell should be alive in horizontal state');
    expect(gen1[centerRow][centerCol + 1]).toBe(1, 'Right cell should be alive in horizontal state');

    // Get second generation - should be back to vertical
    const gen2 = createNextGeneration(gen1, component.gameBoard.length, component.gameBoard[0].length);

    // Verify back to vertical pattern
    expect(gen2[centerRow - 1][centerCol]).toBe(1, 'Top cell should be alive in vertical state');
    expect(gen2[centerRow][centerCol]).toBe(1, 'Center cell should be alive in vertical state');
    expect(gen2[centerRow + 1][centerCol]).toBe(1, 'Bottom cell should be alive in vertical state');
  });

  it('should handle cell death by underpopulation', () => {
    const centerRow = Math.floor(component.gameBoard.length / 2);
    const centerCol = Math.floor(component.gameBoard[0].length / 2);

    // Clear board and add test pattern
    for (let i = 0; i < component.gameBoard.length; i++) {
      for (let j = 0; j < component.gameBoard[0].length; j++) {
        component.gameBoard[i][j] = 0;
      }
    }
    component.gameBoard[centerRow][centerCol] = 1;

    // Calculate next generation directly
    const nextGen = createNextGeneration(component.gameBoard, component.gameBoard.length, component.gameBoard[0].length);

    // Cell should have died due to underpopulation
    expect(nextGen[centerRow][centerCol]).toBe(0);
  });
});
