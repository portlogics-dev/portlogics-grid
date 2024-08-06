import { getActiveSelectedRange } from "./getActiveSelectedRange";
import { getDataToCopy } from "./getDataToCopy";
import { isBrowserSafari } from "./safari";
import { ClipboardEvent } from "../Model/domEventsTypes";
import { State } from "../Model/State";

export function handleCopy(
  event: ClipboardEvent,
  state: State,
  removeValues = false,
): State {
  const activeSelectedRange = getActiveSelectedRange(state);
  if (!activeSelectedRange) {
    return state;
  }
  const { div } = getDataToCopy(state, activeSelectedRange, removeValues);
  copyDataCommands(event, state, div);
  return { ...state, copyRange: activeSelectedRange };
}

export function copyDataCommands(
  event: ClipboardEvent,
  state: State,
  div: HTMLDivElement,
): void {
  if (isBrowserSafari()) {
    event.clipboardData.setData("text/html", div.innerHTML);
  } else {
    document.body.appendChild(div);
    div.focus();
    document.execCommand("selectAll", false);
    document.execCommand("copy");
    document.body.removeChild(div);
  }

  state.hiddenFocusElement?.focus({ preventScroll: true });
  event.preventDefault();
}
