import {
  Location,
  isSelectionKey,
  isOnClickableArea,
  getCompatibleCellAndTemplate,
  CellMatrix,
  PointerLocation,
} from "../../core";
import { focusLocation } from "../Functions/focusLocation";
import { handleContextMenu } from "../Functions/handleContextMenu";
import {
  updateActiveSelectedRange,
  selectRange,
} from "../Functions/selectRange";
import { Behavior } from "../Model/Behavior";
import { PointerEvent } from "../Model/domEventsTypes";
import { State } from "../Model/State";

export class CellSelectionBehavior extends Behavior {
  handlePointerDown(
    event: PointerEvent,
    location: Location,
    state: State,
  ): State {
    if ((event.target as HTMLDivElement).className === "reactgrid-content")
      return state;
    if (state.enableRangeSelection && event.shiftKey && state.focusedLocation) {
      // 쉬프트 키 누르고 한 번에 여러 셀 선택할 때
      const range = state.cellMatrix.getRange(state.focusedLocation, location);
      if (isSelectionKey(event) && state.selectionMode === "range") {
        return updateActiveSelectedRange(state, range);
      } else {
        return selectRange(state, range, false);
      }
    } else if (state.enableRangeSelection && isSelectionKey(event)) {
      // 커맨드(컨트롤) 키 누르고 불연속적인 여러 셀 선택할 때
      const pointedRangeIdx = state.selectedRanges.findIndex((range) =>
        range.contains(location),
      );
      const pointedRange = state.selectedRanges[pointedRangeIdx];
      const { cellTemplate } = getCompatibleCellAndTemplate(state, location);
      if (pointedRange) {
        state = focusLocation(state, location, false);
        state = { ...state, activeSelectedRangeIdx: pointedRangeIdx };
      } else if (!cellTemplate.isFocusable) {
        const range = state.cellMatrix.getRange(location, location);
        state = selectRange(state, range, true);
        state = focusLocation(state, location, false);
      }
    } else {
      state = focusLocation(state, location);
    }
    return state;
  }

  handlePointerEnter(
    event: PointerEvent,
    location: Location,
    state: State,
  ): State {
    if (
      !state.enableRangeSelection ||
      !state.focusedLocation ||
      (event.target as HTMLDivElement).className === "reactgrid-content"
    ) {
      // fix for FF scroll issue
      return state;
    }
    const range = state.cellMatrix.getRange(state.focusedLocation, location);
    if (state.selectionMode === "range" && isOnClickableArea(event, state)) {
      return updateActiveSelectedRange(state, range);
    } else {
      return selectRange(state, range, false);
    }
  }

  handlePointerUp(
    _event: MouseEvent | PointerEvent,
    _location: PointerLocation,
    state: State<CellMatrix, Behavior<MouseEvent | PointerEvent>>,
  ): State<CellMatrix, Behavior<MouseEvent | PointerEvent>> {
    if (
      state.props?.onSelectionChanging &&
      !state.props.onSelectionChanging(state.selectedRanges)
    ) {
      // Cancel the latest selection
      const filteredRanges = [...state.selectedRanges].filter(
        (_, index) => index !== state.activeSelectedRangeIdx,
      );

      return {
        ...state,
        selectedRanges: filteredRanges,
        activeSelectedRangeIdx: filteredRanges.length - 1,
      };
    }

    state.props?.onSelectionChanged &&
      state.props.onSelectionChanged(state.selectedRanges);

    return state;
  }

  handleContextMenu(event: PointerEvent, state: State): State {
    return handleContextMenu(event, state);
  }
}
