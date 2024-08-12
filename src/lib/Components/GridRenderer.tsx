import * as React from "react";

import { ErrorBoundary } from "./ErrorBoundary";
import { HiddenElement } from "./HiddenElement";
import { useReactGridState } from "./StateProvider";
import { isBrowserFirefox } from "../Functions/firefox";
import { GridRendererProps } from "../Model/InternalModel";

export const GridRenderer: React.FC<GridRendererProps> = ({
  eventHandlers,
  children,
}) => {
  const { cellMatrix, props } = useReactGridState();
  const sharedStyles = {
    width: props?.enableFullWidthHeader ? "100%" : cellMatrix.width,
    height: cellMatrix.height,
  };
  return (
    <ErrorBoundary>
      <div
        className="reactgrid"
        style={{
          position: "relative",
          paddingRight: isBrowserFirefox() ? "10px" : "",
          ...sharedStyles,
        }}
        ref={eventHandlers.reactgridRefHandler}
      >
        <div
          className="reactgrid-content"
          onKeyDown={eventHandlers.keyDownHandler}
          onKeyUp={eventHandlers.keyUpHandler}
          onCompositionEnd={eventHandlers.compositionEndHandler as any}
          onPointerDown={eventHandlers.pointerDownHandler}
          onPasteCapture={eventHandlers.pasteCaptureHandler}
          onPaste={eventHandlers.pasteHandler}
          onCopy={eventHandlers.copyHandler}
          onCut={eventHandlers.cutHandler}
          onBlur={eventHandlers.blurHandler}
          style={sharedStyles}
        >
          {children}
          <HiddenElement
            hiddenElementRefHandler={eventHandlers.hiddenElementRefHandler}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};
