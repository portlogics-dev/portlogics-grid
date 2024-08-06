import {
  getReactGridOffsets,
  getStickyOffset,
} from "../../Functions/elementSizeHelpers";
import {
  getScrollOfScrollableElement,
  getTopScrollableElement,
} from "../../Functions/scrollHelpers";
import { CellMatrix } from "../../Model/CellMatrix";
import { Location } from "../../Model/InternalModel";
import { State } from "../../Model/State";

import { CellEditorOffset, PositionState } from ".";

const calculatedXAxisOffset = (location: Location, state: State) => {
  const cellMatrix = state.cellMatrix;
  const offset: number | undefined =
    getStickyLeftRangeWidth(cellMatrix, location) ||
    getLeftStickyOffset(cellMatrix, location, state);
  if (offset) {
    return offset;
  }
  return 0;
};

const calculatedYAxisOffset = (location: Location, state: State): number => {
  const cellMatrix = state.cellMatrix;
  const offset: number | undefined =
    getStickyTopRangeWidth(cellMatrix, location) ||
    getTopStickyOffset(cellMatrix, location, state);
  if (offset) {
    return offset;
  }
  return 0;
};

export function getStickyLeftRangeWidth(
  cellMatrix: CellMatrix,
  location: Location,
): number | undefined {
  if (
    location.column.idx >
      (cellMatrix.ranges.stickyLeftRange.last.column
        ? cellMatrix.ranges.stickyLeftRange.last.column.idx
        : cellMatrix.first.column.idx) ||
    (location.column.idx === cellMatrix.last.column.idx &&
      location.column.idx !==
        cellMatrix.ranges.stickyLeftRange.last.column?.idx)
  ) {
    return cellMatrix.ranges.stickyLeftRange.width;
  }
}

export function getStickyTopRangeWidth(
  cellMatrix: CellMatrix,
  location: Location,
): number | undefined {
  if (
    location.row.idx >
      (cellMatrix.ranges.stickyTopRange.last.row
        ? cellMatrix.ranges.stickyTopRange.last.row.idx
        : cellMatrix.first.row.idx) ||
    (location.row.idx === cellMatrix.last.row.idx &&
      location.row.idx !== cellMatrix.ranges.stickyTopRange.last.row?.idx)
  ) {
    return cellMatrix.ranges.stickyTopRange.height;
  }
}

export function getLeftStickyOffset(
  cellMatrix: CellMatrix,
  location: Location,
  state: State,
): number | undefined {
  if (
    cellMatrix.ranges.stickyLeftRange.first.column &&
    location.column.idx >= cellMatrix.ranges.stickyLeftRange.first.column.idx &&
    location.column.idx <= cellMatrix.ranges.stickyLeftRange.last.column.idx
  ) {
    const { scrollLeft } = getScrollOfScrollableElement(
      state.scrollableElement,
    );
    const { left } = getReactGridOffsets(state);
    const leftStickyOffset = getStickyOffset(scrollLeft, left);
    return leftStickyOffset;
  }
}

export function getTopStickyOffset(
  cellMatrix: CellMatrix,
  location: Location,
  state: State,
): number | undefined {
  if (
    cellMatrix.ranges.stickyTopRange.first.row &&
    location.row.idx >= cellMatrix.ranges.stickyTopRange.first.row.idx &&
    location.row.idx <= cellMatrix.ranges.stickyTopRange.last.row.idx
  ) {
    const { scrollTop } = getScrollOfScrollableElement(state.scrollableElement);
    const { top } = getReactGridOffsets(state);
    const topStickyOffset = getStickyOffset(scrollTop, top);
    return topStickyOffset;
  }
}

export const cellEditorCalculator = (
  options: PositionState,
): CellEditorOffset => {
  const { state, location } = options;
  const { scrollTop, scrollLeft } = getScrollOfScrollableElement(
    state.scrollableElement,
  );
  const { top, left } = getReactGridOffsets(state);
  let offsetLeft = 0,
    offsetTop = 0;
  if (state.scrollableElement !== getTopScrollableElement()) {
    const { left, top } = (
      state.scrollableElement as HTMLElement
    ).getBoundingClientRect();
    offsetLeft = left;
    offsetTop = top;
  }

  // React StrictMode calls reducer two times to eliminate any side-effects
  // this function is a reducer so we need to add the state and location to positionState
  // in order to get them in the second call
  return {
    state,
    location,
    left:
      location.column.left +
      calculatedXAxisOffset(location, state) +
      offsetLeft +
      left -
      scrollLeft,
    top:
      location.row.top +
      calculatedYAxisOffset(location, state) +
      offsetTop +
      top -
      scrollTop,
  };
};
