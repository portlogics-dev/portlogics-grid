import { Range } from "../Model/Range";
import { State } from "../Model/State";

export function getActiveSelectedRange(state: State): Range {
  return state.selectedRanges[state.activeSelectedRangeIdx];
}
