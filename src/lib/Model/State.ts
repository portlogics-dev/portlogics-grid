import { Behavior } from "./Behavior";
import { CellMatrix } from "./CellMatrix";
import { Location, Orientation } from "./InternalModel";
import {
  CellTemplates,
  Cell,
  ReactGridProps,
  Compatible,
  Highlight,
  CellChange,
  Id,
  SelectionMode,
} from "./PublicModel";
import { Range } from "./Range";
import { DefaultBehavior } from "../Behaviors/DefaultBehavior";
import { defaultCellTemplates } from "../Functions/defaultCellTemplates";
import { isBrowserIE } from "../Functions/internetExplorer";
import { isBrowserEdge } from "../Functions/microsoftEdge";

export type StateModifier<TState extends State = State> = (
  state: TState,
) => TState;
export type StateUpdater = (modifier: StateModifier) => void;

export interface State<
  TCellMatrix extends CellMatrix = CellMatrix,
  TBehavior extends Behavior = Behavior,
> {
  update: StateUpdater;
  readonly props?: ReactGridProps;
  readonly legacyBrowserMode: boolean;
  readonly cellMatrix: TCellMatrix;
  readonly currentBehavior: TBehavior;
  readonly focusedLocation?: Location;

  readonly cellTemplates: CellTemplates;
  hiddenFocusElement?: HTMLDivElement; // updated without setState
  readonly reactGridElement?: HTMLDivElement;
  readonly scrollableElement?: HTMLElement | (Window & typeof globalThis);

  readonly queuedCellChanges: CellChange[];
  currentlyEditedCell?: Compatible<Cell>;

  readonly highlightLocations: Highlight[];

  // VISIBLE RANGE
  readonly visibleRange?: Range;

  // STICKY
  readonly leftStickyColumns?: number;
  readonly topStickyRows?: number;

  // SCROLLS
  readonly topScrollBoudary: number;
  readonly bottomScrollBoudary: number;
  readonly leftScrollBoudary: number;
  readonly rightScrollBoudary: number;

  readonly enableGroupIdRender: boolean;

  readonly enableFillHandle: boolean;
  readonly enableRangeSelection: boolean;
  readonly enableColumnSelection: boolean;
  readonly enableRowSelection: boolean;
  readonly enableGroupSelection: boolean;
  readonly disableVirtualScrolling: boolean;
  readonly contextMenuPosition: { top: number; left: number };
  readonly lineOrientation: Orientation;
  readonly linePosition: number;
  readonly shadowSize: number;
  readonly shadowPosition: number;
  readonly shadowCursor: string;
  readonly selectionMode: SelectionMode;
  readonly selectedRanges: Range[];
  readonly selectedRowGroups: Range[]; // 그룹 포커싱을 위해 추가
  readonly selectedIndexes: number[];
  readonly selectedIds: Id[];
  readonly activeSelectedRangeIdx: number;
  readonly copyRange?: Range;
  readonly rightStickyColumns: number | undefined;
  readonly bottomStickyRows: number | undefined;
}

export const defaultStateFields = {
  legacyBrowserMode: isBrowserIE() || isBrowserEdge(),
  focusedLocation: undefined,
  currentBehavior: new DefaultBehavior(),
  cellTemplates: defaultCellTemplates,
  hiddenFocusElement: undefined,
  reactGridElement: undefined,
  scrollableElement: undefined,
  queuedCellChanges: [],
  currentlyEditedCell: undefined,
  highlightLocations: [],
  visibleRange: undefined,
  topScrollBoudary: -1,
  bottomScrollBoudary: -1,
  leftScrollBoudary: -1,
  rightScrollBoudary: -1,
  enableGroupIdRender: false,
  enableGroupSelection: false,
  leftStickyColumns: undefined,
  topStickyRows: undefined,
  enableFillHandle: false,
  enableRangeSelection: true,
  enableColumnSelection: false,
  enableRowSelection: false,
  contextMenuPosition: { top: -1, left: -1 },
  lineOrientation: "horizontal" as Orientation,
  linePosition: -1,
  shadowSize: 0,
  shadowPosition: -1,
  shadowCursor: "default",
  selectionMode: "range" as SelectionMode,
  selectedRanges: [],
  selectedRowGroups: [],
  selectedIndexes: [],
  selectedIds: [],
  activeSelectedRangeIdx: 0,
  copyRange: undefined,
  rightStickyColumns: undefined,
  bottomStickyRows: undefined,
  disableVirtualScrolling: false,
};
