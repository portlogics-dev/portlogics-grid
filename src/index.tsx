import * as React from "react";
import ReactDOM from "react-dom/client";

import { ReactGrid } from "./core";
import { PortlogicsTestGrid } from "./test/PortlogicsTestGrid";
import {
  config,
  disabledInitialFocusLocationConfig,
  disableVirtualScrolling,
  enableAdditionalContentConfig,
  enableAdditionalContentWithFlexRowConfig,
  enableBottomRightResponsiveSticky,
  enableBottomRightResponsiveStickyPinnedToBody,
  enablePinnedToBodyConfig,
  enableSpannedCells,
  enableSymetric,
  enableTopLeftResponsiveSticky,
  enableTopLeftResponsiveStickyPinnedToBody,
} from "./test/testEnvConfig";
import { ExtTestGrid } from "./test/TestGrid";

function App() {
  switch (window.location.pathname) {
    case "/enableColumnAndRowSelection":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={config}
          enableColumnAndRowSelection
        />
      );

    case "/enableColumnAndRowSelectionWithSticky":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={config}
          enableColumnAndRowSelection
          enableSticky
        />
      );

    case "/enableSticky":
      return <ExtTestGrid component={ReactGrid} config={config} enableSticky />;

    case "/enableHeaders":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={disabledInitialFocusLocationConfig}
          firstRowType={"header"}
          firstColType={"header"}
          cellType={"header"}
          enableColumnAndRowSelection
        />
      );

    case "/enableFrozenFocus":
      return (
        <ExtTestGrid component={ReactGrid} config={config} enableFrozenFocus />
      );

    case "/enablePinnedToBody":
      return (
        <ExtTestGrid component={ReactGrid} config={enablePinnedToBodyConfig} />
      );

    case "/enableStickyPinnedToBody":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={enablePinnedToBodyConfig}
          enableSticky
        />
      );

    case "/enableAdditionalContent":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={
            window.location.search.includes("flexRow=true")
              ? enableAdditionalContentWithFlexRowConfig
              : enableAdditionalContentConfig
          }
        />
      );

    case "/enableSymetric":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={enableSymetric}
          enableSticky
        />
      );

    case "/enableResponsiveStickyTopLeft":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={enableTopLeftResponsiveSticky}
          enableSticky
        />
      );

    case "/enableResponsiveStickyBottomRight":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={enableBottomRightResponsiveSticky}
          enableSticky
        />
      );

    case "/enableResponsiveStickyPinnedToBodyTopLeft":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={enableTopLeftResponsiveStickyPinnedToBody}
          enableSticky
        />
      );

    case "/enableResponsiveStickyPinnedToBodyBottomRight":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={enableBottomRightResponsiveStickyPinnedToBody}
          enableSticky
        />
      );

    case "/enableSpannedCells":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={enableSpannedCells}
          cellType={"header"}
        />
      );

    case "/disableVirtualScrolling":
      return (
        <ExtTestGrid
          component={ReactGrid}
          config={disableVirtualScrolling}
          cellType={"header"}
        />
      );

    default:
      return (
        <PortlogicsTestGrid
          component={ReactGrid}
          config={config}
          enableColumnAndRowSelection
          enableGroupSelection
        />
      );
  }
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
