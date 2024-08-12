import * as React from "react";

import { FillHandle } from "./FillHandle";
import { PaneContentChild, Range } from "../../core";
import { CellSelectionBehavior } from "../Behaviors/CellSelectionBehavior";

export const FillHandleRenderer: React.FC<PaneContentChild> = ({
  state,
  calculatedRange,
}) => {
  return (
    <>
      {state.selectedRanges[state.activeSelectedRangeIdx] &&
        calculatedRange instanceof Range &&
        calculatedRange.contains(
          state.selectedRanges[state.activeSelectedRangeIdx].last,
        ) &&
        state.enableFillHandle &&
        !state.currentlyEditedCell &&
        !(state.currentBehavior instanceof CellSelectionBehavior) && (
          <FillHandle
            state={state}
            location={state.selectedRanges[state.activeSelectedRangeIdx].last}
          />
        )}
    </>
  );
};
