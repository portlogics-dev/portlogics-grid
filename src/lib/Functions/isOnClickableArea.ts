import { PointerEvent } from "../Model/domEventsTypes";
import { State } from "../Model/State";

export function isOnClickableArea(event: PointerEvent, state: State): boolean {
  if (!state.reactGridElement) {
    throw new Error(
      `"state.reactGridElement" field should be initiated before calling the "getBoundingClientRect()"`,
    );
  }
  const { left, right } = state.reactGridElement.getBoundingClientRect();
  const scrollableContentX = event.clientX - left;
  const rightPaneWidth = state.cellMatrix.ranges.stickyRightRange.width;
  if (
    scrollableContentX >= state.cellMatrix.width - rightPaneWidth &&
    !(event.clientX >= right - rightPaneWidth)
  ) {
    return false;
  }
  return true;
}
