import { useEffect, useState } from "react";
import { LoanCard } from "./LoanCard";
import { CreateLoanForm } from "./CreateLoanForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { readFromLocalStorage, writeToLocalStorage, STORAGE_KEYS } from "@/lib/storage";
import type { LoanOffer } from "./LoanCard";

// No mocks: all offers come from localStorage

interface MarketViewProps {
  className?: string;
}

export const MarketView = ({ className }: MarketViewProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "high-yield" | "safe">("all");
  const [offers, setOffers] = useState<LoanOffer[]>(() => readFromLocalStorage<LoanOffer[]>(STORAGE_KEYS.offers, []));

  useEffect(() => {
    writeToLocalStorage(STORAGE_KEYS.offers, offers);
  }, [offers]);

  // One-time migration: remove demo data that may exist from earlier versions
  useEffect(() => {
    if (offers.length === 0) return;
    const demoAddresses = new Set([
      "0x742d35cc6798c532cf53de8a200c04b3e2a6c3ef",
      "0x123d35cc6798c532cf53de8a200c04b3e2a6c3ab",
      "0x456d35cc6798c532cf53de8a200c04b3e2a6c3cd",
    ]);
    const allAreDemos = offers.every(o => demoAddresses.has(o.borrowerAddress));
    if (allAreDemos) {
      setOffers([]);
      writeToLocalStorage(STORAGE_KEYS.offers, []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLoans = offers.filter(loan => {
    const matchesSearch = loan.borrowerAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "high-yield") return matchesSearch && loan.interestRate >= 5.5;
    if (filterType === "safe") return matchesSearch && (loan.collateralValueBRL / loan.requestedAmount) > 1.5;
    
    return matchesSearch;
  });

  const handleFundLoan = (loanId: string) => {
    setOffers(prev => {
      const next = prev.map(o => o.id === loanId ? { ...o, status: "funded" as const } : o);
      // Persist lender's portfolio
      const funded = next.find(o => o.id === loanId);
      if (funded) {
        const myLoans = readFromLocalStorage<any[]>(STORAGE_KEYS.myLoans, []);
        const totalOwed = funded.requestedAmount * (1 + funded.interestRate / 100);
        const lenderAddress = readFromLocalStorage<string | undefined>(STORAGE_KEYS.walletAddress, undefined) || "0x000000000000000000000000000000000000dEaD";
        const lenderLoan = {
          id: `myloan-${funded.id}`,
          loanAmount: funded.requestedAmount,
          tokenSymbol: funded.requestedToken,
          collateralAmount: funded.collateralAmount,
          collateralSymbol: funded.collateralToken,
          interestRate: funded.interestRate,
          totalOwed,
          daysRemaining: funded.duration,
          borrowerAddress: funded.borrowerAddress,
          collateralValueBRL: funded.collateralValueBRL,
          status: "active" as const,
        };
        writeToLocalStorage(STORAGE_KEYS.myLoans, [lenderLoan, ...myLoans]);

        // Persist borrower's debt record
        const myDebts = readFromLocalStorage<any[]>(STORAGE_KEYS.myDebts, []);
        const borrowerDebt = {
          id: `debt-${funded.id}`,
          loanAmount: funded.requestedAmount,
          tokenSymbol: funded.requestedToken,
          collateralAmount: funded.collateralAmount,
          collateralSymbol: funded.collateralToken,
          interestRate: funded.interestRate,
          totalOwed,
          daysRemaining: funded.duration,
          lenderAddress,
          collateralValueBRL: funded.collateralValueBRL,
          status: "active" as const,
        };
        writeToLocalStorage(STORAGE_KEYS.myDebts, [borrowerDebt, ...myDebts]);
      }
      return next;
    });
  };

  const handleCreateLoan = () => {
    // The form already persisted the offer. Reload from storage and close form.
    const saved = readFromLocalStorage<LoanOffer[]>(STORAGE_KEYS.offers, []);
    setOffers(saved);
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Create New Offer</h1>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            Back to Market
          </Button>
        </div>
        <CreateLoanForm onCreateLoan={handleCreateLoan} />
      </div>
    );
  }

  const activeOffers = offers.filter(o => o.status === "active");
  const totalTVL = activeOffers.reduce((acc, o) => acc + (o.collateralValueBRL || 0), 0);
  const averageRate = activeOffers.length > 0
    ? activeOffers.reduce((acc, o) => acc + (o.interestRate || 0), 0) / activeOffers.length
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Explore Loan Offers</h1>
            <p className="text-muted-foreground">
              Find KALE-backed lending opportunities with real-time collateral values
            </p>
          </div>
          <Button variant="kale" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Offer
          </Button>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-kale-green" />
              <span className="text-sm text-muted-foreground">Total TVL</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              R$ {totalTVL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
            <div className="text-sm text-muted-foreground">Active Offers</div>
            <div className="text-xl font-bold text-foreground">{activeOffers.length}</div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
            <div className="text-sm text-muted-foreground">Average Rate</div>
            <div className="text-xl font-bold text-kale-green">
              {averageRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by borrower address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "kale" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "high-yield" ? "kale" : "outline"}
              size="sm"
              onClick={() => setFilterType("high-yield")}
            >
              <Badge variant="secondary" className="mr-1">5.5%+</Badge>
              High Yield
            </Button>
            <Button
              variant={filterType === "safe" ? "kale" : "outline"}
              size="sm"
              onClick={() => setFilterType("safe")}
            >
              <Badge variant="secondary" className="mr-1">150%+</Badge>
              Safe
            </Button>
          </div>
        </div>
      </div>

      {/* Loan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLoans.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            onFund={handleFundLoan}
          />
        ))}
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchTerm || filterType !== "all" 
              ? "No offers found with the applied filters" 
              : "No offers available at the moment"
            }
          </div>
          <Button variant="kale" onClick={() => setShowCreateForm(true)}>
            Be the first to create an offer
          </Button>
        </div>
      )}
    </div>
  );
};