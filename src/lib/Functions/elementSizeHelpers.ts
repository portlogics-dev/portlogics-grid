import { isIOS } from "./operatingSystem";
import {
  getScrollOfScrollableElement,
  getTopScrollableElement,
} from "./scrollHelpers";
import { State } from "../Model/State";

// TODO replace any with exact type: HTMLElement | (Window & typeof globalThis)
export function getSizeOfElement(
  element: HTMLElement | (Window & typeof globalThis) | undefined,
): { width: number; height: number } {
  if (!element) {
    return { width: 0, height: 0 };
  }
  const width =
    element instanceof HTMLElement
      ? element.clientWidth
      : isIOS()
        ? window.innerWidth
        : document.documentElement.clientWidth; // TODO check other mobile devices
  const height =
    element instanceof HTMLElement
      ? element.clientHeight
      : isIOS()
        ? window.innerHeight
        : document.documentElement.clientHeight;
  return { width, height };
}

export function getReactGridOffsets(state: State): {
  left: number;
  top: number;
} {
  const { scrollLeft, scrollTop } = getScrollOfScrollableElement(
    state.scrollableElement,
  );
  if (!state.reactGridElement) {
    throw new Error(
      `"state.reactGridElement" field should be initiated before calling "getBoundingClientRect()"`,
    );
  }
  const { left: leftReactGrid, top: topReactGrid } =
    state.reactGridElement.getBoundingClientRect();
  let left = leftReactGrid + scrollLeft,
    top = topReactGrid + scrollTop;
  if (
    state.scrollableElement !== undefined &&
    state.scrollableElement !== getTopScrollableElement()
  ) {
    const { left: leftScrollable, top: topScrollable } = (
      state.scrollableElement as HTMLElement
    ).getBoundingClientRect();
    left -= leftScrollable;
    top -= topScrollable;
  }
  return { left, top };
}

export function getVisibleSizeOfReactGrid(state: State): {
  width: number;
  height: number;
  visibleOffsetRight: number;
  visibleOffsetBottom: number;
} {
  const { scrollLeft, scrollTop } = getScrollOfScrollableElement(
    state.scrollableElement,
  );
  const { width: widthOfScrollableElement, height: heightOfScrollableElement } =
    getSizeOfElement(state.scrollableElement);
  const { left, top } = getReactGridOffsets(state);

  const scrollBottom = scrollTop + heightOfScrollableElement,
    reactGridBottom = top + state.cellMatrix.height,
    visibleTop = top < scrollTop ? scrollTop : top,
    visibleBottom =
      reactGridBottom > scrollBottom ? scrollBottom : reactGridBottom;

  const scrollRight = scrollLeft + widthOfScrollableElement,
    reactGridRight = left + state.cellMatrix.width,
    visibleLeft = left < scrollLeft ? scrollLeft : left,
    visibleRight = reactGridRight > scrollRight ? scrollRight : reactGridRight;

  const width = Math.max(visibleRight - visibleLeft, 0),
    height = Math.max(visibleBottom - visibleTop, 0);
  const visibleOffsetRight = scrollRight - visibleRight,
    visibleOffsetBottom = scrollBottom - visibleBottom;
  return { width, height, visibleOffsetRight, visibleOffsetBottom };
}

export const getStickyOffset = (scroll: number, offset: number): number =>
  scroll > offset ? scroll - offset : 0;
