import { PropsWithChildren } from "react";

import { isBrowserFirefox } from "../Functions/firefox";

interface PaneShadowProps extends PropsWithChildren {
  renderCondition: boolean;
  className: string;
  style: React.CSSProperties;
  zIndex?: number;
}

export const PaneShadow = ({
  renderCondition,
  className,
  style,
  zIndex,
  children,
}: PaneShadowProps) => {
  if (renderCondition) {
    return (
      <div
        className={`rg-pane-shadow ${className}`}
        style={{
          ...style,
          ...(isBrowserFirefox() && { zIndex }),
        }}
      >
        {children}
      </div>
    );
  }
  return null;
};
