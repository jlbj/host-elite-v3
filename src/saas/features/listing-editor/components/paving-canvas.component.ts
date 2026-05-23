import { Component, OnInit, AfterViewInit, OnDestroy, effect, signal, computed, inject, viewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { SECTION_TYPES, SECTION_LIBRARY, generateBlockId } from '../constants/paving.constants';
import { PavingBlockComponent, type PavingBlock, type AdjacentEdges } from './paving-block.component';
import type { Section, SectionType, GridBlock } from '../models/paving.types';

const TARGET_VIEW_HEIGHT = 600;
const DELETE_THRESHOLD = 15;
const SNAP_THRESHOLD = 10;
const BORDER_HIT_AREA = 8;
const EPSILON = 1;

interface ActiveEdge {
  orientation: 'V' | 'H';
  coordinate: number;
  affectedA: string[];
  affectedB: string[];
}

interface History {
  past: PavingBlock[][];
  future: PavingBlock[][];
}

function refreshLayoutPositions(currentBlocks: PavingBlock[]): PavingBlock[] {
  if (currentBlocks.length === 0) return [];
  const sorted = [...currentBlocks].sort((a, b) => a.y - b.y || a.x - b.x);
  const segments: { y: number; h: number; blockIds: string[] }[] = [];
  sorted.forEach(block => {
    const segment = segments.find(s => Math.abs(s.y - block.y) < EPSILON);
    if (segment) {
      segment.blockIds.push(block.id);
      segment.h = Math.max(segment.h, block.h);
    } else {
      segments.push({ y: block.y, h: block.h, blockIds: [block.id] });
    }
  });
  let currentY = 0;
  const updated = [...currentBlocks];
  segments.forEach(seg => {
    seg.blockIds.forEach(id => {
      const bIdx = updated.findIndex(b => b.id === id);
      updated[bIdx] = { ...updated[bIdx], y: currentY, h: seg.h };
    });
    currentY += seg.h;
  });
  return updated;
}

@Component({
  selector: 'app-paving-canvas',
  standalone: true,
  imports: [CommonModule, PavingBlockComponent],
  templateUrl: './paving-canvas.component.html',
  styleUrls: ['../styles/paving-editor.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PavingCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  store = inject(PavingStoreService);

  _blocks = signal<PavingBlock[]>([]);
  _history = signal<History>({ past: [], future: [] });
  _activeEdge = signal<ActiveEdge | null>(null);
  _message = signal<string | null>(null);
  _canvasActualWidth = signal(800);
  _frameWidth = computed(() => Math.max(400, this._canvasActualWidth()));
  _canvasHeight = computed(() => {
    const b = this._blocks();
    return Math.max(TARGET_VIEW_HEIGHT, 0, ...b.map(bl => bl.y + bl.h)) + 100;
  });
  _minSize = computed(() => Math.max(50, this._frameWidth() / 16));

  private _canvasRef = viewChild<ElementRef<HTMLElement>>('canvasRef');
  private _wrapperRef = viewChild<ElementRef<HTMLElement>>('wrapperRef');
  private _clickTimeout: ReturnType<typeof setTimeout> | null = null;
  private _initialized = false;
  private _resizeObserver: ResizeObserver | null = null;
  private _prevFrameWidth = signal(0);
  private _resizeBlockTimer: ReturnType<typeof setTimeout> | null = null;

  adjacentEdgesMap = computed(() => {
    const blockList = this._blocks();
    const selected = this.store.selectedBlockIds();
    const map = new Map<string, AdjacentEdges>();
    for (const block of blockList) {
      if (selected.includes(block.id)) {
        map.set(block.id, getAdjacentEdges(block.id, blockList));
      }
    }
    return map;
  });

  sectionNameMap = computed(() => {
    const blockList = this._blocks();
    const storeBlocks = this.store.gridBlocks();
    const storeSections = this.store.pageConfig().sections;
    const map = new Map<string, string | null>();
    for (const block of blockList) {
      const gb = storeBlocks.find(g => g.id === block.id);
      if (gb?.sectionId) {
        const section = storeSections.find(s => s.id === gb.sectionId);
        if (section) {
          const info = SECTION_TYPES.find(st => st.type === section.type);
          map.set(block.id, info ? `${info.icon} ${info.label}` : section.type);
        } else {
          map.set(block.id, null);
        }
      } else {
        map.set(block.id, null);
      }
    }
    return map;
  });

  sectionMap = computed(() => {
    const blockList = this._blocks();
    const storeBlocks = this.store.gridBlocks();
    const storeSections = this.store.pageConfig().sections;
    const map = new Map<string, Section | null>();
    for (const block of blockList) {
      const gb = storeBlocks.find(g => g.id === block.id);
      if (gb?.sectionId) {
        const section = storeSections.find(s => s.id === gb.sectionId) || null;
        map.set(block.id, section);
      } else {
        map.set(block.id, null);
      }
    }
    return map;
  });

  isLayoutEditing = computed(() => this.store.editorMode() === 'layout');

  constructor() {
    effect(() => {
      const currentBlocks = this._blocks();
      if (!this._initialized || currentBlocks.length === 0) return;

      const currentGridBlocks = this.store.gridBlocks();
      const next: GridBlock[] = currentBlocks.map(b => {
        const existing = currentGridBlocks.find(g => g.id === b.id);
        return {
          id: b.id,
          sectionId: b.section.id !== 'S0' ? b.section.id : undefined,
          row: 0,
          col: 0,
          bounds: { top: b.y, left: b.x, right: b.x + b.w, bottom: b.y + b.h },
          displayMode: b.section.displayMode,
          blockStyle: existing?.blockStyle,
        };
      });

      const prev = currentGridBlocks;
      const changed = prev.length !== next.length || prev.some((g, i) =>
        g.id !== next[i]?.id ||
        g.bounds.top !== next[i].bounds.top ||
        g.bounds.left !== next[i].bounds.left ||
        g.bounds.right !== next[i].bounds.right ||
        g.bounds.bottom !== next[i].bounds.bottom ||
        g.sectionId !== next[i].sectionId
      );

      if (changed) {
        this.store.setGridBlocks(next);
      }
    });

    effect(() => {
      const storeBlocks = this.store.gridBlocks();
      const sections = this.store.pageConfig().sections;
      if (!this._initialized) return;

      const localBlocks = this._blocks();
      let changed = false;
      const next: PavingBlock[] = localBlocks.map(b => {
        const gb = storeBlocks.find(g => g.id === b.id);
        if (gb?.sectionId && gb.sectionId !== b.section.id) {
          changed = true;
          const section = sections.find(s => s.id === gb.sectionId);
          const libItem = section ? SECTION_LIBRARY.find(item => item.type === section?.type) : null;
          return {
            ...b,
            section: {
              ...b.section,
              id: gb.sectionId,
              color: libItem?.color || '#3b82f6',
              type: section?.type || 'ADAPTIVE',
              displayMode: 'LOCKED',
              requestedWidth: (section?.content as any)?.requestedWidth || 0,
              requestedHeight: (section?.content as any)?.requestedHeight || 0,
              style: { ...(section?.style || {}), ...(gb.blockStyle || {}) },
            },
          };
        }
        if (gb && !gb.sectionId && b.section.id !== 'S0') {
          changed = true;
          return {
            ...b,
            section: { ...b.section, id: 'S0', color: '#1e293b', type: 'ADAPTIVE', displayMode: 'UNLOCKED', style: {} },
          };
        }
        return b;
      });

      if (changed) {
        this._blocks.set(next);
      }
    });

    effect(() => {
      const fw = this._frameWidth();
      const prev = this._prevFrameWidth();
      if (!this._initialized || prev === 0 || fw === prev) {
        this._prevFrameWidth.set(fw);
        return;
      }
      const scale = fw / prev;
      if (Math.abs(scale - 1) < 0.01) {
        this._prevFrameWidth.set(fw);
        return;
      }
      const blocks = this._blocks();
      if (blocks.length === 0) {
        this._prevFrameWidth.set(fw);
        return;
      }
      const allFullWidth = blocks.every(b => b.x === 0 && Math.abs(b.w - prev) < 2);
      if (allFullWidth) {
        this._blocks.update(prevBlocks =>
          prevBlocks.map(b => ({ ...b, w: fw }))
        );
      } else {
        this._blocks.update(prevBlocks =>
          prevBlocks.map(b => ({
            ...b,
            x: Math.round(b.x * scale),
            w: Math.max(50, Math.round(b.w * scale)),
          }))
        );
      }
      this._prevFrameWidth.set(fw);
    });
  }

  ngOnInit(): void {
    const storeGridBlocks = this.store.gridBlocks();
    const storeSections = this.store.pageConfig().sections;

    if (storeGridBlocks.length > 0) {
      this._blocks.set(storeGridBlocks.map(gb => {
        const section = gb.sectionId ? storeSections.find(s => s.id === gb.sectionId) : null;
        const sectionType: SectionType = section ? section.type : 'ADAPTIVE';
        const libItem = section ? SECTION_LIBRARY.find(item => item.type === sectionType) : null;
        return {
          id: gb.id,
          x: gb.bounds.left,
          y: gb.bounds.top,
          w: gb.bounds.right - gb.bounds.left,
          h: gb.bounds.bottom - gb.bounds.top,
          section: {
            id: gb.sectionId || 'S0',
            color: section ? libItem?.color || '#3b82f6' : '#1e293b',
            type: sectionType,
            requestedWidth: section ? (section.content as any)?.requestedWidth || 0 : 0,
            requestedHeight: section ? (section.content as any)?.requestedHeight || 0 : 0,
            displayMode: (gb.sectionId ? 'LOCKED' : 'UNLOCKED') as 'LOCKED' | 'UNLOCKED',
            style: { ...(section?.style || {}), ...(gb.blockStyle || {}) },
          },
        };
      }));
    } else {
      const initialH = TARGET_VIEW_HEIGHT / 4;
      const initBlocks = Array.from({ length: 4 }).map((_, i) => ({
        id: generateBlockId(),
        x: 0,
        y: i * initialH,
        w: this._frameWidth(),
        h: initialH,
        section: {
          id: 'S0' as const,
          color: '#1e293b',
          type: 'ADAPTIVE' as SectionType,
          requestedWidth: 200,
          requestedHeight: 150,
          displayMode: 'UNLOCKED' as 'LOCKED' | 'UNLOCKED',
        },
      }));
      this._blocks.set(initBlocks);
    }

    this._initialized = true;
    this._prevFrameWidth.set(this._frameWidth());
  }

  ngAfterViewInit(): void {
    const el = this._canvasRef()?.nativeElement;
    if (el) {
      this._canvasActualWidth.set(el.clientWidth);
      this._resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (w > 0) this._canvasActualWidth.set(Math.round(w));
        }
      });
      this._resizeObserver.observe(el);
    }
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  saveHistory(): void {
    this._history.update(prev => ({
      past: [...prev.past.slice(-29), this._blocks()],
      future: [],
    }));
  }

  undo(): void {
    const h = this._history();
    if (h.past.length === 0) return;
    const previous = h.past[h.past.length - 1];
    this._history.set({ past: h.past.slice(0, -1), future: [this._blocks(), ...h.future] });
    this._blocks.set(previous);
    this.store.clearBlockSelection();
  }

  redo(): void {
    const h = this._history();
    if (h.future.length === 0) return;
    const next = h.future[0];
    this._history.set({ past: [...h.past, this._blocks()], future: h.future.slice(1) });
    this._blocks.set(next);
    this.store.clearBlockSelection();
  }

  handleSplitV(id: string): void {
    const blocks = this._blocks();
    const idx = blocks.findIndex(b => b.id === id);
    const target = blocks[idx];
    if (!target || target.w < this._minSize() * 2) {
      this._message.set(`Block too narrow to split (min ${this._minSize()}px)`);
      setTimeout(() => this._message.set(null), 2000);
      return;
    }
    this.saveHistory();
    const halfW = Math.round(target.w / 2);
    const newBlock: PavingBlock = {
      ...target,
      id: generateBlockId(),
      x: target.x + halfW,
      w: target.w - halfW,
      section: { ...target.section, id: 'S0', color: '#1e293b', type: 'ADAPTIVE', displayMode: 'UNLOCKED' },
    };
    const updated = [...blocks];
    updated[idx] = { ...target, w: halfW };
    updated.splice(idx + 1, 0, newBlock);
    this._blocks.set(updated);
  }

  handleSplitH(id: string): void {
    const blocks = this._blocks();
    const idx = blocks.findIndex(b => b.id === id);
    const target = blocks[idx];
    if (!target || target.h < this._minSize() * 2) {
      this._message.set(`Block too short to split (min ${this._minSize()}px)`);
      setTimeout(() => this._message.set(null), 2000);
      return;
    }
    this.saveHistory();
    const halfH = Math.round(target.h / 2);
    const newBlock: PavingBlock = {
      ...target,
      id: generateBlockId(),
      y: target.y + halfH,
      h: target.h - halfH,
      section: { ...target.section, id: 'S0', color: '#1e293b', type: 'ADAPTIVE', displayMode: 'UNLOCKED' },
    };
    const updated = [...blocks];
    updated[idx] = { ...target, h: halfH };
    updated.splice(idx + 1, 0, newBlock);
    this._blocks.set(updated);
  }

  handleMerge(): void {
    const selected = this.store.selectedBlockIds();
    if (selected.length !== 2) return;

    const blocks = this._blocks();
    const b1 = blocks.find(b => b.id === selected[0]);
    const b2 = blocks.find(b => b.id === selected[1]);
    if (!b1 || !b2) return;

    const touchX = Math.abs(b1.x + b1.w - b2.x) < EPSILON || Math.abs(b2.x + b2.w - b1.x) < EPSILON;
    const touchY = Math.abs(b1.y + b1.h - b2.y) < EPSILON || Math.abs(b2.y + b2.h - b1.y) < EPSILON;
    const overlapY = Math.max(b1.y, b2.y) < Math.min(b1.y + b1.h, b2.y + b2.h);
    const overlapX = Math.max(b1.x, b2.x) < Math.min(b1.x + b1.w, b2.x + b2.w);
    const adjacent = (touchX && overlapY) || (touchY && overlapX);
    const newX = Math.min(b1.x, b2.x);
    const newY = Math.min(b1.y, b2.y);
    const newW = Math.max(b1.x + b1.w, b2.x + b2.w) - newX;
    const newH = Math.max(b1.y + b1.h, b2.y + b2.h) - newY;
    const areaSum = (b1.w * b1.h) + (b2.w * b2.h);

    if (!adjacent || Math.abs(areaSum - (newW * newH)) > 10) {
      this._message.set('Merge failed: Blocks must form a perfect rectangle.');
      setTimeout(() => this._message.set(null), 2000);
      return;
    }

    this.saveHistory();
    const merged: PavingBlock = {
      id: generateBlockId(),
      x: newX,
      y: newY,
      w: newW,
      h: newH,
      section: { ...b1.section },
    };
    this._blocks.set(refreshLayoutPositions([...blocks.filter(b => !selected.includes(b.id)), merged]));
    this.store.clearBlockSelection();
  }

  handleAddBlock(): void {
    this.saveHistory();
    const maxBottom = this._blocks().length > 0 ? Math.max(...this._blocks().map(b => b.y + b.h)) : 0;
    const newBlock: PavingBlock = {
      id: generateBlockId(),
      x: 0,
      y: maxBottom,
      w: this._frameWidth(),
      h: Math.max(100, TARGET_VIEW_HEIGHT / 6),
      section: { id: 'S0', color: '#1e293b', type: 'ADAPTIVE', requestedWidth: 200, requestedHeight: 150, displayMode: 'UNLOCKED' },
    };
    this._blocks.update(prev => [...prev, newBlock]);
    this.store.setSelectedBlock(newBlock.id);
  }

  handleToggleLock(id: string): void {
    this.saveHistory();
    this._blocks.update(prev => prev.map(b =>
      b.id === id
        ? { ...b, section: { ...b.section, displayMode: b.section.displayMode === 'LOCKED' ? 'UNLOCKED' : 'LOCKED' } }
        : b
    ));
  }

  handleBlockDrop(evt: { blockId: string; data: string }): void {
    const libSection = JSON.parse(evt.data);
    this.saveHistory();
    this._blocks.update(prev => prev.map(b =>
      b.id === evt.blockId
        ? {
            ...b,
            section: {
              id: libSection.id,
              color: libSection.color,
              type: libSection.type,
              requestedWidth: libSection.rW || 0,
              requestedHeight: libSection.rH || 0,
              displayMode: libSection.id === 'S0' ? 'UNLOCKED' : 'LOCKED',
            },
          }
        : b
    ));
  }

  onBlockClick(evt: { event: MouseEvent; block: PavingBlock }): void {
    const { event: e, block } = evt;
    const editorMode = this.store.editorMode();

    if (editorMode === 'layout') {
      const isShift = e.shiftKey;
      const isSelected = this.store.selectedBlockIds().includes(block.id);
      let next: string[];
      if (isShift) {
        if (isSelected) {
          next = this.store.selectedBlockIds().filter(id => id !== block.id);
        } else {
          next = [...this.store.selectedBlockIds(), block.id].slice(0, 2);
        }
      } else {
        next = [block.id];
      }
      this.store.clearBlockSelection();
      if (next.length === 1) {
        this.store.setSelectedBlock(next[0]);
      } else {
        this.store.selectedBlockIds.set(next);
        this.store.selectedBlockId.set(null);
      }
      return;
    }

    if (editorMode === 'display') {
      if (this._clickTimeout) {
        clearTimeout(this._clickTimeout);
        this._clickTimeout = null;
      }
      this._clickTimeout = setTimeout(() => {
        this.store.setEditorMode('layout');
        this.store.setSelectedBlock(block.id);
        this.store.sidebarOpen.set(false);
        this._clickTimeout = null;
      }, 250);
    }
  }

  onBlockDoubleClick(evt: { event: MouseEvent; block: PavingBlock }): void {
    const block = evt.block;
    if (this._clickTimeout) {
      clearTimeout(this._clickTimeout);
      this._clickTimeout = null;
    }

    const editorMode = this.store.editorMode();
    if (editorMode === 'display' || editorMode === 'config') {
      this.store.setEditorMode('config');
      this.store.setSelectedBlock(block.id);
      const isS0 = block.section.id === 'S0';
      this.store.sidebarOpen.set(true);
      this.store.setSelectedSection(isS0 ? null : block.section.id);
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (this.store.editorMode() !== 'layout') return;
    const canvasEl = this._canvasRef()?.nativeElement;
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const blocks = this._blocks();
    for (const b of blocks) {
      if (Math.abs(mx - (b.x + b.w)) < BORDER_HIT_AREA && my >= b.y && my <= b.y + b.h && b.x + b.w < this._frameWidth()) {
        this.saveHistory();
        this._activeEdge.set({
          orientation: 'V',
          coordinate: b.x + b.w,
          affectedA: blocks.filter(bl => Math.abs(bl.x + bl.w - (b.x + b.w)) < EPSILON).map(bl => bl.id),
          affectedB: blocks.filter(bl => Math.abs(bl.x - (b.x + b.w)) < EPSILON).map(bl => bl.id),
        });
        return;
      }
      if (Math.abs(my - (b.y + b.h)) < BORDER_HIT_AREA && mx >= b.x && mx <= b.x + b.w) {
        this.saveHistory();
        this._activeEdge.set({
          orientation: 'H',
          coordinate: b.y + b.h,
          affectedA: blocks.filter(bl => Math.abs(bl.y + bl.h - (b.y + b.h)) < EPSILON).map(bl => bl.id),
          affectedB: blocks.filter(bl => Math.abs(bl.y - (b.y + b.h)) < EPSILON).map(bl => bl.id),
        });
        return;
      }
      if (Math.abs(mx - b.x) < BORDER_HIT_AREA && my >= b.y && my <= b.y + b.h) {
        this.saveHistory();
        this._activeEdge.set({
          orientation: 'V',
          coordinate: b.x,
          affectedA: blocks.filter(bl => Math.abs(bl.x - b.x) < EPSILON).map(bl => bl.id),
          affectedB: blocks.filter(bl => Math.abs(bl.x + bl.w - b.x) < EPSILON).map(bl => bl.id),
        });
        return;
      }
      if (Math.abs(my - b.y) < BORDER_HIT_AREA && mx >= b.x && mx <= b.x + b.w) {
        this.saveHistory();
        this._activeEdge.set({
          orientation: 'H',
          coordinate: b.y,
          affectedA: blocks.filter(bl => Math.abs(bl.y - b.y) < EPSILON).map(bl => bl.id),
          affectedB: blocks.filter(bl => Math.abs(bl.y + bl.h - b.y) < EPSILON).map(bl => bl.id),
        });
        return;
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    const ae = this._activeEdge();
    if (!ae) return;
    const canvasEl = this._canvasRef()?.nativeElement;
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const rawPos = ae.orientation === 'V' ? event.clientX - rect.left : event.clientY - rect.top;

    let pos = rawPos;
    if (ae.orientation === 'V') {
      pos = Math.max(0, Math.min(this._frameWidth(), pos));
    } else {
      pos = Math.max(0, pos);
    }

    const snapPoints = new Set<number>();
    if (ae.orientation === 'V') {
      snapPoints.add(0);
      snapPoints.add(this._frameWidth());
      this._blocks().forEach(b => { snapPoints.add(b.x); snapPoints.add(b.x + b.w); });
    } else {
      snapPoints.add(0);
      this._blocks().forEach(b => { snapPoints.add(b.y); snapPoints.add(b.y + b.h); });
    }
    for (const point of snapPoints) {
      if (Math.abs(pos - point) < SNAP_THRESHOLD) { pos = point; break; }
    }

    const initialCoord = ae.coordinate;
    const checkClamping = (blockIds: string[], type: 'A' | 'B') => {
      for (const id of blockIds) {
        const b = this._blocks().find(x => x.id === id);
        if (!b) continue;
        let newDim: number;
        if (type === 'A') {
          newDim = (ae.orientation === 'V' ? b.w : b.h) + (pos - initialCoord);
        } else {
          newDim = (ae.orientation === 'V' ? b.w : b.h) - (pos - initialCoord);
        }
        if (newDim < this._minSize() && newDim > DELETE_THRESHOLD) {
          if (type === 'A') {
            pos = ae.orientation === 'V' ? b.x + this._minSize() : b.y + this._minSize();
          } else {
            pos = ae.orientation === 'V' ? (b.x + b.w) - this._minSize() : (b.y + b.h) - this._minSize();
          }
        } else if (newDim <= DELETE_THRESHOLD) {
          pos = type === 'A'
            ? (ae.orientation === 'V' ? b.x : b.y)
            : (ae.orientation === 'V' ? b.x + b.w : b.y + b.h);
        }
      }
    };
    checkClamping(ae.affectedA, 'A');
    checkClamping(ae.affectedB, 'B');

    const delta = pos - ae.coordinate;
    this._blocks.update(prev => {
      const next = prev.map(b => {
        if (ae.affectedA.includes(b.id)) {
          return ae.orientation === 'V' ? { ...b, w: b.w + delta } : { ...b, h: b.h + delta };
        }
        if (ae.affectedB.includes(b.id)) {
          return ae.orientation === 'V' ? { ...b, x: b.x + delta, w: b.w - delta } : { ...b, y: b.y + delta, h: b.h - delta };
        }
        return b;
      });
      const kept = next.filter(b => b.w > 2 && b.h > 2);
      return kept.length !== next.length ? refreshLayoutPositions(kept) : next;
    });
    this._activeEdge.update(prev => prev ? { ...prev, coordinate: pos } : null);

    if (ae.orientation === 'H') {
      const wrapper = this._wrapperRef()?.nativeElement;
      if (wrapper) {
        const scrollBottom = wrapper.scrollTop + wrapper.clientHeight;
        if (pos > scrollBottom - 50) {
          wrapper.scrollTop = pos - wrapper.clientHeight + 100;
        }
      }
    }
  }

  onMouseUp(): void {
    this._activeEdge.set(null);
  }

  onBottomResizeStart(event: MouseEvent): void {
    event.stopPropagation();
    this.saveHistory();
    const blocks = this._blocks();
    const maxH = Math.max(...blocks.map(b => b.y + b.h));
    const bottomBlocks = blocks.filter(b => Math.abs(b.y + b.h - maxH) < EPSILON);
    if (bottomBlocks.length === 0) return;
    this._activeEdge.set({
      orientation: 'H',
      coordinate: maxH,
      affectedA: bottomBlocks.map(b => b.id),
      affectedB: [],
    });
  }

  onCanvasClick(event: MouseEvent): void {
    const canvasEl = this._canvasRef()?.nativeElement;
    if (canvasEl && event.target === canvasEl && this.store.editorMode() !== 'layout') {
      this.store.setEditorMode('display');
      this.store.clearBlockSelection();
      this.store.sidebarOpen.set(false);
    }
  }

  onWrapperClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.store.editorMode() !== 'layout') {
      this.store.setEditorMode('display');
      this.store.clearBlockSelection();
      this.store.sidebarOpen.set(false);
    }
  }
}

function getAdjacentEdges(blockId: string, allBlocks: PavingBlock[]): AdjacentEdges {
  const block = allBlocks.find(b => b.id === blockId);
  if (!block) return { top: false, right: false, bottom: false, left: false };

  return {
    top: allBlocks.some(b =>
      b.id !== blockId &&
      Math.abs(b.y + b.h - block.y) < 1 &&
      b.x < block.x + block.w && b.x + b.w > block.x
    ),
    right: allBlocks.some(b =>
      b.id !== blockId &&
      Math.abs(b.x - (block.x + block.w)) < 1 &&
      b.y < block.y + block.h && b.y + b.h > block.y
    ),
    bottom: allBlocks.some(b =>
      b.id !== blockId &&
      Math.abs(b.y - (block.y + block.h)) < 1 &&
      b.x < block.x + block.w && b.x + b.w > block.x
    ),
    left: allBlocks.some(b =>
      b.id !== blockId &&
      Math.abs(b.x + b.w - block.x) < 1 &&
      b.y < block.y + block.h && b.y + b.h > block.y
    ),
  };
}
