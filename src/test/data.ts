type NodeValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | DataNode[]
  | undefined
  | null;

export interface DataNode {
  [key: string]: NodeValue;
  children?: DataNode[];
}

export type FlattenedDataNode = {
  [key: string]:
    | {
        value: NodeValue; // 실제 값
        disabled: boolean; // ReactGrid 렌더링용 속성
      }
    | number;
  groupId: number; // groupId 생성용 필드. 순회돌 때 제거됨
};
