import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { readFromLocalStorage, writeToLocalStorage, STORAGE_KEYS } from "@/lib/storage";

interface LoanFormData {
  collateralAmount: string;
  requestedAmount: string;
  interestRate: string;
  duration: string;
}

interface CreateLoanFormProps {
  onCreateLoan?: (data: LoanFormData) => void;
  className?: string;
}

export const CreateLoanForm = ({ onCreateLoan, className }: CreateLoanFormProps) => {
  const [formData, setFormData] = useState<LoanFormData>({
    collateralAmount: "",
    requestedAmount: "",
    interestRate: "",
    duration: ""
  });

  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock KALE price for Reflector calculation
  const kalePrice = 0.15; // R$ 0.15 per KALE

  const collateralValueBRL = parseFloat(formData.collateralAmount) * kalePrice || 0;
  const requestedUSDC = parseFloat(formData.requestedAmount) || 0;
  const totalToPayback = requestedUSDC * (1 + (parseFloat(formData.interestRate) || 0) / 100);
  const collateralizationRatio = requestedUSDC > 0 ? (collateralValueBRL / requestedUSDC) * 100 : 0;

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApprove = async () => {
    setIsLoading(true);
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsApproved(true);
    setIsLoading(false);
  };

  const handleCreateOffer = async () => {
    setIsLoading(true);
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const kalePriceBRL = 0.15;
      const offers = readFromLocalStorage<any[]>(STORAGE_KEYS.offers, []);
      const newOffer = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        borrowerAddress: readFromLocalStorage<string | undefined>(STORAGE_KEYS.walletAddress, undefined) || "0x000000000000000000000000000000000000dEaD",
        requestedAmount: parseFloat(formData.requestedAmount) || 0,
        requestedToken: "USDC",
        collateralAmount: parseFloat(formData.collateralAmount) || 0,
        collateralToken: "KALE",
        interestRate: parseFloat(formData.interestRate) || 0,
        duration: parseInt(formData.duration, 10) || 0,
        collateralValueBRL: (parseFloat(formData.collateralAmount) || 0) * kalePriceBRL,
        status: "active" as const,
      };
      writeToLocalStorage(STORAGE_KEYS.offers, [newOffer, ...offers]);

      // Also create a debt entry for the borrower so it appears on Dashboard
      const myDebts = readFromLocalStorage<any[]>(STORAGE_KEYS.myDebts, []);
      const totalOwed = newOffer.requestedAmount * (1 + newOffer.interestRate / 100);
      const pendingDebt = {
        id: `debt-${newOffer.id}`,
        loanAmount: newOffer.requestedAmount,
        tokenSymbol: newOffer.requestedToken,
        collateralAmount: newOffer.collateralAmount,
        collateralSymbol: newOffer.collateralToken,
        interestRate: newOffer.interestRate,
        totalOwed,
        daysRemaining: newOffer.duration,
        lenderAddress: "0x0000000000000000000000000000000000000000",
        collateralValueBRL: newOffer.collateralValueBRL,
        status: "active" as const,
      };
      writeToLocalStorage(STORAGE_KEYS.myDebts, [pendingDebt, ...myDebts]);
    } catch (_e) {
      // ignore
    }
    onCreateLoan?.(formData);
    setIsLoading(false);
  };

  const isFormValid = Object.values(formData).every(value => value !== "") && collateralizationRatio >= 120;

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* Form Section */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Create New Loan Offer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collateral" className="text-sm font-medium">
                KALE Collateral
              </Label>
              <Input
                id="collateral"
                type="number"
                placeholder="Ex: 5000"
                value={formData.collateralAmount}
                onChange={(e) => handleInputChange("collateralAmount", e.target.value)}
                className="bg-background/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requested" className="text-sm font-medium">
                Requested Amount (USDC)
              </Label>
              <Input
                id="requested"
                type="number"
                placeholder="Ex: 100"
                value={formData.requestedAmount}
                onChange={(e) => handleInputChange("requestedAmount", e.target.value)}
                className="bg-background/50 border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest" className="text-sm font-medium">
                  Interest Rate (%)
                </Label>
                <Input
                  id="interest"
                  type="number"
                  placeholder="Ex: 5"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange("interestRate", e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration (days)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Ex: 30"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>
            </div>
          </div>

          {/* Transaction Buttons */}
          <div className="space-y-3">
            <Button
              variant={isApproved ? "success" : "outline"}
              className="w-full"
              onClick={handleApprove}
              disabled={!isFormValid || isApproved || isLoading}
            >
              {isApproved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  KALE Approved
                </>
              ) : isLoading ? (
                "Approving..."
              ) : (
                "Approve KALE Spending"
              )}
            </Button>

            <Button
              variant="kale"
              className="w-full"
              onClick={handleCreateOffer}
              disabled={!isApproved || isLoading}
            >
              {isLoading ? "Creating Offer..." : "Create Loan Offer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Offer Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reflector Display */}
          <div className="p-4 bg-muted/30 rounded-lg border border-kale-green/20">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-kale-green animate-pulse" />
              <span className="text-sm text-muted-foreground">Current Collateral Value:</span>
            </div>
            <div className="text-2xl font-bold text-kale-green">
              ${collateralValueBRL.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
          </div>

          {/* Summary Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Total Amount to Pay:</span>
              <span className="font-semibold text-foreground">
                {totalToPayback.toFixed(2)} USDC
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Collateral Ratio:</span>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={collateralizationRatio >= 120 ? "default" : "destructive"}
                  className={cn(
                    collateralizationRatio >= 120 
                      ? "bg-success/20 text-success border-success/30" 
                      : "bg-destructive/20 text-destructive border-destructive/30"
                  )}
                >
                  {collateralizationRatio.toFixed(0)}%
                </Badge>
              </div>
            </div>

            {collateralizationRatio < 120 && collateralizationRatio > 0 && (
              <div className="flex items-start space-x-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-xs text-warning">
                  Insufficient collateral. At least 120% collateral is recommended to attract lenders.
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 p-3 bg-background/30 rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Duration: {formData.duration || "0"} days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};