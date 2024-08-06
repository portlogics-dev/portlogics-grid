import { ReactNode } from "react";

import { getCellProperty } from "../Functions/getCellProperty";
import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
} from "../Model/PublicModel";

export interface DisabledCell extends Cell {
  type: "disabled";
  text: string;
}

export class DisabledCellTemplate implements CellTemplate<DisabledCell> {
  // TODO: 값이 보이긴 보임(옅게). ✅
  // 직접 edit하지는 못함. ✅
  // 활성화된 row edit하면 아래 값들도 자동으로 변경

  getCompatibleCell(
    uncertainCell: Uncertain<DisabledCell>,
  ): Compatible<DisabledCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const value = parseFloat(text);
    return {
      ...uncertainCell,
      text,
      value,
    };
  }

  handleKeyDown(
    cell: Compatible<DisabledCell>,
    _keyCode: number,
    _ctrl: boolean,
    _shift: boolean,
    _alt: boolean,
  ): {
    cell: Compatible<DisabledCell>;
    enableEditMode: boolean;
  } {
    return { cell, enableEditMode: false };
  }

  isFocusable = (_cell: Compatible<DisabledCell>): boolean => false;

  // 같은 그룹 내 수정가능한 행의 셀을 수정했을 때 비활성화된 셀들도 수정돼야 하므로 update함수는 있어야 함.
  update(
    cell: Compatible<DisabledCell>,
    cellToMerge: UncertainCompatible<DisabledCell>,
  ): Compatible<DisabledCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }

  render(
    cell: Compatible<DisabledCell>,
    _isInEditMode: boolean,
    _onCellChanged: (cell: Compatible<DisabledCell>, commit: boolean) => void,
  ): ReactNode {
    return <div className="rg-disabled-cell">{cell.text}</div>;
  }
}
