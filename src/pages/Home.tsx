import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useDailyData } from '@/hooks/useDailyData';

export function Home() {
  const today = new Date();
  const { data, isLoading, updateAttendance, updateHabit } = useDailyData(today);
  
  if (isLoading) return <div className="p-4 text-center">Loading...</div>;

  const attendanceStatus = data?.attendance?.check_in 
    ? (data?.attendance?.check_out ? 'Sudah Pulang' : 'Sudah Masuk') 
    : 'Belum Absen';

  return (
    <div className="p-4 space-y-6">
      <header className="mb-8 pt-4">
        <h1 className="text-2xl font-bold">Hello, Master</h1>
        <p className="text-muted-foreground">{format(today, 'EEEE, dd MMMM yyyy')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Work Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              size="lg"
              disabled={!!data?.attendance?.check_in}
              onClick={() => updateAttendance('check_in')}
            >
              Absen Masuk
            </Button>
            <Button 
              className="flex-1" 
              variant="secondary" 
              size="lg"
              disabled={!data?.attendance?.check_in || !!data?.attendance?.check_out}
              onClick={() => updateAttendance('check_out')}
            >
              Absen Pulang
            </Button>
          </div>
          <div className="text-sm text-center text-muted-foreground mt-2">
            Status: <span className="font-semibold text-foreground">{attendanceStatus}</span>
          </div>
          {data?.attendance?.check_in && (
            <div className="text-xs text-center text-muted-foreground">
              In: {data.attendance.check_in} {data?.attendance?.check_out && `| Out: ${data.attendance.check_out}`}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Habits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="creatine" 
              checked={data?.habits?.creatine_taken || false}
              onCheckedChange={(checked) => updateHabit('creatine_taken', checked === true)}
            />
            <label htmlFor="creatine" className="text-sm font-medium leading-none">
              Creatine Taken
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="water" 
              checked={data?.habits?.water_intake_ml === 3000}
              onCheckedChange={(checked) => updateHabit('water_intake_ml', checked ? 3000 : 0)}
            />
            <label htmlFor="water" className="text-sm font-medium leading-none">
              Water Intake (3L)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="grooming" 
              checked={data?.habits?.grooming_done || false}
              onCheckedChange={(checked) => updateHabit('grooming_done', checked === true)}
            />
            <label htmlFor="grooming" className="text-sm font-medium leading-none">
              Grooming Done
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
