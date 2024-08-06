import { focusLocation } from "./focusLocation";
import { getLocationFromClient } from "./getLocationFromClient";
import { PointerEvent } from "../Model/domEventsTypes";
import { State } from "../Model/State";

export function handleContextMenu(event: PointerEvent, state: State): State {
  event.preventDefault();
  const clickX = event.clientX;
  const clickY = event.clientY;
  const contextMenuPosition = state.contextMenuPosition;
  contextMenuPosition.top = clickY;
  contextMenuPosition.left = clickX;
  const focusedLocation = getLocationFromClient(state, clickX, clickY);
  if (!state.selectedRanges.find((range) => range.contains(focusedLocation))) {
    state = focusLocation(state, focusedLocation);
  }
  return {
    ...state,
    contextMenuPosition,
  };
}
