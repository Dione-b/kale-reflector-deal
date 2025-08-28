import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { readFromLocalStorage, writeToLocalStorage, STORAGE_KEYS } from "@/lib/storage";

type Debt = {
  id: string;
  loanAmount: number;
  tokenSymbol: string;
  collateralAmount: number;
  collateralSymbol: string;
  interestRate: number;
  totalOwed: number;
  daysRemaining: number;
  lenderAddress: string;
  collateralValueBRL: number;
  status: "active" | "overdue" | "completed";
};

type MyLoan = {
  id: string;
  loanAmount: number;
  tokenSymbol: string;
  collateralAmount: number;
  collateralSymbol: string;
  interestRate: number;
  daysRemaining: number;
  borrowerAddress: string;
  collateralValueBRL: number;
  status: "active" | "completed";
  totalOwed?: number;
};

interface DashboardProps {
  className?: string;
}

export const Dashboard = ({ className }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("debts");
  const [debts, setDebts] = useState<Debt[]>(() => readFromLocalStorage<Debt[]>(STORAGE_KEYS.myDebts, []));
  const [loans, setLoans] = useState<MyLoan[]>(() => readFromLocalStorage<MyLoan[]>(STORAGE_KEYS.myLoans, []));

  // Agregações para os cards de resumo
  const totalDebtsCount = debts.length;
  const totalToPay = debts.reduce((sum, d) => sum + (d.totalOwed || 0), 0);
  const overdueCount = debts.reduce((count, d) => count + ((d.status === "overdue" || d.daysRemaining <= 0) ? 1 : 0), 0);
  const totalCollateralValueBRL = [...debts, ...loans].reduce((sum, item) => sum + (item.collateralValueBRL || 0), 0);

  useEffect(() => {
    writeToLocalStorage(STORAGE_KEYS.myDebts, debts);
  }, [debts]);

  useEffect(() => {
    writeToLocalStorage(STORAGE_KEYS.myLoans, loans);
  }, [loans]);

  const handlePayLoan = (loanId: string) => {
    const paidDebt = debts.find(d => d.id === loanId);
    // Remove da lista de dívidas
    setDebts(prev => prev.filter(d => d.id !== loanId));

    // Mover para "Meus Empréstimos" como concluído
    if (paidDebt) {
      const borrowerAddress = readFromLocalStorage<string | undefined>(STORAGE_KEYS.walletAddress, undefined) || "0x000000000000000000000000000000000000dEaD";
      const completedLoan: MyLoan = {
        id: `completed-${paidDebt.id}`,
        loanAmount: paidDebt.loanAmount,
        tokenSymbol: paidDebt.tokenSymbol,
        collateralAmount: paidDebt.collateralAmount,
        collateralSymbol: paidDebt.collateralSymbol,
        interestRate: paidDebt.interestRate,
        daysRemaining: 0,
        borrowerAddress,
        collateralValueBRL: paidDebt.collateralValueBRL,
        status: "completed",
        totalOwed: paidDebt.totalOwed,
      };
      setLoans(prev => [completedLoan, ...prev]);
    }

    // Ir para a aba de empréstimos
    setActiveTab("loans");
  };

  const handleLiquidateCollateral = (loanId: string) => {
    setLoans(prev => prev.filter(l => l.id !== loanId));
  };

  const DebtCard = ({ debt }: { debt: Debt }) => {
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
            Colateral: {debt.collateralAmount} {debt.collateralSymbol}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Reflector Value */}
          <div className="p-3 bg-muted/30 rounded-lg border border-kale-green/20">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-kale-green animate-pulse" />
              <span className="text-sm text-muted-foreground">Valor do Colateral:</span>
            </div>
            <div className="text-lg font-semibold text-kale-green">
              R${debt.collateralValueBRL.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total a Pagar:</span>
              <span className="font-semibold">{debt.totalOwed} {debt.tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Taxa de Juros:</span>
              <span className="font-semibold">{debt.interestRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tempo Restante:</span>
              <div className="flex items-center space-x-1">
                <Clock className={cn(
                  "w-4 h-4",
                  isOverdue ? "text-destructive" : isNearDue ? "text-warning" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-semibold",
                  isOverdue ? "text-destructive" : isNearDue ? "text-warning" : "text-foreground"
                )}>
                  {isOverdue ? "Vencido" : `${debt.daysRemaining} dias`}
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
                Pagar Urgente
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Pagar Empréstimo
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const LoanCard = ({ loan }: { loan: MyLoan }) => {
    const isCompleted = loan.status === "completed";
    const canLiquidate = !isCompleted && loan.daysRemaining <= 0;

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
                (isCompleted || !canLiquidate) && "bg-success/20 text-success border-success/30"
              )}
            >
              {isCompleted ? "Concluído" : canLiquidate ? "Liquidável" : "Ativo"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Colateral: {loan.collateralAmount} {loan.collateralSymbol}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Reflector Value */}
          <div className="p-3 bg-muted/30 rounded-lg border border-kale-green/20">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-kale-green animate-pulse" />
              <span className="text-sm text-muted-foreground">Valor do Colateral:</span>
            </div>
            <div className="text-lg font-semibold text-kale-green">
              R${loan.collateralValueBRL.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Taxa de Juros:</span>
              <span className="font-semibold">{loan.interestRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tempo Restante:</span>
              <div className="flex items-center space-x-1">
                <Clock className={cn(
                  "w-4 h-4",
                  isCompleted ? "text-success" : canLiquidate ? "text-destructive" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-semibold",
                  isCompleted ? "text-success" : canLiquidate ? "text-destructive" : "text-foreground"
                )}>
                  {isCompleted ? "Concluído" : canLiquidate ? "Vencido" : `${loan.daysRemaining} dias`}
                </span>
              </div>
            </div>
          </div>

          <Button 
            variant={isCompleted ? "outline" : canLiquidate ? "destructive" : "outline"} 
            className="w-full"
            onClick={() => !isCompleted && handleLiquidateCollateral(loan.id)}
            disabled={isCompleted || !canLiquidate}
          >
            {isCompleted ? (
              "Concluído"
            ) : canLiquidate ? (
              <>
                <TrendingDown className="w-4 h-4 mr-2" />
                Liquidar Colateral
              </>
            ) : (
              "Aguardando Vencimento"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Painel</h1>
        <p className="text-muted-foreground">
          Gerencie seus empréstimos ativos e posições de crédito
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-card bg-gradient-card border border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Minhas Dívidas</CardTitle>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDebtsCount}</div>
            <p className="text-sm text-muted-foreground">Posições de dívida ativas</p>
          </CardContent>
        </Card>

        <Card className="bg-card bg-gradient-card border border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Total a Pagar</CardTitle>
              <CheckCircle className="w-4 h-4 text-kale-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Em todas as dívidas ({debts[0]?.tokenSymbol || 'tokens'})</p>
          </CardContent>
        </Card>

        <Card className="bg-card bg-gradient-card border border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Em Atraso</CardTitle>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overdueCount}</div>
            <p className="text-sm text-muted-foreground">Dívidas que exigem atenção</p>
          </CardContent>
        </Card>

        <Card className="bg-card bg-gradient-card border border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Valor do Colateral</CardTitle>
              <TrendingUp className="w-4 h-4 text-kale-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R${totalCollateralValueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Soma dos colaterais ativos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30">
          <TabsTrigger value="debts" className="data-[state=active]:bg-kale-green/20">
            Minhas Dívidas ({debts.length})
          </TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-kale-green/20">
            Meus Empréstimos ({loans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debts" className="space-y-4">
          {debts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {debts.map((debt) => (
                <DebtCard key={debt.id} debt={debt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                Você não tem dívidas ativas no momento
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          {loans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                Você não tem empréstimos concedidos no momento
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};