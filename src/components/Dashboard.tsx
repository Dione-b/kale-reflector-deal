import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for user positions
const mockDebts = [
  {
    id: "debt-1",
    loanAmount: 100,
    tokenSymbol: "USDC",
    collateralAmount: 5000,
    collateralSymbol: "KALE",
    interestRate: 5.5,
    totalOwed: 105.5,
    daysRemaining: 15,
    lenderAddress: "0x742d35cc6798c532cf53de8a200c04b3e2a6c3ef",
    collateralValueBRL: 750.12,
    status: "active" as const
  },
  {
    id: "debt-2", 
    loanAmount: 50,
    tokenSymbol: "USDC",
    collateralAmount: 3000,
    collateralSymbol: "KALE",
    interestRate: 6.0,
    totalOwed: 53.0,
    daysRemaining: 2,
    lenderAddress: "0x123d35cc6798c532cf53de8a200c04b3e2a6c3ab",
    collateralValueBRL: 450.00,
    status: "overdue" as const
  }
];

const mockLoans = [
  {
    id: "loan-1",
    loanAmount: 250,
    tokenSymbol: "USDC",
    collateralAmount: 12000,
    collateralSymbol: "KALE",
    interestRate: 4.8,
    daysRemaining: 30,
    borrowerAddress: "0x456d35cc6798c532cf53de8a200c04b3e2a6c3cd",
    collateralValueBRL: 1800.00,
    status: "active" as const
  }
];

interface DashboardProps {
  className?: string;
}

export const Dashboard = ({ className }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("debts");

  const handlePayLoan = (loanId: string) => {
    console.log("Paying loan:", loanId);
    // Here you would integrate with the smart contract
  };

  const handleLiquidateCollateral = (loanId: string) => {
    console.log("Liquidating collateral for loan:", loanId);
    // Here you would integrate with the smart contract
  };

  const DebtCard = ({ debt }: { debt: typeof mockDebts[0] }) => {
    const isOverdue = debt.status === "overdue" || debt.daysRemaining <= 0;
    const isNearDue = debt.daysRemaining <= 3 && debt.daysRemaining > 0;

    return (
      <Card className={cn(
        "bg-gradient-card border-border/50 transition-all duration-300",
        isOverdue && "border-destructive/50 shadow-destructive/10",
        isNearDue && "border-warning/50"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {debt.loanAmount} {debt.tokenSymbol}
            </CardTitle>
            <Badge 
              variant={isOverdue ? "destructive" : isNearDue ? "default" : "secondary"}
              className={cn(
                !isOverdue && !isNearDue && "bg-success/20 text-success border-success/30"
              )}
            >
              {isOverdue ? "Overdue" : isNearDue ? "Due Soon" : "Active"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Collateral: {debt.collateralAmount} {debt.collateralSymbol}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Reflector Value */}
          <div className="p-3 bg-muted/30 rounded-lg border border-kale-green/20">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-kale-green animate-pulse" />
              <span className="text-sm text-muted-foreground">Collateral Value:</span>
            </div>
            <div className="text-lg font-semibold text-kale-green">
              ${debt.collateralValueBRL.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total to Pay:</span>
              <span className="font-semibold">{debt.totalOwed} {debt.tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Interest Rate:</span>
              <span className="font-semibold">{debt.interestRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Time Remaining:</span>
              <div className="flex items-center space-x-1">
                <Clock className={cn(
                  "w-4 h-4",
                  isOverdue ? "text-destructive" : isNearDue ? "text-warning" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-semibold",
                  isOverdue ? "text-destructive" : isNearDue ? "text-warning" : "text-foreground"
                )}>
                  {isOverdue ? "Overdue" : `${debt.daysRemaining} days`}
                </span>
              </div>
            </div>
          </div>

          <Button 
            variant={isOverdue ? "destructive" : "kale"} 
            className="w-full"
            onClick={() => handlePayLoan(debt.id)}
          >
            {isOverdue ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Pay Urgent
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Pay Loan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const LoanCard = ({ loan }: { loan: typeof mockLoans[0] }) => {
    const canLiquidate = loan.daysRemaining <= 0;

    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {loan.loanAmount} {loan.tokenSymbol}
            </CardTitle>
            <Badge 
              variant={canLiquidate ? "destructive" : "secondary"}
              className={cn(
                !canLiquidate && "bg-success/20 text-success border-success/30"
              )}
            >
              {canLiquidate ? "Liquidatable" : "Active"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Collateral: {loan.collateralAmount} {loan.collateralSymbol}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Reflector Value */}
          <div className="p-3 bg-muted/30 rounded-lg border border-kale-green/20">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-kale-green animate-pulse" />
              <span className="text-sm text-muted-foreground">Collateral Value:</span>
            </div>
            <div className="text-lg font-semibold text-kale-green">
              ${loan.collateralValueBRL.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Interest Rate:</span>
              <span className="font-semibold">{loan.interestRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Time Remaining:</span>
              <div className="flex items-center space-x-1">
                <Clock className={cn(
                  "w-4 h-4",
                  canLiquidate ? "text-destructive" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-semibold",
                  canLiquidate ? "text-destructive" : "text-foreground"
                )}>
                  {canLiquidate ? "Overdue" : `${loan.daysRemaining} days`}
                </span>
              </div>
            </div>
          </div>

          <Button 
            variant={canLiquidate ? "destructive" : "outline"} 
            className="w-full"
            onClick={() => handleLiquidateCollateral(loan.id)}
            disabled={!canLiquidate}
          >
            {canLiquidate ? (
              <>
                <TrendingDown className="w-4 h-4 mr-2" />
                Liquidate Collateral
              </>
            ) : (
              "Awaiting Maturity"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your active loans and credit positions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30">
          <TabsTrigger value="debts" className="data-[state=active]:bg-kale-green/20">
            My Debts ({mockDebts.length})
          </TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-kale-green/20">
            My Loans ({mockLoans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debts" className="space-y-4">
          {mockDebts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockDebts.map((debt) => (
                <DebtCard key={debt.id} debt={debt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                You have no active debts at the moment
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          {mockLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockLoans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                You have no loans granted at the moment
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};