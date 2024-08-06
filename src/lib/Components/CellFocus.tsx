import { translateLocationIdxToLookupKey } from "../Model/CellMatrix";
import { Location } from "../Model/InternalModel";
import { State } from "../Model/State";

interface FeaturedCellProps {
  location: Location;
  state?: State;
  borderColor?: string;
  className?: string;
}

export const CellHighlight = ({
  borderColor,
  location,
  className,
  state,
}: FeaturedCellProps) => {
  const { idx: colIdx } = location.column;
  const { idx: rowIdx } = location.row;
  const range =
    state?.cellMatrix.rangesToRender[
      translateLocationIdxToLookupKey(colIdx, rowIdx)
    ]?.range;
  if (!range) {
    return null;
  }
  return (
    <FeaturedCell
      location={location}
      className={`rg-cell-highlight ${className || ""}`}
      borderColor={borderColor}
      width={range.width}
      height={range.height}
    />
  );
};

export const CellFocus = ({
  borderColor,
  location,
  className,
}: FeaturedCellProps) => {
  return (
    <FeaturedCell
      location={location}
      className={`rg-cell-focus ${className || ""}`}
      borderColor={borderColor}
      width={location.column.width}
      height={location.row.height}
    />
  );
};

const FeaturedCell = ({
  className,
  location,
  borderColor,
  height,
  width,
}: FeaturedCellProps & { width: number; height: number }) => {
  return (
    <div
      className={className}
      style={{
        top: location.row.top - (location.row.top === 0 ? 0 : 1),
        left: location.column.left - (location.column.left === 0 ? 0 : 1),
        width: width + (location.column.left === 0 ? 0 : 1),
        height: height + (location.row.top === 0 ? 0 : 1),
        borderColor: `${borderColor}`,
      }}
    />
  );
};
