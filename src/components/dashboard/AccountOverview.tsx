import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AccountOverview = () => {
  return (
    <Card className="bg-black/40 border-white/5">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Account Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Balance</span>
            <span className="font-semibold">$10,000.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Available Margin</span>
            <span className="font-semibold">$5,000.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Used Margin</span>
            <span className="font-semibold">$2,500.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};