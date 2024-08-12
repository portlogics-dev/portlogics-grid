import * as React from "react";

import { CellFocus, CellHighlight } from "./CellFocus";
import { CellRendererProps } from "./CellRenderer";
import { FillHandleRangeSelection } from "./FillHandleRangeSelection";
import { FillHandleRenderer } from "./FillHandleRenderer";
import { RowRenderer } from "./RowRenderer";
import { SelectedRanges } from "./SelectedRanges";
import { SelectedRowGroups } from "./SelectedRowGroups";
import { isMobileDevice } from "../Functions/isMobileDevice";
import { Borders } from "../Model/InternalModel";
import { Highlight } from "../Model/PublicModel";
import { Range } from "../Model/Range";
import { State } from "../Model/State";

export interface PaneProps {
  renderChildren: boolean;
  style: React.CSSProperties;
  className: string;
}

export interface RowsProps {
  state: State;
  range: Range;
  borders: Borders;
  cellRenderer: React.FC<CellRendererProps>;
}

export interface PaneContentProps<TState extends State = State> {
  state: TState;
  range: () => Range;
  borders: Borders;
  cellRenderer: React.FC<CellRendererProps>;
  children?: (state: TState, range: Range) => React.ReactNode;
}

function shouldMemoPaneGridContent(
  prevProps: RowsProps,
  nextProps: RowsProps,
): boolean {
  const { state: prevState } = prevProps;
  const { state: nextState } = nextProps;
  if (
    prevState.focusedLocation &&
    nextState.focusedLocation &&
    prevState.currentlyEditedCell === nextState.currentlyEditedCell // used for opening cell editor in cell
  ) {
    if (
      prevState.focusedLocation.column.columnId !==
        nextState.focusedLocation.column.columnId ||
      prevState.focusedLocation.row.rowId !==
        nextState.focusedLocation.row.rowId
    )
      return false;
  } else {
    return false; // needed when select range by touch after first focus
  }
  return !(
    prevState.visibleRange !== nextState.visibleRange ||
    prevState.cellMatrix.props !== nextState.cellMatrix.props
  );
}

export const PaneGridContent: React.NamedExoticComponent<RowsProps> =
  React.memo(
    // row별로 메모이제이션해서 관리
    ({ range, state, borders, cellRenderer }) => (
      <>
        {range.rows.map((row) => (
          <RowRenderer
            key={row.rowId}
            state={state}
            row={row}
            columns={range.columns}
            forceUpdate={true}
            cellRenderer={cellRenderer}
            borders={{
              ...borders,
              top: borders.top && row.top === 0,
              bottom:
                (borders.bottom && row.idx === range.last.row.idx) ||
                !(state.cellMatrix.scrollableRange.last.row?.idx === row.idx),
            }}
          />
        ))}
      </>
    ),
    shouldMemoPaneGridContent,
  );

PaneGridContent.displayName = "PaneGridContent";

function renderHighlights(state: State, range: Range) {
  return state.highlightLocations.map((highlight: Highlight, id: number) => {
    try {
      const location = state.cellMatrix.getLocationById(
        highlight.rowId,
        highlight.columnId,
      );
      return (
        location &&
        range.contains(location) && (
          <CellHighlight
            key={id}
            location={location}
            state={state}
            borderColor={highlight.borderColor}
            className={highlight.className}
          />
        )
      );
    } catch (error) {
      console.error(
        `Cell location fot found while rendering highlights at: ${(error as Error).message}`,
      );
      return null;
    }
  });
}

export const Pane: React.FC<PaneProps> = ({
  className,
  style,
  renderChildren,
  children,
}) => {
  if (!style.width || !style.height) {
    return null;
  } else {
    return (
      <PaneContentWrapper className={className} style={style}>
        {renderChildren && children}
      </PaneContentWrapper>
    );
  }
};

export const PaneContent = ({
  state,
  range,
  borders,
  cellRenderer,
}: PaneContentProps<State>) => {
  // 실제 그리드 렌더부
  const calculatedRange = range();

  return (
    <>
      <PaneGridContent
        state={state}
        range={calculatedRange}
        borders={borders}
        cellRenderer={cellRenderer}
      />
      {renderHighlights(state, calculatedRange)}
      {state.focusedLocation &&
        !(state.currentlyEditedCell && isMobileDevice()) &&
        calculatedRange.contains(state.focusedLocation) && (
          <CellFocus location={state.focusedLocation} />
        )}
      <SelectedRanges state={state} calculatedRange={calculatedRange} />
      <SelectedRowGroups state={state} calculatedRange={calculatedRange} />
      <FillHandleRangeSelection
        state={state}
        calculatedRange={calculatedRange}
      />
      <FillHandleRenderer state={state} calculatedRange={calculatedRange} />
    </>
  );
};

const PaneContentWrapper: React.FC<{
  className: string;
  style: React.CSSProperties;
}> = ({ className, style, children }) => {
  return (
    <div className={`rg-pane ${className}`} style={style}>
      {children}
    </div>
  );
};
