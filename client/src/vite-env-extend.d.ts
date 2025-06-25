
/// <reference types="vite/client" />

interface Window {
  TradingView: {
    widget: new (config: any) => any;
  };
}
