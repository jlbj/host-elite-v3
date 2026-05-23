import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { SectionRendererComponent } from './section-renderer.component';
import { DEFAULT_BLOCK_HEIGHT } from '../constants/paving.constants';
import type { Block, Theme } from '../models/paving.types';

@Component({
  selector: 'app-block-renderer',
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  template: `
    @if (block().children && block().direction) {
      @if (isRoot()) {
        <div class="block-root-container">
          @for (child of block().children; track child.id; let childIndex = $index; let last = $last) {
            <div class="block-root-child">
              <app-block-renderer [block]="child" [theme]="theme()" [isRootChild]="true" />
              @if (!last) {
                <div class="block-separator-row" (mousedown)="startRowResize($event, childIndex)">
                  <div class="separator-line" [class.resizing]="isResizing"></div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div
          class="block-container"
          [class.flex-row]="block().direction === 'horizontal'"
          [class.flex-col]="block().direction !== 'horizontal'">
          @for (child of block().children; track child.id; let childIndex = $index; let last = $last) {
            <div class="block-child">
              <app-block-renderer [block]="child" [theme]="theme()" />
              @if (!last) {
                @if (block().direction === 'horizontal') {
                  <div class="block-separator-col" (mousedown)="startColResize($event, childIndex)">
                    <div class="separator-line-v" [class.resizing]="isResizing"></div>
                  </div>
                } @else {
                  <div class="block-separator-row" (mousedown)="startRowResize($event, childIndex)">
                    <div class="separator-line" [class.resizing]="isResizing"></div>
                  </div>
                }
              }
            </div>
          }
        </div>
      }
    } @else {
      @let section = getSection(block().sectionId);
      <div
        class="paving-block"
        [class.selected]="store.selectedBlockId() === block().id"
        [class.multi-selected]="store.selectedBlockIds().includes(block().id)"
        [style]="getBlockStyle()"
        (click)="handleBlockClick($event)"
        (dragover)="handleDragOver($event)"
        (dragleave)="dragOver.set(false)"
        (drop)="handleDrop($event)">
        @if (store.selectedBlockId() === block().id || section) {
          <div class="paving-block-toolbar">
            <span class="split-btn" (click)="$event.stopPropagation(); store.splitBlock(block().id, 'vertical')" title="Split V">✂</span>
            <span class="split-btn rotated" (click)="$event.stopPropagation(); store.splitBlock(block().id, 'horizontal')" title="Split H">✂</span>
          </div>
        }
        @if (section) {
          <app-section-renderer [section]="section" [theme]="theme()" [blockId]="block().id" />
        } @else {
          <div class="paving-block-empty" [class.has-toolbar]="store.selectedBlockId() === block().id">
            Drop section here
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockRendererComponent {
  block = input.required<Block>();
  theme = input<Theme | undefined>(undefined);
  isRoot = input(false);
  isRootChild = input(false);

  store = inject(PavingStoreService);
  dragOver = false;
  isResizing = false;

  getSection(sectionId: string | undefined) {
    if (!sectionId) return undefined;
    return this.store.pageConfig().sections.find(s => s.id === sectionId);
  }

  getBlockStyle(): Record<string, string | number | undefined> {
    const b = this.block();
    const section = this.getSection(b.sectionId);
    const isSelected = this.store.selectedBlockId() === b.id;
    const isMultiSelected = this.store.selectedBlockIds().includes(b.id);
    return {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      minHeight: b.height ? `${b.height}px` : section ? 'auto' : '187px',
      height: b.height ? `${b.height}px` : section ? 'auto' : undefined,
      flex: section ? 'none' : 1,
      outline: isSelected ? '2px solid #3b82f6' : isMultiSelected ? '2px dashed #3b82f6' : undefined,
      outlineOffset: '-1px',
      borderRadius: '4px',
    };
  }

  handleBlockClick(event: MouseEvent): void {
    event.stopPropagation();
    if (event.shiftKey) {
      this.store.toggleBlockSelection(this.block().id);
    } else {
      this.store.clearBlockSelection();
      this.store.setSelectedBlock(this.block().id);
    }
  }

  handleDragOver(event: DragEvent): void {
    if (event.dataTransfer?.types.includes('text/plain')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      this.dragOver = true;
    }
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const sectionId = event.dataTransfer?.getData('text/plain');
    if (sectionId) {
      if (this.block().sectionId === sectionId) {
        this.store.assignSectionToBlock(this.block().id, '');
      } else {
        this.store.assignSectionToBlock(this.block().id, sectionId);
        this.store.setSelectedSection(sectionId);
      }
    }
  }

  startRowResize(event: MouseEvent, childIndex: number): void {
    event.preventDefault();
    this.isResizing = true;
    const startY = event.clientY;
    const children = this.block().children || [];
    const currentChild = children[childIndex];
    const nextChild = children[childIndex + 1];
    const startHeight = (currentChild?.height || DEFAULT_BLOCK_HEIGHT) + (nextChild?.height || DEFAULT_BLOCK_HEIGHT);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const firstHeight = Math.max(50, Math.min(startHeight - 50, (currentChild?.height || DEFAULT_BLOCK_HEIGHT) + (moveEvent.clientY - startY)));
      const secondHeight = startHeight - firstHeight;
      this.updateChildHeights(childIndex, firstHeight, secondHeight);
    };

    const handleMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  startColResize(event: MouseEvent, childIndex: number): void {
    event.preventDefault();
    this.isResizing = true;
    const startX = event.clientX;
    const children = this.block().children || [];
    const currentChild = children[childIndex];
    const nextChild = children[childIndex + 1];
    const startWidths = [currentChild?.width || 100, nextChild?.width || 100];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const totalWidth = startWidths[0] + startWidths[1];
      const firstWidth = Math.max(50, Math.min(totalWidth - 50, startWidths[0] + (moveEvent.clientX - startX)));
      const secondWidth = totalWidth - firstWidth;
      this.updateChildWidths(childIndex, firstWidth, secondWidth);
    };

    const handleMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private updateChildHeights(index: number, firstHeight: number, secondHeight: number): void {
    const root = this.store.pageConfig().rootBlock;
    if (!root?.children) return;
    const updated = this.updateBlockInTree(index, firstHeight, secondHeight, root);
    this.store.pageConfig.update(pc => ({ ...pc, rootBlock: updated }));
  }

  private updateChildWidths(index: number, firstWidth: number, secondWidth: number): void {
    const root = this.store.pageConfig().rootBlock;
    if (!root?.children) return;
    const updated = this.updateBlockInTree(index, firstWidth, secondWidth, root, 'width');
    this.store.pageConfig.update(pc => ({ ...pc, rootBlock: updated }));
  }

  private updateBlockInTree(
    childIndex: number,
    first: number,
    second: number,
    node: Block,
    dim: 'height' | 'width' = 'height'
  ): Block {
    if (!node.children) return node;
    const newChildren = node.children.map((c, i) => {
      if (i === childIndex) return { ...c, [dim]: first };
      if (i === childIndex + 1) return { ...c, [dim]: second };
      return c;
    });
    return { ...node, children: newChildren };
  }
}
