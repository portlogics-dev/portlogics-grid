import { ReactNode } from "react";

// NOTE: all modules imported below may be imported from '@silevis/reactgrid'
import { getCellProperty } from "../Functions/getCellProperty";
import {
  Cell,
  CellStyle,
  CellTemplate,
  Compatible,
  Span,
  Uncertain,
} from "../Model/PublicModel";

export interface HeaderCell extends Cell, Span {
  type: "header";
  text: string;
}

export class HeaderCellTemplate implements CellTemplate<HeaderCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<HeaderCell>,
  ): Compatible<HeaderCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }

  render(
    cell: Compatible<HeaderCell>,
    _isInEditMode: boolean,
    _onCellChanged: (cell: Compatible<HeaderCell>, commit: boolean) => void,
  ): ReactNode {
    return cell.text;
  }

  isFocusable = (_cell: Compatible<HeaderCell>): boolean => false;

  getClassName(cell: Compatible<HeaderCell>, _isInEditMode: boolean): string {
    return cell.className ? cell.className : "";
  }

  getStyle = (_cell: Compatible<HeaderCell>): CellStyle => ({
    background: "rgba(128, 128, 128, 0.1)",
  });
}
