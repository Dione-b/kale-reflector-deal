import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onWalletConnect: () => void;
  isWalletConnected: boolean;
  walletAddress?: string;
}

export const Navigation = ({ onWalletConnect, isWalletConnected, walletAddress }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navItems = [
    { label: "Market", href: "#market", active: true },
    { label: "My Dashboard", href: "#dashboard", active: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-kale rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold bg-gradient-kale bg-clip-text text-transparent">
              KALE
            </span>
            <span className="hidden sm:inline text-muted-foreground">Deal Done</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-smooth hover:text-primary",
                  item.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <Button
              variant={isWalletConnected ? "secondary" : "kale"}
              size="sm"
              onClick={onWalletConnect}
              className="hidden sm:flex"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isWalletConnected && walletAddress
                ? formatAddress(walletAddress)
                : "Connect Wallet"}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-smooth hover:text-primary",
                    item.active ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button
                variant={isWalletConnected ? "secondary" : "kale"}
                size="sm"
                onClick={() => {
                  onWalletConnect();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full sm:hidden"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isWalletConnected && walletAddress
                  ? formatAddress(walletAddress)
                  : "Connect Wallet"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};