import { CSSProperties, ReactNode, useCallback, useRef } from "react";

import { ResizeHandle } from "./ResizeHandle";
import { areLocationsEqual } from "../Functions/areLocationsEqual";
import { noBorder } from "../Functions/excludeObjectProperties";
import { getCompatibleCellAndTemplate } from "../Functions/getCompatibleCellAndTemplate";
import { isMobileDevice } from "../Functions/isMobileDevice";
import { tryAppendChange } from "../Functions/tryAppendChange";
import { Borders, Location } from "../Model/InternalModel";
import { BorderProps, Cell, Compatible } from "../Model/PublicModel";
import { Range } from "../Model/Range";
import { State } from "../Model/State";

export interface CellRendererProps {
  state: State;
  location: Location;
  borders: Borders;
  range: Range;
  update: State["update"];
  currentlyEditedCell: State["currentlyEditedCell"];
  children?: ReactNode;
}

export interface CellRendererChildProps<TState extends State = State> {
  location?: Location;
  cell?: Compatible<Cell>;
  state?: TState;
}

const unset = "unset";

function storeBorderAndCell(borders: Borders, cell: Compatible<Cell>) {
  // Higher-order function (borders, cell)
  return (property: keyof BorderProps, defaultProp: string) => {
    // ('width', '1px')
    return (borderEdge: keyof Borders) => {
      // ('left' / 'right' / 'top' / 'bottom')
      if (borders[borderEdge]) {
        return cell.style?.border?.[borderEdge]?.[property]
          ? cell.style.border[borderEdge]?.[property]
          : defaultProp;
      } else if (cell.style?.border?.[borderEdge]?.[property]) {
        return cell.style.border[borderEdge]?.[property];
      }
      return unset;
    };
  };
}

function getBorderProperties(
  getPropertyOnBorderFn: (borderEdge: keyof Borders) => string | undefined,
) {
  return {
    left: getPropertyOnBorderFn("left"),
    right: getPropertyOnBorderFn("right"),
    top: getPropertyOnBorderFn("top"),
    bottom: getPropertyOnBorderFn("bottom"),
  };
}

export const CellRenderer = ({
  state,
  location,
  range,
  borders,
  update,
  currentlyEditedCell,
}: CellRendererProps) => {
  const { cell, cellTemplate } = getCompatibleCellAndTemplate(state, location);
  const isFocused =
    state.focusedLocation !== undefined &&
    areLocationsEqual(state.focusedLocation, location);
  const customClass =
    (cellTemplate.getClassName && cellTemplate.getClassName(cell, false)) ?? "";

  const currentlyEditedCellRef = useRef(currentlyEditedCell); //

  const storePropertyAndDefaultValue = storeBorderAndCell(borders, cell);
  const bordersWidth = getBorderProperties(
      storePropertyAndDefaultValue("width", "1px"),
    ),
    bordersStyle = getBorderProperties(
      storePropertyAndDefaultValue("style", "solid"),
    ),
    bordersColor = getBorderProperties(
      storePropertyAndDefaultValue("color", "#e8e8e8"),
    );

  const bordersProps = {
    borderLeftWidth: bordersWidth.left,
    borderLeftStyle: bordersStyle.left,
    borderLeftColor: bordersColor.left,
    borderRightWidth: bordersWidth.right,
    borderRightStyle: bordersStyle.right,
    borderRightColor: bordersColor.right,
    borderTopWidth: bordersWidth.top,
    borderTopStyle: bordersStyle.top,
    borderTopColor: bordersColor.top,
    borderBottomWidth: bordersWidth.bottom,
    borderBottomStyle: bordersStyle.bottom,
    borderBottomColor: bordersColor.bottom,
  };
  // 여기까지 넘겨받은 cell의 style 복붙

  const isMobile = isMobileDevice();
  const isFirstRowOrColumnWithSelection =
    (state.props?.enableRowSelection && location.row.idx === 0) ||
    (state.props?.enableColumnSelection && location.column.idx === 0);
  const style = {
    ...(cellTemplate.getStyle && (cellTemplate.getStyle(cell, false) || {})),
    ...(cell.style && noBorder(cell.style)),
    left: location.column.left,
    top: location.row.top,
    width: range.width,
    height: range.height,
    ...(!(isFocused && currentlyEditedCellRef.current) && bordersProps), // focused고 currentlyEditedCell의 ref가 있으면 borderProps(이 경우 파란색 border일 것)
    ...((isFocused ||
      cell.type === "header" ||
      isFirstRowOrColumnWithSelection) && { touchAction: "none" }), // prevent scrolling
  } as CSSProperties;

  const isInEditMode = isFocused && !!currentlyEditedCellRef.current;

  const groupIdClassName = cell.groupId ? ` rg-groupId-${cell.groupId}` : "";
  const nonEditableClassName = cell.nonEditable ? " rg-cell-nonEditable" : "";
  const cellClassNames =
    isInEditMode && isMobile
      ? ` rg-celleditor rg-${cell.type}-celleditor`
      : ` rg-${cell.type}-cell`;
  const classNames = `rg-cell${cellClassNames}${groupIdClassName}${nonEditableClassName} ${customClass}`;
  const cellToRender =
    isFocused && currentlyEditedCellRef.current && isMobile
      ? currentlyEditedCellRef.current
      : cell; // location 기반 cell을 렌더할지, currentlyEdited인 cell의 current를 렌더할지 선택

  const onCellChanged = useCallback(
    (cell: Compatible<Cell>, commit: boolean) => {
      if (isInEditMode) {
        currentlyEditedCellRef.current = commit ? undefined : cell;
        if (commit) update((state) => tryAppendChange(state, location, cell));
      } else {
        if (!commit)
          throw new Error("commit should be set to true in this case.");
        update((state) => tryAppendChange(state, location, cell));
      }
    },
    [isInEditMode, location, update, currentlyEditedCellRef],
  );

  return (
    <div
      className={classNames}
      style={style}
      {...(process.env.NODE_ENV === "development" && {
        "data-cell-colidx": location.column.idx,
        "data-cell-rowidx": location.row.idx,
      })}
    >
      {cellTemplate.render(
        cellToRender,
        isMobile ? isInEditMode : false,
        onCellChanged,
      )}
      {location.row.idx === 0 && location.column.resizable && <ResizeHandle />}
      {!state.enableGroupSelection &&
        state.enableGroupIdRender &&
        cell?.groupId !== undefined &&
        !(isInEditMode && isMobile) && (
          <span className="rg-groupId">{cell.groupId}</span>
        )}
    </div>
  );
};
