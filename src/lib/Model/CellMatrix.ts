import { GridColumn, GridRow, Location } from "./InternalModel";
import { Cell, Column, Id, Row } from "./PublicModel";
import { Range } from "./Range";

export interface IndexLookup {
  [id: string]: number;
}

// INTERNAL
export interface CellMatrixProps {
  columns: Column[];
  rows: Row<Cell>[];
  stickyTopRows?: number;
  stickyLeftColumns?: number;
  stickyRightColumns?: number;
  stickyBottomRows?: number;
  minColumnWidth?: number;
}

export interface StickyRanges {
  stickyTopRange: Range;
  stickyLeftRange: Range;
  stickyRightRange: Range;
  stickyBottomRange: Range;
}

export interface SpanLookup {
  range?: Range;
}

// INTERNAL
export class CellMatrix {
  static DEFAULT_ROW_HEIGHT = 25;
  static DEFAULT_COLUMN_WIDTH = 150;
  static MIN_COLUMN_WIDTH = 40;

  props!: CellMatrixProps;
  scrollableRange!: Range;
  width = 0;
  height = 0;

  columns!: GridColumn[];
  rows!: GridRow[];
  rowGroups!: GridRow[][];
  first!: Location;
  last!: Location;

  rowIndexLookup: IndexLookup = {};
  columnIndexLookup: IndexLookup = {};

  spanCellLookup: { [location: string]: SpanLookup } = {};

  rangesToRender: { [location: string]: SpanLookup } = {};

  constructor(public ranges: StickyRanges) {}

  getRange(start: Location, end: Location): Range {
    const cols = this.columns.slice(
      Math.min(start.column.idx, end.column.idx),
      Math.max(start.column.idx, end.column.idx) + 1,
    );
    const rows = this.rows.slice(
      Math.min(start.row.idx, end.row.idx),
      Math.max(start.row.idx, end.row.idx) + 1,
    );

    return new Range(rows, cols);
  }

  getLocation(rowIdx: number, columnIdx: number): Location {
    return { row: this.rows[rowIdx], column: this.columns[columnIdx] };
  }

  getLocationById(rowId: Id, columnId: Id): Location {
    try {
      const row = this.rows[this.rowIndexLookup[rowId]];
      const column = this.columns[this.columnIndexLookup[columnId]];
      return this.validateLocation({ row, column });
    } catch (_error) {
      throw new RangeError(`column: '${columnId}', row: '${rowId}'`);
    }
  }

  // 추가. focusLocation이 소속된 groupId를 반환
  getSelectedRowsByLocation(focusedLocation: Location): Range | undefined {
    // 그룹 포커싱을 위한 동일 groupId 보유 행 배열을 얻으려면?
    // 1. 각 row에 groupId를 심어줘야한다
    // 2. focusedLocation.row.groupId로 가져와서 rowGroups 배열에 인덱스 검색해 Row[] 데이터를 반환한다
    // 그러면 rowGroups는 Row[][] 타입일탠데, 어디에 저장시켜놓고 언제 업데이트하며 어디서 가져다 써야하는가?
    // where? rowGroups는 우선 cellMatrix 안에서 관리돼야한다(columns, rows가 여기서 관리되기 때문)
    // when? rowGroups 자체를 외부로부터 100% 의존하기에는 프로그램 설계 상 아구가 맞지 않다. 내부에서 계산해 저장한다.
    // how? 셀마다 groupId를 넣어줄 필요가 있나? row 레벨에서 groupId를 가지고 있으면 되는거 아닌가?
    // disabled는 셀마다 구별돼야하는게 맞음. 하지만 groupSelection은 cell 레벨까지 내려갈 필요가 전혀 없음
    // 그러면 cell에선 groupId를 뺴고, 서버 데이터 구조를 Row<DefaultCellTypes | DisabledCell> 타입으로 구성하면 된다
    // 지금은 getRow()에서 row마다 groupId를 집어넣어주고, 서버 데이터 양식에 올려두자
    const rowGroupId = focusedLocation.row.groupId;

    if (rowGroupId !== undefined && Number.isInteger(rowGroupId)) {
      return new Range(this.rowGroups[rowGroupId], this.columns);
    }
  }

  validateLocation(location: Location): Location {
    const colIdx =
      this.columnIndexLookup[location.column.columnId] ??
      Math.min(location.column.idx, this.last.column.idx);
    const rowIdx =
      this.rowIndexLookup[location.row.rowId] ??
      Math.min(location.row.idx, this.last.row.idx);
    return this.getLocation(rowIdx, colIdx);
  }

  validateRange(range: Range): Range {
    return this.getRange(
      this.validateLocation(range.first),
      this.validateLocation(range.last),
    );
  }

  getCell(location: Location): Cell {
    return this.rows[location.row.idx].cells[location.column.idx];
  }
}

export function translateLocationIdxToLookupKey(
  idx: number,
  idy: number,
): string {
  return `${idx}, ${idy}`;
}
