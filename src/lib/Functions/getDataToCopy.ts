import { emptyCell } from "./emptyCell";
import { getCompatibleCellAndTemplate } from "./getCompatibleCellAndTemplate";
import { tryAppendChange } from "./tryAppendChange";
import { Location } from "../Model/InternalModel";
import { Id } from "../Model/PublicModel";
import { Range } from "../Model/Range";
import { State } from "../Model/State";

export function getDataToCopy(
  state: State,
  activeSelectedRange: Range,
  removeValues = false,
): { div: HTMLDivElement; text: string } {
  const { div, table, location } = createHTMLElements(activeSelectedRange);
  const text = copyElements(
    state,
    location,
    activeSelectedRange,
    table,
    removeValues,
  );
  setStyles(div, table);
  return { div, text };
}

function copyElements(
  state: State,
  _location: Location,
  activeSelectedRange: Range,
  table: HTMLTableElement,
  removeValues: boolean,
): string {
  let text = "";
  let prevId: Id = "";
  activeSelectedRange.rows.forEach((row) => {
    const tableRow = table.insertRow();
    activeSelectedRange.columns.forEach((column) => {
      const tableCell = tableRow.insertCell();
      const { cell } = getCompatibleCellAndTemplate(state, { row, column });
      const validatedText = cell.text || " ";
      tableCell.textContent = validatedText;
      text =
        prevId === ""
          ? cell.text
          : text + (prevId === row.rowId ? "\t" : "\n") + validatedText;
      prevId = row.rowId;
      tableCell.setAttribute("data-reactgrid", JSON.stringify(cell));
      tableCell.style.color = "initial";
      tableCell.style.border = "initial";
      tableCell.style.fontSize = "initial";
      tableCell.style.backgroundColor = "initial";
      clearCell(state as State, { row, column }, removeValues);
    });
  });

  return text;
}

// ? unused?
export function processSingleCell(
  tableRow: HTMLTableRowElement,
  state: State,
  location: Location,
): void {
  const tableCell: HTMLTableDataCellElement = tableRow.insertCell();
  const { cell } = getCompatibleCellAndTemplate(state, location);
  tableCell.textContent = cell.text ? cell.text : " ";
  tableCell.setAttribute("data-reactgrid", JSON.stringify(cell));
  tableCell.style.border = "initial";
}

export function createHTMLElements(activeSelectedRange: Range): {
  div: HTMLDivElement;
  table: HTMLTableElement;
  location: Location;
} {
  const div = document.createElement("div");
  const table = document.createElement("table");
  table.setAttribute("empty-cells", "show");
  table.setAttribute("data-reactgrid", "reactgrid-content");
  const location = {
    row: activeSelectedRange.first.row,
    column: activeSelectedRange.first.column,
  };
  return { div, table, location };
}

export function setStyles(div: HTMLDivElement, table: HTMLTableElement): void {
  div.classList.add("rg-copy-container");
  div.setAttribute("contenteditable", "true");
  div.style.position = "fixed";
  div.style.top = "50%";
  div.style.left = "50%";
  div.appendChild(table);
}

export function clearCell(
  state: State,
  location: Location,
  removeValues: boolean,
): void {
  if (removeValues) {
    tryAppendChange(state, location, emptyCell);
  }
}
