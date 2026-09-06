import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDailyData } from '@/hooks/useDailyData';

export function GymLog() {
  const { data, isLoading, updateGymSession } = useDailyData();
  const [routine, setRoutine] = useState(data?.gym_session?.routine || '');
  const [exercises, setExercises] = useState<any[]>(data?.gym_session?.exercises || []);
  
  const [newExercise, setNewExercise] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('');

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;

  const handleAddExercise = () => {
    if (!newExercise) return;
    const updated = [...exercises, { name: newExercise, sets: [] }];
    setExercises(updated);
    setNewExercise('');
    updateGymSession({ routine, exercises: updated });
  };

  const handleAddSet = (exerciseIndex: number) => {
    if (!newWeight || !newReps) return;
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ weight_kg: Number(newWeight), reps: Number(newReps) });
    setExercises(updated);
    updateGymSession({ routine, exercises: updated });
    setNewWeight('');
    setNewReps('');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold pt-4 mb-4">Gym Log</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            value={routine} 
            onChange={(e) => {
              setRoutine(e.target.value);
              updateGymSession({ routine: e.target.value, exercises });
            }}
            placeholder="e.g. Push Day A"
          />
        </CardContent>
      </Card>

      {exercises.map((ex, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-lg">{ex.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {ex.sets.map((set: any, j: number) => (
                <div key={j} className="flex justify-between items-center text-sm p-2 bg-secondary rounded-md">
                  <span>Set {j + 1}</span>
                  <span className="font-medium">{set.weight_kg} kg x {set.reps} reps</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Weight (kg)</Label>
                <Input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Reps</Label>
                <Input type="number" value={newReps} onChange={e => setNewReps(e.target.value)} />
              </div>
              <Button onClick={() => handleAddSet(i)} size="sm">Add</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Add Exercise</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input 
            value={newExercise} 
            onChange={(e) => setNewExercise(e.target.value)} 
            placeholder="e.g. Bench Press" 
          />
          <Button onClick={handleAddExercise}>Add</Button>
        </CardContent>
      </Card>
    </div>
  );
}
