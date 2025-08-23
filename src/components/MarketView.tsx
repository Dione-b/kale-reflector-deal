import { useState } from "react";
import { LoanCard } from "./LoanCard";
import { CreateLoanForm } from "./CreateLoanForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for loan offers
const mockLoans = [
  {
    id: "1",
    borrowerAddress: "0x742d35cc6798c532cf53de8a200c04b3e2a6c3ef",
    requestedAmount: 100,
    requestedToken: "USDC",
    collateralAmount: 5000,
    collateralToken: "KALE",
    interestRate: 5.5,
    duration: 30,
    collateralValueBRL: 750.12,
    status: "active" as const
  },
  {
    id: "2",
    borrowerAddress: "0x123d35cc6798c532cf53de8a200c04b3e2a6c3ab",
    requestedAmount: 250,
    requestedToken: "USDC",
    collateralAmount: 12000,
    collateralToken: "KALE",
    interestRate: 4.8,
    duration: 45,
    collateralValueBRL: 1800.00,
    status: "active" as const
  },
  {
    id: "3",
    borrowerAddress: "0x456d35cc6798c532cf53de8a200c04b3e2a6c3cd",
    requestedAmount: 50,
    requestedToken: "USDC",
    collateralAmount: 3000,
    collateralToken: "KALE",
    interestRate: 6.0,
    duration: 15,
    collateralValueBRL: 450.00,
    status: "active" as const
  }
];

interface MarketViewProps {
  className?: string;
}

export const MarketView = ({ className }: MarketViewProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "high-yield" | "safe">("all");

  const filteredLoans = mockLoans.filter(loan => {
    const matchesSearch = loan.borrowerAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "high-yield") return matchesSearch && loan.interestRate >= 5.5;
    if (filterType === "safe") return matchesSearch && (loan.collateralValueBRL / loan.requestedAmount) > 1.5;
    
    return matchesSearch;
  });

  const handleFundLoan = (loanId: string) => {
    console.log("Funding loan:", loanId);
    // Here you would integrate with the smart contract
  };

  const handleCreateLoan = (formData: any) => {
    console.log("Creating loan:", formData);
    setShowCreateForm(false);
    // Here you would integrate with the smart contract
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
            <div className="text-xl font-bold text-foreground">$3,000.12</div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
            <div className="text-sm text-muted-foreground">Active Offers</div>
            <div className="text-xl font-bold text-foreground">{mockLoans.length}</div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
            <div className="text-sm text-muted-foreground">Average Rate</div>
            <div className="text-xl font-bold text-kale-green">
              {(mockLoans.reduce((acc, loan) => acc + loan.interestRate, 0) / mockLoans.length).toFixed(1)}%
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