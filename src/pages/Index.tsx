
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Download from "@/components/Download";
import Footer from "@/components/Footer";
import Partners from "@/components/Partners";
import RewardsCenter from "@/components/RewardsCenter";
import TradingViewChart from "@/components/TradingViewChart";

const Index = () => {
  useEffect(() => {
    // Initialize TradingView widget for the hero section
    const heroChartContainer = document.getElementById("tradingview-widget");
    if (heroChartContainer) {
      heroChartContainer.innerHTML = "";
      
      // Create a container for the TradingView widget
      const chartContainer = document.createElement("div");
      chartContainer.id = "tradingview_btcusd";
      chartContainer.style.width = "100%";
      chartContainer.style.height = "400px";
      heroChartContainer.appendChild(chartContainer);
      
      // Load TradingView script
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: true,
            symbol: "BTCUSD",
            interval: "1D",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "candlestick",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            hide_top_toolbar: false,
            allow_symbol_change: true,
            container_id: "tradingview_btcusd",
          });
        }
      };
      
      heroChartContainer.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <RewardsCenter />
      <Testimonials />
      <Download />
      <Partners />
      <Footer />
    </div>
  );
};

export default Index;
