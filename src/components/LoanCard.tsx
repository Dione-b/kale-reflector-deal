import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoanOffer {
  id: string;
  borrowerAddress: string;
  requestedAmount: number;
  requestedToken: string;
  collateralAmount: number;
  collateralToken: string;
  interestRate: number;
  duration: number; // in days
  collateralValueBRL: number;
  status: "active" | "funded" | "completed";
}

interface LoanCardProps {
  loan: LoanOffer;
  onFund?: (loanId: string) => void;
  className?: string;
}

export const LoanCard = ({ loan, onFund, className }: LoanCardProps) => {
  const isCollateralized = (loan.collateralValueBRL / loan.requestedAmount) > 1.2;
  
  return (
    <Card className={cn(
      "group relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-kale/10",
      className
    )}>
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-border opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <Badge 
            variant={isCollateralized ? "default" : "destructive"} 
            className="bg-success/20 text-success border-success/30"
          >
            {isCollateralized ? "Well Secured" : "High Risk"}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            {loan.duration} days
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {loan.requestedAmount} <span className="text-base text-muted-foreground">{loan.requestedToken}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Collateral: {loan.collateralAmount} {loan.collateralToken}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Reflector Value Display */}
        <div className="p-3 bg-muted/30 rounded-lg border border-kale-green/20">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-kale-green animate-pulse" />
            <span className="text-sm text-muted-foreground">Current Collateral Value:</span>
          </div>
          <div className="text-lg font-semibold text-kale-green">
            R$ {loan.collateralValueBRL.toLocaleString('pt-BR', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
        </div>

        {/* Loan Terms */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Interest Rate:</span>
            <span className="font-semibold text-foreground">{loan.interestRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total to Receive:</span>
            <span className="font-semibold text-foreground">
              {(loan.requestedAmount * (1 + loan.interestRate / 100)).toFixed(2)} {loan.requestedToken}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Collateral Ratio:</span>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-foreground">
                {((loan.collateralValueBRL / loan.requestedAmount) * 100).toFixed(0)}%
              </span>
              {isCollateralized && <Shield className="w-4 h-4 text-success" />}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button 
          variant="kale" 
          className="w-full group"
          onClick={() => onFund?.(loan.id)}
        >
          <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
          Fund Offer
        </Button>
      </CardFooter>
    </Card>
  );
};