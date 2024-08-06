/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext } from "react";

import { State } from "../Model/State";

const StateContext = createContext({} as State);

export const StateProvider = ({
  state,
  children,
}: {
  state: State;
  children: ReactNode;
}) => <StateContext.Provider value={state}>{children}</StateContext.Provider>;

export const useReactGridState = (): State => useContext(StateContext);
