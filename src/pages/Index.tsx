
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Download from "@/components/Download";
import Footer from "@/components/Footer";
import TradingViewChart from "@/components/TradingViewChart";

const Index = () => {
  useEffect(() => {
    // Initialize TradingView widget for the hero section
    const heroChartContainer = document.getElementById("tradingview-widget");
    if (heroChartContainer) {
      heroChartContainer.innerHTML = "";
      const chart = document.createElement("div");
      chart.id = "tradingview_btcusd";
      heroChartContainer.appendChild(chart);
      
      const chartInstance = new TradingViewChart({
        symbol: "BTCUSD",
        theme: "dark",
        height: 400,
        interval: "1D"
      });
      
      // Add the chart component to the DOM
      const chartElement = chartInstance.render();
      if (chartElement) {
        heroChartContainer.appendChild(chartElement);
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Download />
      <Footer />
    </div>
  );
};

export default Index;
