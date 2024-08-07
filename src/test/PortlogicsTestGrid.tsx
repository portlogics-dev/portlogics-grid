import "./theming-test.scss";
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
      <div className="test-grid-content">
        <TestGridOptionsSelect />
        <button
          onClick={() => {
            setRender((render) => !render);
          }}
        >
          Mount / Unmount
        </button>
        <BulletinBoard />
      </div>
    </>
  );
};

const BulletinBoard = () => {
  return (
    <div className="bulletin-board">
      <span className="bulletin-board h2">Portlogics-grid 개발 현황</span>
      <table className="bulletin-board-table">
        <thead>
          <tr>
            <th>기능명</th>
            <th>상태</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DisabledCellTemplate</td>
            <td>완료</td>
            <td>
              같은 오더 그룹일 경우 해당 그룹 첫번째 행 제외 나머지 셀은
              disabled
            </td>
          </tr>
          <tr>
            <td>Group Order Selection</td>
            <td>완료</td>
            <td>
              disabled 셀 클릭 시에도 editable한 셀 포커스 + 그룹 오더 셀렉션
              작동
            </td>
          </tr>
          <tr>
            <td>Cell 수정</td>
            <td>개발 중</td>
            <td>
              체크포인트
              <ul>
                <li>
                  같은 오더 그룹 내에서 특정 행의 수정가능한 셀 수정 시 하위
                  disabled 셀의 내용까지 한꺼번에 수정되어야 함.
                </li>
                <li>우선은 TextCell만 구현.</li>
                <li>
                  추후 구현해야할 SearchCell/ButtonCell에서도 마찬가지로 함께
                  수정되어야 함
                </li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>Row 추가/삭제</td>
            <td>시작 전</td>
            <td>
              추가/삭제 엔트리 포인트를 어떻게 보여줄지는 논의 필요
              <ul>
                <li>우클릭 컨텍스트 버튼에서 하도록?</li>
                <li>
                  그리드 바깥에 버튼을 빼놓는건 추가버튼의 경우 시인성이 좋지
                </li>
                <li>
                  못한듯 삭제버튼은 PMS처럼 체크박스-그룹 삭제로 해도 좋을 듯
                </li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>Columns Reordering</td>
            <td>시작 전</td>
            <td>특정 CellType 내에서만 reordering 가능케 해야할 듯</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const PortlogicsTestGrid = ({ ...props }: TestGridProps) => {
  return (
    <div style={{ ...props.config.withDivComponentStyles }}>
      <TestGrid {...props} />
    </div>
  );
};
