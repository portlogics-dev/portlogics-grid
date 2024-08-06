import { PropsWithChildren, useEffect, useReducer, useRef } from "react";

import { calculateCellEditorPosition } from "../../Functions/cellEditorCalculator";
import { tryAppendChange } from "../../Functions/tryAppendChange";
import { Location } from "../../Model/InternalModel";
import { Compatible, Cell } from "../../Model/PublicModel";
import { State } from "../../Model/State";
import { useReactGridState } from "../StateProvider";

export interface CellEditorOffset<TState extends State = State> {
  top: number;
  left: number;
  state: TState;
  location: Location;
}

interface CellEditorProps extends PropsWithChildren {
  cellType: string;
  style: React.CSSProperties;
}

export interface PositionState<TState extends State = State> {
  state: TState;
  location: Location;
}

export const CellEditorRenderer = () => {
  const state = useReactGridState();
  const { currentlyEditedCell, focusedLocation: location } = state;

  const renders = useRef(0);

  const [position, dispatch] = useReducer(
    calculateCellEditorPosition as (options: PositionState) => any,
    { state, location },
  ); // used to lock cell editor position

  useEffect(() => {
    renders.current += 1;
    dispatch();
  }, []);

  if (!currentlyEditedCell || !location || renders.current === 0) {
    // prevents to unexpectly opening cell editor on cypress
    return null;
  }

  const cellTemplate = state.cellTemplates[currentlyEditedCell.type];
  return (
    <CellEditor
      cellType={currentlyEditedCell.type}
      style={{
        top: position.top && position.top - 1,
        left: position.left && position.left - 1,
        height: location.row.height + 1,
        width: location.column.width + 1,
        position: "fixed",
      }}
    >
      {cellTemplate.render(
        currentlyEditedCell,
        true,
        (cell: Compatible<Cell>, commit: boolean) => {
          state.currentlyEditedCell = commit ? undefined : cell;
          if (commit) state.update((s) => tryAppendChange(s, location, cell));
        },
      )}
    </CellEditor>
  );
};

const CellEditor = ({ style, cellType, children }: CellEditorProps) => {
  return (
    <div className={`rg-celleditor rg-${cellType}-celleditor`} style={style}>
      {children}
    </div>
  );
};
