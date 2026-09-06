import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDailyData } from '@/hooks/useDailyData';

export function QuickLogs() {
  const { data, isLoading, addExpense, updateNotes } = useDailyData();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [journal, setJournal] = useState(data?.notes || '');

  useEffect(() => {
    if (data?.notes !== undefined) {
      setJournal(data.notes);
    }
  }, [data?.notes]);

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;

  const handleAddExpense = () => {
    if (!amount || !category) return;
    addExpense({ amount: Number(amount), category, note });
    setAmount('');
    setCategory('');
    setNote('');
  };

  const handleSaveJournal = async () => {
    await updateNotes(journal);
    alert('Journal saved!');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold pt-4 mb-4">Quick Logs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {data?.expenses?.map((exp, i) => (
              <div key={i} className="flex justify-between text-sm p-2 bg-secondary rounded-md">
                <div>
                  <span className="font-semibold">{exp.category}</span>
                  <span className="text-muted-foreground block text-xs">{exp.note}</span>
                </div>
                <span className="font-medium">Rp {exp.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Amount (Rp)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Food" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Note</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <Button onClick={handleAddExpense} className="w-full">Add Expense</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal & Dev Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea 
            className="w-full h-32 p-3 bg-background border border-input rounded-md text-sm"
            placeholder="- Fixed a bug..."
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
          />
          <Button onClick={handleSaveJournal} className="w-full">Save Notes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
