import { handleCompositionEndOnCellTemplate } from "./handleCompositionEndOnCellTemplate";
import { State } from "../Model/State";

export function handleCompositionEnd(
  event: CompositionEvent,
  state: State,
): State {
  const newState = handleCompositionEndOnCellTemplate(state, event);
  if (newState !== state) {
    event.stopPropagation();
    event.preventDefault();
  }
  return newState;
}
