declare module "qr-link-widget" {
    import * as React from "react";
  
    export interface QrLinkWidgetProps {
      url: string;
      title?: string;
      description?: string;
      size?: number;
      showCopyButton?: boolean;
      className?: string;
    }
  
    export const QrLinkWidget: React.FC<QrLinkWidgetProps>;
  
    export default QrLinkWidget;
  }
  