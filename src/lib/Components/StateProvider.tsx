import React, { createContext, FC } from "react";

import { State } from "../Model/State";

const StateContext = createContext({} as State);

export const StateProvider: FC<{ state: State }> = ({ state, children }) => (
  <StateContext.Provider value={state}>{children}</StateContext.Provider>
);

export const useReactGridState = (): State => React.useContext(StateContext);
