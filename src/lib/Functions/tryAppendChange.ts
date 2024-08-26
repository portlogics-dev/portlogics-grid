import { getCompatibleCellAndTemplate } from "./getCompatibleCellAndTemplate";
import { Location } from "../Model/InternalModel";
import { Cell, CellChange, Compatible } from "../Model/PublicModel";
import { State } from "../Model/State";

// state는 바뀌기 이전 상태, cell은 edited된 cell의 정보
export function tryAppendChange(
  state: State,
  location: Location,
  cell: Compatible<Cell>,
): State {
  const { cell: previousCell, cellTemplate } = getCompatibleCellAndTemplate(
    state,
    location,
  ); // 기존 state를 기반으로 수정되기 전 상태의 cell을 가져옴
  if (
    previousCell === cell ||
    JSON.stringify(previousCell) === JSON.stringify(cell) ||
    cellTemplate.update === undefined
  )
    // cell이 이전 cell과 같거나, 이전 cell과 같은 값을 가지고 있거나, cellTemplate.update가 없다면 state 그대로 반환
    return state;

  // 다른 경우 이전 cell의 update 메서드를 통해 새 변경사항을 반영한 newCell을 생성
  const newCell = cellTemplate.update(previousCell, cell);
  if (
    (newCell !== previousCell ||
      JSON.stringify(newCell) !== JSON.stringify(previousCell)) &&
    !newCell.nonEditable
  )
    // 수정 이전 cell과 수정 이후 cell이 다르고, nonEditable이 아닌 경우
    // 여기서 바로 cellChanges를 반영하지 않고 queuedCellChanges에 밀어넣음
    // 이후 handleStateUpdate에서 queuedCellChanges를 ReactGrid 컴포넌트에 주입한 handleChange props를 통과시켜 state를 업데이트
    state.queuedCellChanges.push({
      previousCell,
      newCell,
      type: newCell.type,
      rowId: location.row.rowId,
      columnId: location.column.columnId,
    } as CellChange);
  return { ...state };
}
