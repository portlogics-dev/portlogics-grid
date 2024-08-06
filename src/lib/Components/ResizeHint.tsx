interface HintProps {
  linePosition: number;
  left: number;
  offset: number;
}

// TODO these component props should be calculated directly by behaviour (only integers)
export const ResizeHint = ({ left, linePosition, offset }: HintProps) => {
  return (
    <>
      {linePosition !== -1 && (
        <div
          className={`rg-column-resize-hint`}
          style={{
            left: linePosition - offset,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            Width: {Math.floor(linePosition - left - offset)}px
          </span>
        </div>
      )}
    </>
  );
};
