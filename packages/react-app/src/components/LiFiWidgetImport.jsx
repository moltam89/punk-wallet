import React from "react";
import { LiFiWidget, WidgetConfig } from '@lifi/widget';


const widgetConfig = {
  variant: 'drawer',
  containerStyle: {
    border: '1px solid rgb(234, 234, 234)',
    borderRadius: '16px',
  },
};

export default function LiFiWidgetImport( {} ) {
  return (
    <LiFiWidget integrator="PunkWallet" config={widgetConfig} />
  );
}
