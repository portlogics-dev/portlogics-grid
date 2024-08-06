import { PaneContentChild } from "../Model/InternalModel";

export const FillHandleRangeSelection = ({
  state,
  calculatedRange,
}: PaneContentChild) => {
  return <>{state.currentBehavior.renderPanePart(state, calculatedRange)}</>;
};
