import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionRendererComponent } from './section-renderer.component';
import type { Section, SectionType, SectionStyle } from '../models/paving.types';

export interface PavingBlockSection {
  id: string;
  color: string;
  type: SectionType;
  requestedWidth: number;
  requestedHeight: number;
  displayMode: 'LOCKED' | 'UNLOCKED';
  style?: SectionStyle;
}

export interface PavingBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  section: PavingBlockSection;
}

export interface AdjacentEdges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

@Component({
  selector: 'app-paving-block',
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  template: `
    <div
      class="paving-block"
      [class.selected]="isSelected()"
      [class.deleting]="isSmall()"
      [style.left.px]="block().x"
      [style.top.px]="block().y"
      [style.width.px]="block().w"
      [style.height.px]="block().h"
      (click)="onClick($event)"
      (dblclick)="onDblClick($event)"
      (dragover)="$event.preventDefault()"
      (drop)="onDrop($event)"
    >
      @if (isSelected() && editorMode() === 'layout') {
        @if (adjacentEdges().top) { <div class="paving-handle paving-handle-top"></div> }
        @if (adjacentEdges().right) { <div class="paving-handle paving-handle-right"></div> }
        @if (adjacentEdges().bottom) { <div class="paving-handle paving-handle-bottom"></div> }
        @if (adjacentEdges().left) { <div class="paving-handle paving-handle-left"></div> }
      }

      @if (block().section.id !== 'S0' && editorMode() === 'layout') {
        <div
          class="paving-lock-btn"
          (mousedown)="onLockDrag($event)"
        >
          @if (isLocked()) {
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-lock">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
          } @else {
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-unlock">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
          }
        </div>
      }

      <div class="paving-block-inner">
        @if (isSmall() && editorMode() === 'layout') {
          <div class="paving-delete-overlay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
        }
        <div
          class="paving-block-fill"
          [attr.data-default]="block().section.id === 'S0'"
          [style.background-color]="block().section.id === 'S0' ? '#f1f5f9' : undefined"
          [style.border-radius]="block().section.id !== 'S0' ? '4px' : ''"
        >
          @if (block().section.id !== 'S0') {
            @if (sectionObj()) {
              <app-section-renderer
                [section]="sectionObj()!"
                [blockId]="block().id"
                [blockStyle]="sectionObj()!.style"
              />
            } @else {
              <div class="paving-block-label-wrapper">
                <span class="paving-block-label">{{ block().section.id }}</span>
                @if (sectionName()) {
                  <span class="paving-block-section-name">{{ sectionName() }}</span>
                }
              </div>
            }
          } @else {
            <div class="paving-block-label-wrapper">
              <span class="paving-block-label">Empty</span>
            </div>
          }
        </div>

        @if (editorMode() === 'layout') {
        <div class="paving-block-overlay">
          <button class="paving-split-btn" (click)="onSplitV($event)" title="Split Vertical">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="paving-icon-rotated">
              <circle cx="6" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <line x1="8.12" y1="8.12" x2="15.88" y2="15.88"></line>
              <line x1="8.12" y1="15.88" x2="15.88" y2="8.12"></line>
            </svg>
          </button>
          <button class="paving-split-btn" (click)="onSplitH($event)" title="Split Horizontal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="6" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <line x1="8.12" y1="8.12" x2="15.88" y2="15.88"></line>
              <line x1="8.12" y1="15.88" x2="15.88" y2="8.12"></line>
            </svg>
          </button>
        </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PavingBlockComponent {
  block = input.required<PavingBlock>();
  isSelected = input(false);
  editorMode = input<'display' | 'layout' | 'config'>('display');
  frameWidth = input(0);
  adjacentEdges = input<AdjacentEdges>({ top: false, right: false, bottom: false, left: false });
  sectionName = input<string | null>(null);
  sectionObj = input<Section | null>(null);
  isSmall = input(false);

  blockClick = output<{ event: MouseEvent; block: PavingBlock }>();
  blockDoubleClick = output<{ event: MouseEvent; block: PavingBlock }>();
  splitVertical = output<string>();
  splitHorizontal = output<string>();
  toggleLock = output<string>();
  blockDrop = output<{ blockId: string; data: string }>();
  lockDragStart = output<string>();

  isLocked(): boolean {
    return this.block().section.id !== 'S0' && this.block().section.displayMode === 'LOCKED';
  }

  onClick(event: MouseEvent): void {
    this.blockClick.emit({ event, block: this.block() });
  }

  onDblClick(event: MouseEvent): void {
    this.blockDoubleClick.emit({ event, block: this.block() });
  }

  onSplitV(event: MouseEvent): void {
    event.stopPropagation();
    this.splitVertical.emit(this.block().id);
  }

  onSplitH(event: MouseEvent): void {
    event.stopPropagation();
    this.splitHorizontal.emit(this.block().id);
  }

  onToggleLock(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleLock.emit(this.block().id);
  }

  onLockDrag(event: MouseEvent): void {
    event.stopPropagation();
    this.lockDragStart.emit(this.block().id);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('section');
    if (data) {
      this.blockDrop.emit({ blockId: this.block().id, data });
    }
  }
}
