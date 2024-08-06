import { DataNode, FlattenedDataNode } from "./data";
import { GridRow } from "./PortlogicsTestGrid";
import { Column, Row } from "../core";

export function flattenData(data: DataNode[]): {
  rows: GridRow[];
  columns: Column[];
} {
  const result: FlattenedDataNode[] = [];
  // columns는 서버에서 보내준다고 가정 하에 하드코딩함
  const columns: Column[] = [
    { columnId: "index", width: 30 },
    { columnId: "MASTER_BL", width: 200, resizable: true },
    { columnId: "HOUSE_BL", width: 150, resizable: true },
    { columnId: "TRADE_DIRECTION", width: 100, resizable: true },
    { columnId: "INCOTERMS", width: 100, resizable: true },
    { columnId: "신규 오더번호", width: 200, resizable: true },
    { columnId: "기존 오더번호", width: 100, resizable: true },
    { columnId: "SHPR", width: 200, resizable: true },
    { columnId: "CARGO_TYPE", width: 100, resizable: true },
    { columnId: "CONTAINER_QTY", width: 100, resizable: true },
    { columnId: "POL", width: 100, resizable: true },
    { columnId: "POD", width: 100, resizable: true },
    { columnId: "CARRIER", width: 150, resizable: true },
    { columnId: "VESSEL", width: 150, resizable: true },
    { columnId: "VOYAGE", width: 150, resizable: true },
    { columnId: "ETD", width: 150, resizable: true },
    { columnId: "ETA", width: 150, resizable: true },
    { columnId: "PURCHASE_ORDER_NUMBER", width: 150, resizable: true },
    { columnId: "CONTAINER_NUMBER", width: 150, resizable: true },
  ];

  function initializeRow(data: Omit<DataNode, "children">, disabled?: boolean) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        { value, disabled: disabled ?? false },
      ]),
    );
  }

  function recurse(currentNode: DataNode, groupId: number) {
    const { children, ...parentProps } = currentNode;
    // node의 index를 groupId로 값에 끼워주기
    const indexedRowWithoutChildren = initializeRow(parentProps);

    if (!children || children.length === 0) {
      result.push({
        ...{ index: { value: rowIndex, disabled: false }, groupId },
        ...indexedRowWithoutChildren,
      });
      rowIndex++;
      return;
    }

    const disabledRow = initializeRow(parentProps, true);

    children.forEach((child, index) => {
      const { children: childChildren, ...childProps } = child;
      // 첫번째 행은 disabled: false, 나머지는 disabled: true
      const initializedChildProps = initializeRow(childProps);
      const mergedProps =
        index === 0
          ? {
              ...{ index: { value: rowIndex, disabled: false }, groupId },
              ...indexedRowWithoutChildren,
              ...initializedChildProps,
            }
          : {
              ...{ index: { value: rowIndex, disabled: false }, groupId },
              ...disabledRow,
              ...initializedChildProps,
            };
      result.push(mergedProps);
      rowIndex++;

      if (childChildren) {
        recurse({ ...mergedProps, children: childChildren }, groupId);
      }
    });
  }

  let rowIndex = 0;
  data.forEach((node, index) => recurse(node, index));

  const headerRow: Row = {
    rowId: "header",
    cells: columns.map((row) =>
      row.columnId === "index"
        ? { type: "header", text: "" }
        : {
            type: "header",
            text: row.columnId as string,
          },
    ),
  };

  const rows: GridRow[] = [
    headerRow,
    ...result.map<GridRow>((row, idx) => ({
      rowId: idx,
      groupId: row.groupId, // row에 groupId 박아주기 성공. 이제 focusLocation()으로 groupId 추적 가능
      cells: Object.entries(row)
        .filter(([key]) => key !== "groupId") // row에서 groupId 제거 안하면 columns에 없는 값 생김
        .map(([, value], index) => {
          if (typeof value === "object" && value !== null && "value" in value) {
            return {
              type:
                index === 0 ? "header" : value.disabled ? "disabled" : "text",
              text: String(value.value ?? ""),
            };
          } else {
            return {
              type: "text",
              text: String(value ?? ""),
            };
          }
        }),
    })),
  ];

  return { rows, columns };
}
