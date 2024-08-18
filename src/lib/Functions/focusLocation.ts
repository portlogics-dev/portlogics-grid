import { areLocationsEqual } from "./areLocationsEqual";
import { getCompatibleCellAndTemplate } from "./getCompatibleCellAndTemplate";
import { keyCodes } from "./keyCodes";
import { resetSelection } from "./selectRange";
import { tryAppendChange } from "./tryAppendChange";
import { Location } from "../Model/InternalModel";
import { State } from "../Model/State";

export function focusLocation(
  state: State,
  location: Location,
  applyResetSelection = true,
  keyCode?: keyCodes,
): State {
  // Need to determine if there is an edited cell &&The cell gets focus &&did not press Enter
  if (
    state.focusedLocation &&
    state.currentlyEditedCell &&
    keyCode !== keyCodes.ENTER
  ) {
    state = tryAppendChange(
      // edited cell을 이전 상태와 비교해서 변경사항이 있다면 queuedCellChanges에 push, handleStateUpdate에서 처리 후 state 업데이트
      state,
      state.focusedLocation,
      state.currentlyEditedCell,
    );
  }

  if (!state.props) {
    throw new Error(
      `"props" field on "state" object should be initiated before possible location focus`,
    );
  }

  // TODO nodeId 같은 row 전체 focus
  const { onFocusLocationChanged, onFocusLocationChanging, focusLocation } =
    state.props;

  const { cell, cellTemplate } = getCompatibleCellAndTemplate(state, location);
  const cellLocation = {
    rowId: location.row.rowId,
    columnId: location.column.columnId,
  };

  const isChangeAllowedByUser =
    !onFocusLocationChanging || onFocusLocationChanging(cellLocation);

  const isCellTemplateFocusable =
    !cellTemplate.isFocusable || cellTemplate.isFocusable(cell);

  const forcedLocation = focusLocation
    ? state.cellMatrix.getLocationById(
        focusLocation.rowId,
        focusLocation.columnId,
      )
    : undefined;

  const isLocationAcceptable =
    areLocationsEqual(location, state.focusedLocation) ||
    (forcedLocation ? areLocationsEqual(location, forcedLocation) : true);

  const validatedFocusLocation = state.cellMatrix.validateLocation(location);

  const selectedRowGroups = state.cellMatrix.getSelectedRowsByLocation(
    validatedFocusLocation,
  );

  if (cell.nonEditable) {
    const editableFocusLocationX =
      location.row.groupId &&
      state.cellMatrix.rowGroups[location.row.groupId].find(
        (row) => !row.cells[location.column.idx].nonEditable,
      )?.rowId;

    const nonEditableCellFocusLocation = editableFocusLocationX
      ? state.cellMatrix.getLocationById(
          editableFocusLocationX,
          location.column.columnId,
        )
      : undefined;

    return {
      ...state,
      focusedLocation: nonEditableCellFocusLocation, // 클릭된 셀의 행에서 동일한 그룹 중 첫번째 nonEditable이 아닌 셀
      selectedRanges: [],
      selectedRowGroups: selectedRowGroups ? [selectedRowGroups] : [],
      currentlyEditedCell: undefined,
    };
  }

  if (
    !isCellTemplateFocusable ||
    !isChangeAllowedByUser ||
    !isLocationAcceptable
  ) {
    return state;
  }

  if (onFocusLocationChanged) {
    onFocusLocationChanged(cellLocation);
  }

  if (applyResetSelection) {
    // TODO is `location` really needed
    state = resetSelection(state, validatedFocusLocation);
  }

  return {
    ...state,
    focusedLocation: validatedFocusLocation,
    selectedRowGroups: selectedRowGroups ? [selectedRowGroups] : [],
    contextMenuPosition: { top: -1, left: -1 },
    currentlyEditedCell: undefined, // TODO disable in derived state from props
  };
}
