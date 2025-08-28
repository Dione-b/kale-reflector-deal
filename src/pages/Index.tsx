import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { MarketView } from "@/components/MarketView";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<"market" | "dashboard">("market");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>();

  const handleWalletConnect = () => {
    if (!isWalletConnected) {
      // Simulate wallet connection
      setIsWalletConnected(true);
      setWalletAddress("0x742d35cc6798c532cf53de8a200c04b3e2a6c3ef");
      console.log("Wallet connected");
    } else {
      // Disconnect wallet
      setIsWalletConnected(false);
      setWalletAddress(undefined);
      console.log("Wallet disconnected");
    }
  };

  // Handle navigation clicks
  useEffect(() => {
    const handleNavigationClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[href="#market"]')) {
        e.preventDefault();
        setCurrentView("market");
      } else if (target.closest('a[href="#dashboard"]')) {
        e.preventDefault();
        setCurrentView("dashboard");
      }
    };

    document.addEventListener('click', handleNavigationClick);
    return () => document.removeEventListener('click', handleNavigationClick);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation 
        onWalletConnect={handleWalletConnect}
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        currentView={currentView}
      />

      {/* Main Content */}
      <main className="pt-16">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          {currentView === "market" && <MarketView />}
          {currentView === "dashboard" && <Dashboard />}
        </div>
      </main>

    </div>
  );
};

export default Index;
