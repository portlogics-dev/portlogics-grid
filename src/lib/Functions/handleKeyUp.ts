import { keyCodes } from "./keyCodes";
import { KeyboardEvent } from "../Model/domEventsTypes";
import { State } from "../Model/State";

export function handleKeyUp(event: KeyboardEvent, state: State): State {
  if (event.keyCode === keyCodes.TAB || event.keyCode === keyCodes.ENTER) {
    event.preventDefault();
    event.stopPropagation();
  }
  return state;
}
