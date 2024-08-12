import * as React from "react";

import { ContextMenu } from "./ContextMenu";
import { Line } from "./Line";
import { PanesRenderer } from "./PanesRenderer";
import { Shadow } from "./Shadow";
import { StateProvider } from "./StateProvider";
import { CellRenderer, ReactGridProps } from "../../core";
import {
  GridRenderer,
  LegacyBrowserGridRenderer,
  StateModifier,
  CellEditorRenderer,
  handleStateUpdate,
} from "../../core";
import { DefaultBehavior } from "../Behaviors/DefaultBehavior";
import { componentDidUpdate } from "../Functions/componentDidUpdate";
import { getDerivedStateFromProps } from "../Functions/getDerivedStateFromProps";
import { CellMatrixBuilder } from "../Model/CellMatrixBuilder";
import { EventHandlers } from "../Model/EventHandlers";
import { PointerEventsController } from "../Model/PointerEventsController";
import { defaultStateFields, State } from "../Model/State";

export class ReactGrid extends React.Component<ReactGridProps, State> {
  private updateState = (state: State) => this.setState(state);
  private stateUpdater = (modifier: StateModifier) =>
    handleStateUpdate(
      modifier(this.state) as State,
      this.state,
      this.props,
      this.updateState,
    );
  private pointerEventsController = new PointerEventsController(
    this.stateUpdater,
  );
  private eventHandlers = new EventHandlers(
    this.stateUpdater,
    this.pointerEventsController,
  );
  private cellMatrixBuilder = new CellMatrixBuilder();
  // 초기 state 초기화
  state: State = {
    update: this.stateUpdater,
    ...defaultStateFields,
    currentBehavior: new DefaultBehavior(),
    cellMatrix: this.cellMatrixBuilder
      .setProps(this.props)
      .fillRowsAndCols()
      .fillRowGroups()
      .setRangesToRenderLookup()
      .fillSticky()
      .fillScrollableRange()
      .setEdgeLocations()
      .getCellMatrix(),
  };

  static getDerivedStateFromProps(
    props: ReactGridProps,
    state: State,
  ): State | null {
    try {
      return getDerivedStateFromProps(props, state);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public clearSelections = (): void => {
    this.setState((prevState) => {
      if (
        prevState.selectedIds.length === 0 &&
        prevState.selectedIndexes.length === 0 &&
        prevState.selectedRanges.length === 0
      ) {
        return null;
      }
      return {
        selectedIds: [],
        selectedIndexes: [],
        selectedRanges: [],
      };
    });
  };

  componentDidUpdate(prevProps: ReactGridProps, prevState: State): void {
    if (!prevState.reactGridElement && this.state.reactGridElement) {
      this.state.scrollableElement?.addEventListener(
        "scroll",
        this.eventHandlers.scrollHandler,
      );
    }
    componentDidUpdate(prevProps, prevState, this.state);
  }

  componentDidMount(): void {
    window.addEventListener("resize", this.eventHandlers.windowResizeHandler);
  }

  componentWillUnmount(): void {
    window.removeEventListener(
      "resize",
      this.eventHandlers.windowResizeHandler,
    );
    this.state.scrollableElement?.removeEventListener(
      "scroll",
      this.eventHandlers.scrollHandler,
    );
    this.setState({
      contextMenuPosition: { top: -1, left: -1 },
    });
  }

  render(): React.ReactNode {
    const { state, eventHandlers } = this;

    if (state.legacyBrowserMode) {
      return (
        <StateProvider state={state}>
          <LegacyBrowserGridRenderer eventHandlers={eventHandlers} />
        </StateProvider>
      );
    }

    return (
      <StateProvider state={state}>
        <GridRenderer eventHandlers={eventHandlers}>
          <PanesRenderer cellRenderer={CellRenderer} />

          <Line />

          <Shadow />

          <ContextMenu />

          {state.currentlyEditedCell && <CellEditorRenderer />}
        </GridRenderer>
      </StateProvider>
    );
  }
}
