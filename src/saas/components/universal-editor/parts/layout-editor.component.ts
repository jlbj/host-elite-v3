import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Core interfaces for block editor
export interface EditorBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sectionId?: string;
  isLocked: boolean;
}

@Component({
  selector: 'app-layout-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-white/10">
      
      <!-- Toolbar -->
      <div class="flex items-center justify-between p-3 border-b border-white/10 bg-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-white">Layout Editor (Inline Mode)</span>
        </div>
        <div class="flex items-center gap-2">
          <!-- Zoom Controls -->
          <div class="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
            <button (click)="zoomOut()" class="p-1 rounded hover:bg-white/10" title="Zoom Out">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>
            <span class="text-xs text-white font-mono min-w-[45px] text-center">{{ zoomLevel() }}%</span>
            <button (click)="zoomIn()" class="p-1 rounded hover:bg-white/10" title="Zoom In">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <button (click)="fitToScreen()" class="p-1 rounded hover:bg-white/10 ml-1" title="Fit to Screen">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
            </button>
          </div>
          <button (click)="splitVertical()" [disabled]="!selectedBlockId()" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white disabled:opacity-50">Split V</button>
          <button (click)="splitHorizontal()" [disabled]="!selectedBlockId()" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white disabled:opacity-50">Split H</button>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="flex-1 overflow-auto relative p-4 bg-slate-950 flex justify-center" #canvasContainer>
        <div [style.transform]="'scale(' + (zoomLevel() / 100) + ')'" 
             [style.transformOrigin]="'top center'" 
             [style.transition]="'transform 0.2s ease'">
          <div class="relative bg-white shadow-xl" [style.width.px]="canvasWidth" [style.height.px]="canvasHeight">
            
            @for (block of blocks(); track block.id) {
              <div
                class="absolute border transition-colors cursor-pointer group"
                [class.border-purple-500]="selectedBlockId() === block.id"
                [class.border-slate-200]="selectedBlockId() !== block.id"
                [class.bg-purple-50]="selectedBlockId() === block.id"
                [class.bg-slate-50]="selectedBlockId() !== block.id"
                [style.left.px]="block.x"
                [style.top.px]="block.y"
                [style.width.px]="block.w"
                [style.height.px]="block.h"
                (click)="selectBlock(block.id)">
                
                <div class="w-full h-full flex flex-col items-center justify-center relative">
                  <span class="text-xs font-mono text-slate-400">{{ block.sectionId || 'Empty Block' }}</span>
                  
                  @if (selectedBlockId() === block.id) {
                    <div class="absolute inset-0 bg-purple-500/10 pointer-events-none"></div>
                  }
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class LayoutEditorComponent implements AfterViewInit {
  canvasWidth = 800;
  canvasHeight = 600;
  
  blocks = signal<EditorBlock[]>([]);
  selectedBlockId = signal<string | null>(null);
  zoomLevel = signal(100);
  
  @ViewChild('canvasContainer') canvasContainer?: ElementRef;
  
  private readonly ZOOM_STEP = 10;
  private readonly MIN_ZOOM = 25;
  private readonly MAX_ZOOM = 200;
  private userAdjustedZoom = false;
  
  constructor() {
    this.initDefaultGrid();
  }
  
  ngAfterViewInit() {
    setTimeout(() => this.fitToScreen(), 100);
  }
  
  initDefaultGrid() {
    // 4 equal rows by default
    const h = this.canvasHeight / 4;
    const initialBlocks: EditorBlock[] = Array.from({ length: 4 }).map((_, i) => ({
      id: `blk_${i}`,
      x: 0,
      y: i * h,
      w: this.canvasWidth,
      h: h,
      isLocked: false
    }));
    this.blocks.set(initialBlocks);
  }
  
  selectBlock(id: string) {
    if (this.selectedBlockId() === id) {
      this.selectedBlockId.set(null);
    } else {
      this.selectedBlockId.set(id);
    }
  }
  
  splitVertical() {
    const id = this.selectedBlockId();
    if (!id) return;
    
    this.blocks.update(current => {
      const idx = current.findIndex(b => b.id === id);
      if (idx === -1) return current;
      
      const target = current[idx];
      const halfW = Math.round(target.w / 2);
      
      const updated = [...current];
      updated[idx] = { ...target, w: halfW };
      
      const newBlock: EditorBlock = {
        id: `blk_${Date.now()}`,
        x: target.x + halfW,
        y: target.y,
        w: target.w - halfW,
        h: target.h,
        isLocked: false
      };
      
      updated.splice(idx + 1, 0, newBlock);
      return updated;
    });
  }
  
  splitHorizontal() {
    const id = this.selectedBlockId();
    if (!id) return;
    
    this.blocks.update(current => {
      const idx = current.findIndex(b => b.id === id);
      if (idx === -1) return current;
      
      const target = current[idx];
      const halfH = Math.round(target.h / 2);
      
      const updated = [...current];
      updated[idx] = { ...target, h: halfH };
      
      const newBlock: EditorBlock = {
        id: `blk_${Date.now()}`,
        x: target.x,
        y: target.y + halfH,
        w: target.w,
        h: target.h - halfH,
        isLocked: false
      };
      
      updated.splice(idx + 1, 0, newBlock);
      return updated;
    });
  }
  
  zoomIn() {
    this.userAdjustedZoom = true;
    const newZoom = Math.min(this.zoomLevel() + this.ZOOM_STEP, this.MAX_ZOOM);
    this.zoomLevel.set(newZoom);
  }

  zoomOut() {
    this.userAdjustedZoom = true;
    const newZoom = Math.max(this.zoomLevel() - this.ZOOM_STEP, this.MIN_ZOOM);
    this.zoomLevel.set(newZoom);
  }

  fitToScreen() {
    if (this.userAdjustedZoom) return;
    
    const container = this.canvasContainer?.nativeElement;
    if (!container) return;

    const containerWidth = container.clientWidth - 32;
    const containerHeight = container.clientHeight - 32;
    
    const widthZoom = (containerWidth / this.canvasWidth) * 100;
    const heightZoom = (containerHeight / this.canvasHeight) * 100;
    
    const fitZoom = Math.min(widthZoom, heightZoom, 100);
    const roundedZoom = Math.floor(fitZoom / 5) * 5;
    const finalZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, roundedZoom));
    
    this.zoomLevel.set(finalZoom);
  }
}
