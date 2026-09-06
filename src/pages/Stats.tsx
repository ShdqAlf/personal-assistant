import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStatsData } from '@/hooks/useStatsData';
import { Calendar } from '@/components/ui/calendar';

export function Stats() {
  const { data, isLoading } = useStatsData();

  if (isLoading) {
    return <div className="p-4 text-center">Loading stats...</div>;
  }

  if (!data) {
    return <div className="p-4 text-center">No data available.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold pt-4 mb-4">Monthly Overview</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {data.totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gym Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.gymDays}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Work Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.checkInDays}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="multiple"
            selected={data.activeDates}
            className="rounded-md border shadow-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.expensesHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses this month.</p>
          ) : (
            <div className="space-y-2">
              {data.expensesHistory.map((exp, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-secondary rounded-md">
                  <div>
                    <span className="font-semibold block">{exp.category}</span>
                    <span className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium block">Rp {(exp.amount || 0).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{exp.note}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
