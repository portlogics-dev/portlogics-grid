import { PartialArea } from "./PartialArea";
import { PaneContentChild, Range } from "../../core";
import { isRangeIntersects } from "../Functions/isRangeIntersectsWith";

// row/colSelection 말고도 rangeSelection에도 반응하는 함수
export const SelectedRanges = ({
  state,
  calculatedRange,
}: PaneContentChild) => {
  // calculatedRange = 지금 관측 가능한 테이블 영역

  return (
    <>
      {state.selectedRanges.map(
        (range: Range, i: number) =>
          !(
            (
              state.focusedLocation &&
              range.contains(state.focusedLocation) &&
              range.columns.length === 1 &&
              range.rows.length === 1
            ) // 이 조건을 통과한다는 뜻은 테이블이 1x1 사이즈라는 뜻. 그 외의 경우엔 모두 허용
          ) &&
          calculatedRange &&
          isRangeIntersects(calculatedRange, range) && (
            <PartialArea
              key={i}
              pane={calculatedRange}
              range={range}
              className="rg-partial-area-selected-range"
              style={{}}
            />
          ),
      )}
    </>
  );
};
