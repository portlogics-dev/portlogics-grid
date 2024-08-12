import * as React from "react";

import {
  Column,
  Row,
  Id,
  MenuOption,
  SelectionMode,
  CellLocation,
  DefaultCellTypes,
  CellChange,
  ReactGridProps,
  TextCell,
  NumberCell,
  CellStyle,
  HeaderCell,
  ChevronCell,
  Range,
  ReactGridInstance,
} from "./../reactgrid";
import { FlagCell, FlagCellTemplate } from "./flagCell/FlagCellTemplate";
import { TestConfig } from "./testEnvConfig";

import "../styles/index.scss";

type TestGridCells = DefaultCellTypes | FlagCell;

type TestGridRow = Row<TestGridCells>;

interface TestGridProps {
  enableSticky?: boolean;
  enableColumnAndRowSelection?: boolean;
  enableGroupSelection?: boolean;
  enableFrozenFocus?: boolean;
  firstRowType?: TextCell["type"] | HeaderCell["type"]; // 'text' if undefined
  firstColType?: ChevronCell["type"] | HeaderCell["type"]; // 'chevron' if undefined
  cellType?: TextCell["type"] | HeaderCell["type"]; // 'text' if undefined
  config: TestConfig;
  component: React.ComponentClass<ReactGridProps>;
}

const numberValidator: NumberCell["validator"] = (number: number) => {
  return number !== 1000;
};

const textValidator: TextCell["validator"] = (text: string) => {
  return text !== "myText";
};

const emailValidator: TextCell["validator"] = (email) => {
  const email_regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email_regex.test(email.replace(/\s+/g, ""));
};

const myNumberFormat = new Intl.NumberFormat("pl", {
  style: "currency",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  currency: "PLN",
});
const myDateFormat = new Intl.DateTimeFormat("pl", {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
});
const myTimeFormat = new Intl.DateTimeFormat("pl", {
  hour: "2-digit",
  minute: "2-digit",
});

const style: CellStyle = {
  border: {
    left: { color: "red", style: "dashed", width: "2px" },
    top: { color: "red", style: "dashed", width: "2px" },
    right: { color: "red", style: "dashed", width: "2px" },
    bottom: { color: "red", style: "dashed", width: "2px" },
  },
};

export const TestGrid = ({
  config,
  component,
  enableSticky,
  enableColumnAndRowSelection,
  enableGroupSelection,
  enableFrozenFocus,
  firstRowType = "text",
  firstColType = "chevron",
  cellType = "text",
}: TestGridProps) => {
  const reactGridRef = React.useRef<ReactGridInstance>(null);

  const [render, setRender] = React.useState(true);

  const [columns, setColumns] = React.useState(() =>
    new Array(config.columns)
      .fill({ columnId: 0, resizable: true, reorderable: true, width: -1 })
      .map<Column>((_, ci) => ({
        columnId: `col-${ci}`,
        resizable: true,
        reorderable: true,
        width: config.cellWidth,
      })),
  );

  const [rows, setRows] = React.useState(() =>
    new Array(config.rows).fill(0).map<TestGridRow>((_, ri) => ({
      rowId: `row-${ri}`,
      reorderable: true,
      height: config.cellHeight,
      cells: columns.map<TestGridCells>((_, ci) => {
        if (ri === 0) return { type: firstRowType, text: `${ri} - ${ci}` };
        if (ri === 2 && ci === 8)
          return {
            type: "text",
            text: `non-editable`,
            nonEditable: true,
            validator: () => true,
          };
        if (ri === 3 && ci === 8)
          return {
            type: "text",
            text: "",
            placeholder: "placeholder",
            validator: () => true,
          };

        const spannedCells = config.spannedCells?.filter(
          (sC) => sC.idx === ci && sC.idy === ri,
        )[0];
        const headerCells = config.headerCells?.filter(
          (sC) => sC.idx === ci && sC.idy === ri,
        )[0];
        if (spannedCells || headerCells) {
          return {
            type: cellType,
            text: `${ri} - ${ci}`,
            colspan: spannedCells ? spannedCells.colspan : 0,
            rowspan: spannedCells ? spannedCells.rowspan : 0,
          };
        }

        // spanned and header cells should "win" these conditions
        if (ri === 1 && ci === 1)
          return {
            type: "text",
            groupId: !(ri % 3) ? "B" : undefined,
            text: `${ri} - ${ci}`,
            style,
            validator: textValidator,
            errorMessage: "ERR",
          };
        if (ri === 1 && ci === 2)
          return {
            type: "email",
            text: `${ri}.${ci}@bing.pl`,
            validator: emailValidator,
            errorMessage: "ERR",
          };
        if (ri === 1 && ci === 3)
          return {
            type: "number",
            format: myNumberFormat,
            validator: numberValidator,
            errorMessage: "ERR",
            value: parseFloat(`${ri}.${ci}`),
            nanToZero: false,
            hideZero: true,
          };
        if (ri === 2 && ci === 1)
          return {
            type: "text",
            groupId: !(ri % 3) ? "B" : undefined,
            text: `${ri} - ${ci}`,
            style,
            validator: textValidator,
          };
        if (ri === 2 && ci === 2)
          return {
            type: "email",
            text: `${ri}.${ci}@bing.pl`,
            validator: emailValidator,
          };
        if (ri === 2 && ci === 3)
          return {
            type: "number",
            format: myNumberFormat,
            validator: numberValidator,
            value: parseFloat(`${ri}.${ci}`),
            nanToZero: false,
            hideZero: true,
          };

        const now = new Date();
        switch (ci) {
          case 0:
            return firstColType === "chevron"
              ? {
                  type: "chevron",
                  groupId: !(ri % 3) ? "A" : undefined,
                  text: `${ri} - ${ci}`,
                  parentId: ri,
                  isExpanded: ri % 4 ? true : undefined,
                  hasChildren: true,
                }
              : {
                  type: "header",
                  groupId: !(ri % 3) ? "A" : undefined,
                  text: `${ri} - ${ci}`,
                };
          case 1:
            return {
              type: "text",
              groupId: !(ri % 3) ? "B" : undefined,
              text: `${ri} - ${ci}`,
              style,
            };
          case 2:
            return {
              type: "email",
              text: `${ri}.${ci}@bing.pl`,
              validator: emailValidator,
            };
          case 3:
            return {
              type: "number",
              format: myNumberFormat,
              value: parseFloat(`${ri}.${ci}`),
              nanToZero: false,
              hideZero: true,
            };
          case 4:
            return {
              type: "date",
              format: myDateFormat,
              date: new Date(now.setHours(ri * 24, 0, 0, 0)),
            };
          case 5:
            return {
              type: "time",
              format: myTimeFormat,
              time: new Date(now.setHours(now.getHours() + ri)),
            };
          case 6:
            return {
              type: "checkbox",
              checked: false,
              checkedText: "Checked",
              uncheckedText: "Unchecked",
            };
          case 7:
            return {
              type: "flag",
              groupId:
                Math.random() < 0.66
                  ? Math.random() < 0.5
                    ? "A"
                    : "B"
                  : undefined,
              text: "bra",
            };
          case 8:
            return {
              type: "dropdown",
              values: [
                { value: "react", label: "React" },
                { value: "vue", label: "Vue" },
                { value: "angular", label: "Angular" },
              ],
              currentValue: "react",
              isDisabled: false,
            };
          case -1: // just for interface testing purposes
            return { type: "header", text: ``, rowspan: 3, colspan: 2 };
          default:
            return {
              type: "text",
              text: `${ri} - ${ci}`,
              validator: () => true,
            };
        }
      }),
    })),
  );

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

  // eslint-disable-next-line
  const handleChangesTest = (changes: CellChange[]) => {
    changes.forEach((change) => {
      const ax: TextCell["type"] | NumberCell["type"] =
        Math.random() > 0.5 ? "text" : "number";
      if (change.newCell.type === ax) {
        console.log(change.newCell.type);
      }
      if (change.type === "text") {
        console.log(change.newCell.text);
      }
      if (change.type === "checkbox") {
        console.log(change.previousCell.checked);
      }
    });
  };

  // TODO ReactGrid should be able to handle this function
  // eslint-disable-next-line
  const handleChangesTest2 = (changes: CellChange<TextCell>[]) => {};

  // eslint-disable-next-line
  rows[0].cells.find((cell) => cell.type === "text" && cell.text);

  const handleChanges = (changes: CellChange<TestGridCells>[]) => {
    setRows((prevRows) => {
      changes.forEach((change) => {
        const changeRowIdx = prevRows.findIndex(
          (el) => el.rowId === change.rowId,
        );
        const changeColumnIdx = columns.findIndex(
          (el) => el.columnId === change.columnId,
        );
        if (change.type === "flag") {
          // console.log(change.newCell.text);
        }
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
    const movedElements: T[] = arr.filter((_, idx: number) =>
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

  const handleCanReorderColumns = (): boolean => {
    return true;
  };

  const handleCanReorderRows = (): boolean => {
    // const rowIndex = state.rows.findIndex((row: Row) => row.rowId === targetColumnId);
    // if (rowIndex === 0) return false;
    return true;
  };

  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
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

  const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
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
          handler: () => {
            return;
          },
        },
      ];
    }
    if (selectionMode === "column") {
      menuOptions = [
        ...menuOptions,
        {
          id: "columnOption",
          label: "Custom menu column option",
          handler: () => {
            return;
          },
        },
      ];
    }
    return [
      ...menuOptions,
      {
        id: "all",
        label: "Custom menu option",
        handler: () => {
          return;
        },
      },
    ];
  };

  const handleFocusLocationChanged = (_location: CellLocation): void => {
    return;
  };

  const handleFocusLocationChanging = (_location: CellLocation): boolean =>
    true;

  const handleSelectionChanged = (_range: Range[]): void => {
    return;
  };

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
        {config.additionalContent && (
          <div
            style={{
              height: `${config.rgViewportHeight}px`,
              backgroundColor: "#fafff3",
            }}
          >
            <Logo width={config.rgViewportWidth} />
            <Logo width={config.rgViewportWidth} />
            <Logo width={config.rgViewportWidth} />
          </div>
        )}
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
            customCellTemplates={{ flag: new FlagCellTemplate() }}
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
        {config.additionalContent && (
          <div
            style={{
              height: `${config.rgViewportHeight}px`,
              backgroundColor: "#fafff3",
            }}
          >
            <Logo width={config.rgViewportWidth} />
            <Logo width={config.rgViewportWidth} />
            <Logo width={config.rgViewportWidth} />
          </div>
        )}
      </div>
      {!config.fillViewport && (
        <>
          <input type="text" data-cy="outer-input" />
          <Logo />
        </>
      )}
      <TestGridOptionsSelect />
      <button
        onClick={() => {
          setRender((render) => !render);
        }}
      >
        Mount / Unmount
      </button>
      {config.additionalContent && (
        <>
          <h1 style={{ width: 3000 }}>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
          <h1>TEXT</h1> Test WITH IT
        </>
      )}
    </>
  );
};

const Logo = ({ width }: { width?: number }) => {
  return (
    <div style={{ display: "flex", width: `${width}px` }}>
      <h1 style={{ position: "relative" }}>ReactGrid</h1>
    </div>
  );
};

export const TestGridOptionsSelect = () => {
  const navigate = (eventValue: string) => {
    window.location.pathname = eventValue;
  };
  return (
    <form>
      <select
        defaultValue={window.location.pathname}
        onChange={(event) => navigate(event.target.value)}
      >
        <option value="/">포트로직스 커스텀 버전</option>
        <option value="/enableHeaders">Enable headers</option>
        <option value="/enableSticky">Enable sticky</option>
        <option value="/enableFrozenFocus">Enable frozen focus</option>
        <option value="/enablePinnedToBody">Enable pinned to body</option>
        <option value="/enableStickyPinnedToBody">
          Enable sticky pinned to body
        </option>
        <option value="/enableAdditionalContent">
          Enable additional content
        </option>
        <option value="/enableSymetric">Enable symetric</option>
        <option value="/enableFrozenFocus">Enable frozen focus</option>
        <option value="/enableResponsiveStickyTopLeft">
          Enable responsive top and left sticky panes
        </option>
        <option value="/enableResponsiveStickyBottomRight">
          Enable responsive bottom and right sticky panes
        </option>
        <option value="/enableResponsiveStickyPinnedToBodyTopLeft">
          Enable responsive top and left sticky panes pinned to body
        </option>
        <option value="/enableResponsiveStickyPinnedToBodyBottomRight">
          Enable responsive bottom and right sticky panes pinned to body
        </option>
        <option value="/enableSpannedCells">Enable spanned cells</option>
        <option value="/enableColumnAndRowSelection">
          Enable column and row selection
        </option>
        <option value="/enableColumnAndRowSelectionWithSticky">
          Enable column and row selection with sticky
        </option>
        <option value="/disableVirtualScrolling">
          Disable virtual scrolling
        </option>
      </select>
    </form>
  );
};

export const ExtTestGrid = ({ ...props }: TestGridProps) => {
  return (
    <div style={{ ...props.config.withDivComponentStyles }}>
      <TestGrid {...props} />
    </div>
  );
};
