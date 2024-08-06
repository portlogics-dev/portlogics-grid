import "../styles/index.scss";
import { ComponentClass, useRef, useState } from "react";

import portData from "./data.json";
import { flattenData } from "./flattenData";
import { TestConfig } from "./testEnvConfig";
import { TestGridOptionsSelect } from "./TestGrid";
import {
  Column,
  Row,
  Id,
  MenuOption,
  SelectionMode,
  DropPosition,
  CellLocation,
  DefaultCellTypes,
  CellChange,
  ReactGridProps,
  TextCell,
  HeaderCell,
  ChevronCell,
  Range,
  ReactGridInstance,
} from "../reactgrid";

export type GridRow = Row<DefaultCellTypes>;

export interface TestGridProps {
  enableSticky?: boolean;
  enableColumnAndRowSelection?: boolean;
  enableGroupSelection?: boolean;
  enableFrozenFocus?: boolean;
  firstRowType?: TextCell["type"] | HeaderCell["type"]; // 'text' if undefined
  firstColType?: ChevronCell["type"] | HeaderCell["type"]; // 'chevron' if undefined
  cellType?: TextCell["type"] | HeaderCell["type"]; // 'text' if undefined
  config: TestConfig;
  component: ComponentClass<ReactGridProps>;
}

export const TestGrid = ({
  config,
  component,
  enableSticky,
  enableColumnAndRowSelection,
  enableGroupSelection,
  enableFrozenFocus,
}: TestGridProps) => {
  const reactGridRef = useRef<ReactGridInstance>(null);

  const [render, setRender] = useState(true);

  const { rows: portRows, columns: portColumns } = flattenData(portData);

  const [columns, setColumns] = useState(portColumns);

  const [rows, setRows] = useState(portRows);

  const handleColumnResize = (
    columnId: Id,
    width: number,
    selectedColIds: Id[],
  ) => {
    setColumns((prevColumns) => {
      const setColumnWidth = (columnIndex: number) => {
        const resizedColumn = prevColumns[columnIndex];
        prevColumns[columnIndex] = { ...resizedColumn, width };
      };

      if (selectedColIds.includes(columnId)) {
        const stateColumnIndexes = prevColumns
          .filter((col) => selectedColIds.includes(col.columnId))
          .map((col) =>
            prevColumns.findIndex((el) => el.columnId === col.columnId),
          );
        stateColumnIndexes.forEach(setColumnWidth);
      } else {
        const columnIndex = prevColumns.findIndex(
          (col) => col.columnId === columnId,
        );
        setColumnWidth(columnIndex);
      }
      return [...prevColumns];
    });
  };

  // TODO ReactGrid should be able to handle this function
  const handleChanges = (changes: CellChange<DefaultCellTypes>[]) => {
    setRows((prevRows) => {
      changes.forEach((change) => {
        const changeRowIdx = prevRows.findIndex(
          (el) => el.rowId === change.rowId,
        );
        const changeColumnIdx = columns.findIndex(
          (el) => el.columnId === change.columnId,
        );
        if (change.type === "text") {
          // console.log(change.newCell.text);
        }
        if (change.type === "checkbox") {
          // console.log(change.previousCell.checked);
        }
        prevRows[changeRowIdx].cells[changeColumnIdx] = change.newCell;
      });
      return [...prevRows];
    });
  };

  const reorderArray = <T,>(arr: T[], idxs: number[], to: number) => {
    const movedElements: T[] = arr.filter((_: T, idx: number) =>
      idxs.includes(idx),
    );
    to =
      Math.min(...idxs) < to
        ? (to += 1)
        : (to -= idxs.filter((idx) => idx < to).length);
    const leftSide: T[] = arr.filter(
      (_: T, idx: number) => idx < to && !idxs.includes(idx),
    );
    const rightSide: T[] = arr.filter(
      (_: T, idx: number) => idx >= to && !idxs.includes(idx),
    );
    return [...leftSide, ...movedElements, ...rightSide];
  };

  const handleCanReorderColumns = (
    _targetColumnId: Id,
    _columnIds: Id[],
    _dropPosition: DropPosition,
  ): boolean => {
    return true;
  };

  const handleCanReorderRows = (
    _targetColumnId: Id,
    _rowIds: Id[],
    _dropPosition: DropPosition,
  ): boolean => {
    // const rowIndex = state.rows.findIndex((row: Row) => row.rowId === targetColumnId);
    // if (rowIndex === 0) return false;
    return true;
  };

  const handleColumnsReorder = (
    targetColumnId: Id,
    columnIds: Id[],
    _dropPosition: DropPosition,
  ) => {
    const to = columns.findIndex(
      (column: Column) => column.columnId === targetColumnId,
    );
    const columnIdxs = columnIds.map((id: Id) =>
      columns.findIndex((c: Column) => c.columnId === id),
    );
    setRows(
      rows.map((row) => ({
        ...row,
        cells: reorderArray(row.cells, columnIdxs, to),
      })),
    );
    setColumns(reorderArray(columns, columnIdxs, to));
  };

  const handleRowsReorder = (
    targetRowId: Id,
    rowIds: Id[],
    _dropPosition: DropPosition,
  ) => {
    setRows((prevRows) => {
      const to = rows.findIndex((row) => row.rowId === targetRowId);
      const columnIdxs = rowIds.map((id) =>
        rows.findIndex((r) => r.rowId === id),
      );
      return reorderArray(prevRows, columnIdxs, to);
    });
  };

  const handleContextMenu = (
    _selectedRowIds: Id[],
    _selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[],
    _selectedRanges: Array<CellLocation[]>,
  ): MenuOption[] => {
    if (selectionMode === "row") {
      menuOptions = [
        ...menuOptions,
        {
          id: "rowOption",
          label: "Custom menu row option",
          handler: (
            _selectedRowIds: Id[],
            _selectedColIds: Id[],
            _selectionMode: SelectionMode,
          ) => {},
        },
      ];
    }
    if (selectionMode === "column") {
      menuOptions = [
        ...menuOptions,
        {
          id: "columnOption",
          label: "Custom menu column option",
          handler: (
            _selectedRowIds: Id[],
            _selectedColIds: Id[],
            _selectionMode: SelectionMode,
          ) => {},
        },
      ];
    }
    return [
      ...menuOptions,
      {
        id: "all",
        label: "Custom menu option",
        handler: (
          _selectedRowIds: Id[],
          _selectedColIds: Id[],
          _selectionMode: SelectionMode,
        ) => {},
      },
    ];
  };

  const handleFocusLocationChanged = (_location: CellLocation): void => {};

  const handleFocusLocationChanging = (_location: CellLocation): boolean =>
    true;

  const handleSelectionChanged = (_range: Range[]): void => {};

  const BANNED_LOCATION = { rowIdx: 5, colIdx: 10 };

  const doesRangeContainLocationByIdx = (
    range: Range,
    location: { rowIdx: number; colIdx: number },
  ): boolean => {
    return (
      location.colIdx >= range.first.column.idx &&
      location.colIdx <= range.last.column.idx &&
      location.rowIdx >= range.first.row.idx &&
      location.rowIdx <= range.last.row.idx
    );
  };

  const handleSelectionChanging = (ranges: Range[]): boolean => {
    return true;
    // Returns false if any range contains the banned location
    return !ranges.some((range) =>
      doesRangeContainLocationByIdx(range, BANNED_LOCATION),
    );
  };

  const handleClearSelections = () => {
    if (reactGridRef.current) {
      reactGridRef.current.clearSelections();
    }
  };

  const Component = component;
  return (
    <>
      <div
        className="test-grid-container"
        data-cy="div-scrollable-element"
        style={{
          ...(!config.pinToBody && {
            height: config.fillViewport
              ? `calc(100vh - 30px)`
              : config.rgViewportHeight,
            width: config.fillViewport
              ? `calc(100vw - 45px)`
              : config.rgViewportWidth,
            margin: config.margin,
            overflow: "auto",
          }),
          position: "relative",
          ...(config.flexRow && {
            display: "flex",
            flexDirection: "row",
          }),
        }}
      >
        <button onClick={handleClearSelections}>Clear Selections</button>
        {render && (
          <Component
            ref={reactGridRef}
            rows={rows}
            columns={columns}
            initialFocusLocation={config.initialFocusLocation}
            focusLocation={enableFrozenFocus ? config.focusLocation : undefined}
            // onCellsChanged={handleChangesTest2} // TODO This handler should be allowed
            onCellsChanged={handleChanges}
            onColumnResized={handleColumnResize}
            highlights={config.highlights}
            stickyLeftColumns={enableSticky ? config.stickyLeft : undefined}
            stickyRightColumns={enableSticky ? config.stickyRight : undefined}
            stickyTopRows={enableSticky ? config.stickyTop : undefined}
            stickyBottomRows={enableSticky ? config.stickyBottom : undefined}
            canReorderColumns={handleCanReorderColumns}
            canReorderRows={handleCanReorderRows}
            onColumnsReordered={handleColumnsReorder}
            onRowsReordered={handleRowsReorder}
            onContextMenu={handleContextMenu}
            onFocusLocationChanged={handleFocusLocationChanged}
            onFocusLocationChanging={handleFocusLocationChanging}
            enableRowSelection={enableColumnAndRowSelection || false}
            enableColumnSelection={enableColumnAndRowSelection || false}
            enableFullWidthHeader={config.enableFullWidthHeader || false}
            enableRangeSelection={config.enableRangeSelection}
            enableFillHandle={config.enableFillHandle}
            enableGroupIdRender={config.enableGroupIdRender}
            enableGroupSelection={enableGroupSelection || false}
            labels={config.labels}
            horizontalStickyBreakpoint={config.horizontalStickyBreakpoint}
            verticalStickyBreakpoint={config.verticalStickyBreakpoint}
            disableVirtualScrolling={config.disableVirtualScrolling}
            onSelectionChanged={handleSelectionChanged}
            onSelectionChanging={handleSelectionChanging}
            moveRightOnEnter={config.moveRightOnEnter}
          />
        )}
      </div>
      <TestGridOptionsSelect />
      <button
        onClick={() => {
          setRender((render) => !render);
        }}
      >
        Mount / Unmount
      </button>
    </>
  );
};

export const PortlogicsTestGrid = ({ ...props }: TestGridProps) => {
  return (
    <div style={{ ...props.config.withDivComponentStyles }}>
      <TestGrid {...props} />
    </div>
  );
};
