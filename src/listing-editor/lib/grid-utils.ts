import type { GridBlock } from '../types';

const MIN_SIZE = 50;
const DELETE_THRESHOLD = 15;
const SNAP_THRESHOLD = 10;
const EPSILON = 1;

export interface Separator {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
  index: number;
  blockIds: string[];
  bounds: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

export function computeSeparators(blocks: GridBlock[], _containerWidth: number): Separator[] {
  const separators: Separator[] = [];

  const horizontalPositions = [...new Set(blocks.map(b => b.bounds.top))].sort((a, b) => a - b);
  let hIndex = 0;
  horizontalPositions.forEach((position) => {
    if (position === 0) return;
    const blocksAtPosition = blocks.filter(b =>
      Math.abs(b.bounds.top - position) < EPSILON
    );
    if (blocksAtPosition.length > 0) {
      const leftmost = Math.min(...blocksAtPosition.map(b => b.bounds.left));
      const rightmost = Math.max(...blocksAtPosition.map(b => b.bounds.right));
      const sepId = `sep_h_${position.toFixed(0)}`;
      separators.push({
        id: sepId,
        orientation: 'horizontal',
        position,
        index: hIndex++,
        blockIds: blocksAtPosition.map(b => b.id),
        bounds: {
          top: position - 4,
          left: leftmost,
          right: rightmost,
          bottom: position + 4,
        },
      });
    }
  });

  const verticalPositions = [...new Set(blocks.map(b => b.bounds.left))].sort((a, b) => a - b);
  let vIndex = 0;
  verticalPositions.forEach((position) => {
    if (position === 0) return;
    const blocksAtPosition = blocks.filter(b =>
      Math.abs(b.bounds.left - position) < EPSILON
    );
    if (blocksAtPosition.length > 0) {
      const topmost = Math.min(...blocksAtPosition.map(b => b.bounds.top));
      const bottommost = Math.max(...blocksAtPosition.map(b => b.bounds.bottom));
      const sepId = `sep_v_${position.toFixed(0)}`;
      separators.push({
        id: sepId,
        orientation: 'vertical',
        position,
        index: vIndex++,
        blockIds: blocksAtPosition.map(b => b.id),
        bounds: {
          top: topmost,
          left: position - 4,
          right: position + 4,
          bottom: bottommost,
        },
      });
    }
  });

  return separators;
}

export function initializeGridState(
  containerWidth: number,
  containerHeight: number,
  blockCount: number = 4
): GridBlock[] {
  const blockHeight = containerHeight / blockCount;
  
  return Array.from({ length: blockCount }, (_, i) => ({
    id: `blk_${i}_0`,
    sectionId: undefined,
    row: i,
    col: 0,
    bounds: {
      top: i * blockHeight,
      left: 0,
      right: containerWidth,
      bottom: (i + 1) * blockHeight,
    },
  }));
}

export function refreshLayoutPositions(blocks: GridBlock[]): GridBlock[] {
  if (blocks.length === 0) return [];
  
  const sorted = [...blocks].sort((a, b) => a.bounds.top - b.bounds.top || a.bounds.left - b.bounds.left);
  const segments: { y: number; h: number; blockIds: string[] }[] = [];
  
  sorted.forEach(block => {
    let segment = segments.find(s => Math.abs(s.y - block.bounds.top) < EPSILON);
    if (segment) {
      segment.blockIds.push(block.id);
      segment.h = Math.max(segment.h, block.bounds.bottom - block.bounds.top);
    } else {
      segments.push({ 
        y: block.bounds.top, 
        h: block.bounds.bottom - block.bounds.top, 
        blockIds: [block.id] 
      });
    }
  });
  
  let currentY = 0;
  const updated = blocks.map(block => {
    const segment = segments.find(s => s.blockIds.includes(block.id));
    if (segment) {
      return {
        ...block,
        bounds: {
          ...block.bounds,
          top: currentY,
          bottom: currentY + segment.h,
        },
      };
    }
    return block;
  });
  
  segments.forEach(seg => {
    currentY += seg.h;
  });
  
  return updated;
}

export function applyDragToBlocks(
  blocks: GridBlock[],
  activeEdge: { orientation: 'H' | 'V'; coordinate: number; affectedA: string[]; affectedB: string[] },
  newPos: number,
  containerWidth: number,
  _containerHeight: number
): { blocks: GridBlock[]; appliedPos: number } {
  const initialCoord = activeEdge.coordinate;
  
  const snapPoints = new Set<number>();
  if (activeEdge.orientation === 'V') {
    snapPoints.add(0);
    snapPoints.add(containerWidth);
    blocks.forEach(b => {
      snapPoints.add(b.bounds.left);
      snapPoints.add(b.bounds.left + (b.bounds.right - b.bounds.left));
    });
  } else {
    snapPoints.add(0);
    blocks.forEach(b => {
      snapPoints.add(b.bounds.top);
      snapPoints.add(b.bounds.top + (b.bounds.bottom - b.bounds.top));
    });
  }
  
  let pos = newPos;
  for (const point of snapPoints) {
    if (Math.abs(pos - point) < SNAP_THRESHOLD) {
      pos = point;
      break;
    }
  }
  
  const checkClamping = (blockIds: string[], type: 'A' | 'B') => {
    for (const id of blockIds) {
      const b = blocks.find(x => x.id === id);
      if (!b) continue;
      
      const width = b.bounds.right - b.bounds.left;
      const height = b.bounds.bottom - b.bounds.top;
      
      let newDim: number;
      if (type === 'A') {
        newDim = (activeEdge.orientation === 'V' ? width : height) + (pos - initialCoord);
      } else {
        newDim = (activeEdge.orientation === 'V' ? width : height) - (pos - initialCoord);
      }
      
      if (newDim < MIN_SIZE && newDim > DELETE_THRESHOLD) {
        if (type === 'A') {
          pos = activeEdge.orientation === 'V' 
            ? (activeEdge.coordinate - (MIN_SIZE - newDim))
            : (activeEdge.coordinate - (MIN_SIZE - newDim));
        } else {
          pos = activeEdge.orientation === 'V'
            ? (activeEdge.coordinate + (MIN_SIZE - newDim))
            : (activeEdge.coordinate + (MIN_SIZE - newDim));
        }
      } else if (newDim <= DELETE_THRESHOLD) {
        pos = type === 'A'
          ? (activeEdge.orientation === 'V' ? b.bounds.left : b.bounds.top)
          : (activeEdge.orientation === 'V' ? b.bounds.right : b.bounds.bottom);
      }
    }
  };
  
  checkClamping(activeEdge.affectedA, 'A');
  checkClamping(activeEdge.affectedB, 'B');
  
  const finalDelta = pos - initialCoord;
  
  const next = blocks.map(b => {
    if (activeEdge.affectedA.includes(b.id)) {
      return activeEdge.orientation === 'V'
        ? { ...b, bounds: { ...b.bounds, right: b.bounds.right + finalDelta } }
        : { ...b, bounds: { ...b.bounds, bottom: b.bounds.bottom + finalDelta } };
    }
    if (activeEdge.affectedB.includes(b.id)) {
      return activeEdge.orientation === 'V'
        ? { ...b, bounds: { ...b.bounds, left: b.bounds.left + finalDelta } }
        : { ...b, bounds: { ...b.bounds, top: b.bounds.top + finalDelta } };
    }
    return b;
  });
  
  const kept = next.filter(b => (b.bounds.right - b.bounds.left) > 2 && (b.bounds.bottom - b.bounds.top) > 2);
  const result = kept.length !== next.length ? refreshLayoutPositions(kept) : next;
  return { blocks: result, appliedPos: pos };
}

export function mergeBlocks(
  blocks: GridBlock[],
  blockId1: string,
  blockId2: string
): GridBlock[] {
  const b1 = blocks.find(b => b.id === blockId1);
  const b2 = blocks.find(b => b.id === blockId2);
  if (!b1 || !b2) return blocks;
  
  const touchX = Math.abs(b1.bounds.right - b2.bounds.left) < EPSILON || Math.abs(b2.bounds.right - b1.bounds.left) < EPSILON;
  const touchY = Math.abs(b1.bounds.bottom - b2.bounds.top) < EPSILON || Math.abs(b2.bounds.bottom - b1.bounds.top) < EPSILON;
  const overlapY = Math.max(b1.bounds.top, b2.bounds.top) < Math.min(b1.bounds.bottom, b2.bounds.bottom);
  const overlapX = Math.max(b1.bounds.left, b2.bounds.left) < Math.min(b1.bounds.right, b2.bounds.right);
  const adjacent = (touchX && overlapY) || (touchY && overlapX);
  
  const newX = Math.min(b1.bounds.left, b2.bounds.left);
  const newY = Math.min(b1.bounds.top, b2.bounds.top);
  const newW = Math.max(b1.bounds.right, b2.bounds.right) - newX;
  const newH = Math.max(b1.bounds.bottom, b2.bounds.bottom) - newY;
  
  const areaSum = (b1.bounds.right - b1.bounds.left) * (b1.bounds.bottom - b1.bounds.top) + 
                  (b2.bounds.right - b2.bounds.left) * (b2.bounds.bottom - b2.bounds.top);
  
  if (!adjacent || Math.abs(areaSum - (newW * newH)) > 10) {
    return blocks;
  }
  
  const merged: GridBlock = {
    id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sectionId: b1.sectionId,
    row: Math.min(b1.row, b2.row),
    col: Math.min(b1.col, b2.col),
    bounds: {
      top: newY,
      left: newX,
      right: newX + newW,
      bottom: newY + newH,
    },
  };
  
  return refreshLayoutPositions([...blocks.filter(b => b.id !== blockId1 && b.id !== blockId2), merged]);
}
