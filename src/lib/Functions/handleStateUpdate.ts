import { ReactGridProps } from "../Model/PublicModel";
import { State } from "../Model/State";

export function handleStateUpdate<TState extends State = State>(
  newState: TState,
  state: TState,
  props: ReactGridProps,
  setState: (state: TState) => void,
): void {
  const changes = [...newState.queuedCellChanges];
  if (changes.length > 0) {
    if (props.onCellsChanged) {
      props.onCellsChanged([...changes]);
    }
    changes.forEach(() => newState.queuedCellChanges.pop());
  }
  if (newState !== state) {
    // 위 queuedCellChanges를 처리한 후에 state가 변경되었는지 확인(queuedCellChanges가 차있었다면 처리 후엔 배열이 비워지므로 setState 동작)
    setState(newState);
  }
}
