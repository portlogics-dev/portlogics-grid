// NOTE: all modules imported below may be imported from '@silevis/reactgrid'
import * as React from "react";

import { getCharFromKey } from "./getCharFromKeyCode";
import {
  inNumericKey,
  isNavigationKey,
  isCharAlphaNumeric,
} from "./keyCodeCheckings";
import { getFormattedTimeUnit } from "./timeUtils";
import { getCellProperty } from "../Functions/getCellProperty";
import { keyCodes } from "../Functions/keyCodes";
import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
} from "../Model/PublicModel";

export interface DateTimeCell extends Cell {
  type: "dateTime";
  dateTime?: Date;
  format?: Intl.DateTimeFormat;
}

export class DateTimeCellTemplate implements CellTemplate<DateTimeCell> {
  private wasEscKeyPressed = false;

  getCompatibleCell(
    uncertainCell: Uncertain<DateTimeCell>,
  ): Compatible<DateTimeCell> {
    const dateTime: Date = uncertainCell.dateTime
      ? getCellProperty(uncertainCell, "dateTime", "object")
      : new Date(NaN);
    const dateFormat =
      uncertainCell.format ||
      new Intl.DateTimeFormat(window.navigator.language);
    const value = dateTime.getTime();
    const text = !Number.isNaN(value) ? dateFormat.format(dateTime) : "";
    return { ...uncertainCell, dateTime, value, text };
  }

  handleKeyDown(
    cell: Compatible<DateTimeCell>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    key: string,
    capsLock: boolean,
  ): { cell: Compatible<DateTimeCell>; enableEditMode: boolean } {
    if (!ctrl && isCharAlphaNumeric(getCharFromKey(key)))
      return {
        cell: this.getCompatibleCell({ ...cell }),
        enableEditMode: true,
      };
    return {
      cell,
      enableEditMode:
        keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
    };
  }

  update(
    cell: Compatible<DateTimeCell>,
    cellToMerge: UncertainCompatible<DateTimeCell>,
  ): Compatible<DateTimeCell> {
    return this.getCompatibleCell({
      ...cell,
      dateTime: new Date(cellToMerge.value),
    });
  }

  getClassName(cell: Compatible<DateTimeCell>, _isInEditMode: boolean): string {
    return cell.className ? cell.className : "";
  }

  render(
    cell: Compatible<DateTimeCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<DateTimeCell>, commit: boolean) => void,
  ): React.ReactNode {
    if (!isInEditMode) {
      return cell.text;
    }

    if (!cell.dateTime) {
      return `"cell.dateTime" is not initialized with a date value`;
    }

    const year = getFormattedTimeUnit(cell.dateTime.getFullYear());
    const month = getFormattedTimeUnit(cell.dateTime.getMonth() + 1);
    const day = getFormattedTimeUnit(cell.dateTime.getDate());
    const hours = getFormattedTimeUnit(cell.dateTime.getHours());
    const minutes = getFormattedTimeUnit(cell.dateTime.getMinutes());

    return (
      <input
        className="rg-input"
        ref={(input) => {
          if (input) input.focus();
        }}
        type="datetime-local"
        defaultValue={`${year}-${month}-${day}T${hours}:${minutes}`}
        onChange={(e) => {
          if (e.currentTarget.value) {
            console.log("onChange", new Date(e.currentTarget.value));
            onCellChanged(
              this.getCompatibleCell({
                ...cell,
                dateTime: new Date(e.currentTarget.value),
              }),
              false,
            );
          }
        }}
        onBlur={(e) => {
          if (e.currentTarget.value) {
            console.log("onBlur", e.currentTarget.value);
            const [year, month, day] = e.currentTarget.value
              .split("-")
              .map((v) => parseInt(v));
            onCellChanged(
              this.getCompatibleCell({
                ...cell,
                dateTime: new Date(year, month - 1, day),
              }),
              !this.wasEscKeyPressed,
            );
            this.wasEscKeyPressed = false;
          }
        }}
        onKeyDown={(e) => {
          if (
            inNumericKey(e.keyCode) ||
            isNavigationKey(e.keyCode) ||
            e.keyCode === keyCodes.COMMA ||
            e.keyCode === keyCodes.PERIOD ||
            ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.KEY_A)
          )
            e.stopPropagation();
          if (
            !inNumericKey(e.keyCode) &&
            !isNavigationKey(e.keyCode) &&
            e.keyCode !== keyCodes.COMMA &&
            e.keyCode !== keyCodes.PERIOD
          )
            e.preventDefault();
          if (e.keyCode === keyCodes.ESCAPE) this.wasEscKeyPressed = true;
        }}
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      />
    );
  }
}
