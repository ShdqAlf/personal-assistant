import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useStatsData, type GymSessionRecord } from '@/hooks/useStatsData';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { 
  Dumbbell, 
  Trophy, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Receipt, 
  Activity, 
  Calendar as CalendarIcon,
  Layers,
  ArrowRight
} from 'lucide-react';

export function Stats() {
  const { 
    data, 
    isLoading, 
    selectedMonth, 
    timeframe, 
    setTimeframe, 
    prevMonth, 
    nextMonth,
    resetToCurrentMonth 
  } = useStatsData();

  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [gymSearchQuery, setGymSearchQuery] = useState('');

  const toggleSession = (dateStr: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Memuat statistik & riwayat...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Tidak ada data statistik yang tersedia.
      </div>
    );
  }

  // Filter gym sessions based on search query
  const filteredGymSessions = (data.gymSessions || []).filter((session) => {
    if (!gymSearchQuery.trim()) return true;
    const query = gymSearchQuery.toLowerCase();
    const matchesRoutine = session.routine.toLowerCase().includes(query);
    const matchesExercise = session.exercises.some(ex => ex.name.toLowerCase().includes(query));
    return matchesRoutine || matchesExercise;
  });

  const formattedMonth = format(selectedMonth, 'MMMM yyyy', { locale: id });

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Header & Date Navigation */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Statistik & Riwayat</h1>
            <p className="text-xs text-muted-foreground">
              {timeframe === 'month' ? `Periode: ${formattedMonth}` : 'Semua Waktu (All Time)'}
            </p>
          </div>

          <div className="flex bg-secondary rounded-lg p-1 text-xs">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeframe === 'month' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeframe === 'all' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Month Selector Controls */}
        {timeframe === 'month' && (
          <div className="flex items-center justify-between bg-card border border-border/60 rounded-xl px-3 py-2 shadow-xs">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button 
              onClick={resetToCurrentMonth}
              className="text-sm font-semibold capitalize hover:underline"
              title="Kembali ke bulan ini"
            >
              {formattedMonth}
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="gym" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/80">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="gym" className="text-xs flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5" />
            Gym
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" />
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Card className="col-span-2 bg-primary/5 border-primary/20">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span>Total Pengeluaran</span>
                  <Receipt className="w-4 h-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold">Rp {data.totalExpenses.toLocaleString()}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {data.expensesHistory.length} transaksi tercatat
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span>Sesi Gym</span>
                  <Dumbbell className="w-4 h-4 text-amber-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold">{data.gymDays}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Hari latihan</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span>Absen Kerja</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold">{data.checkInDays}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Hari masuk</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Kalender Aktivitas
              </CardTitle>
              <CardDescription className="text-xs">
                Tanggal dengan aktivitas aktif (Gym, Absen, Pengeluaran, atau Catatan)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-2">
              <Calendar
                mode="multiple"
                selected={data.activeDates}
                className="rounded-md border shadow-xs"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GYM STATS & HISTORY */}
        <TabsContent value="gym" className="space-y-4 pt-2">
          {/* Gym KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
              <CardHeader className="pb-1 pt-3 px-3.5">
                <CardTitle className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>Total Sesi</span>
                  <Dumbbell className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 px-3.5">
                <div className="text-2xl font-bold">{data.gymStats.totalWorkouts}</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {data.gymStats.totalSets} sets • {data.gymStats.totalReps} reps
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20">
              <CardHeader className="pb-1 pt-3 px-3.5">
                <CardTitle className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center justify-between">
                  <span>Total Volume</span>
                  <Flame className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 px-3.5">
                <div className="text-2xl font-bold">
                  {data.gymStats.totalVolume.toLocaleString()} <span className="text-xs font-normal">kg</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Beban terangkat</p>
              </CardContent>
            </Card>

            <Card className="col-span-2 border-border/60">
              <CardContent className="py-3 px-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">Rutinitas Terfavorit</span>
                  <span className="text-sm font-semibold">{data.gymStats.topRoutine}</span>
                </div>
                {data.gymStats.routinesBreakdown.length > 0 && (
                  <span className="text-xs bg-secondary px-2.5 py-1 rounded-full font-medium">
                    {data.gymStats.routinesBreakdown[0].count}x dilakukan
                  </span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Personal Records (PRs) */}
          <Card className="border-border/60">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Personal Records (PR)
                </CardTitle>
                <span className="text-[11px] text-muted-foreground">
                  {data.gymStats.exercisePRs.length} gerakan
                </span>
              </div>
              <CardDescription className="text-xs">
                Beban angkatan tertinggi yang pernah tercatat per latihan
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-1">
              {data.gymStats.exercisePRs.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Belum ada catatan set & beban latihan di periode ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {data.gymStats.exercisePRs.map((pr, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/40 text-xs"
                    >
                      <div className="space-y-0.5 flex-1 pr-2">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {idx === 0 && <span className="text-amber-500 font-bold">★</span>}
                          <span>{pr.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Total {pr.totalSets} set • {pr.totalVolume.toLocaleString()} kg vol • {pr.lastDate}
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                          {pr.maxWeight} kg
                        </span>
                        {pr.maxRepsAtMaxWeight > 0 && (
                          <span className="text-[10px] text-muted-foreground block">
                            × {pr.maxRepsAtMaxWeight} reps
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout History Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Riwayat Sesi Latihan
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredGymSessions.length} sesi
              </span>
            </div>

            {/* Search filter for history */}
            {data.gymSessions.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari rutinitas atau nama latihan..."
                  value={gymSearchQuery}
                  onChange={(e) => setGymSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 bg-card border-border/60"
                />
              </div>
            )}

            {filteredGymSessions.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="text-center py-8 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tidak ada riwayat sesi gym</p>
                    <p className="text-xs text-muted-foreground">
                      {gymSearchQuery ? 'Tidak ada hasil yang sesuai dengan kata kunci pencarian.' : 'Belum ada latihan yang dicatat pada periode ini.'}
                    </p>
                  </div>
                  <Link to="/gym">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <span>Mulai Catat Latihan</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filteredGymSessions.map((session: GymSessionRecord) => {
                  const isExpanded = !!expandedSessions[session.date];
                  const formattedDate = format(new Date(session.date + 'T00:00:00'), 'EEEE, dd MMM yyyy', { locale: id });

                  return (
                    <Card key={session.date} className="border-border/60 overflow-hidden transition-all shadow-xs">
                      {/* Session Header Card */}
                      <button
                        type="button"
                        onClick={() => toggleSession(session.date)}
                        className="w-full text-left p-3.5 flex items-center justify-between hover:bg-secondary/40 transition-colors"
                      >
                        <div className="space-y-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {session.routine}
                            </span>
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded font-medium">
                              {session.exercises.length} gerakan
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold block text-foreground">
                              {session.totalVolume.toLocaleString()} kg
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {session.totalSets} set • max {session.maxWeight} kg
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>

                      {/* Session Expanded Details */}
                      {isExpanded && (
                        <div className="p-3.5 pt-0 border-t border-border/40 bg-secondary/20 space-y-3">
                          {session.exercises.length === 0 ? (
                            <p className="text-xs text-muted-foreground pt-2">Tidak ada rincian latihan yang disimpan.</p>
                          ) : (
                            <div className="space-y-2.5 pt-2">
                              {session.exercises.map((ex, exIdx) => (
                                <div key={exIdx} className="bg-background rounded-lg p-2.5 border border-border/40 space-y-1.5">
                                  <div className="flex justify-between items-center text-xs font-semibold">
                                    <span className="text-foreground">{ex.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">
                                      Vol: {ex.exerciseVolume.toLocaleString()} kg • Max: {ex.maxWeight} kg
                                    </span>
                                  </div>

                                  {/* Sets list */}
                                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                                    {ex.sets.map((set, setIdx) => (
                                      <div 
                                        key={setIdx} 
                                        className="flex justify-between items-center text-[11px] px-2 py-1 rounded bg-secondary/60 text-secondary-foreground"
                                      >
                                        <span className="text-muted-foreground">Set {setIdx + 1}</span>
                                        <span className="font-semibold">{set.weight_kg} kg × {set.reps}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: EXPENSES */}
        <TabsContent value="expenses" className="space-y-4 pt-2">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold">Riwayat Pengeluaran</CardTitle>
                <span className="text-xs font-bold text-primary">
                  Rp {data.totalExpenses.toLocaleString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.expensesHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Tidak ada catatan pengeluaran pada periode ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.expensesHistory.map((exp, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-secondary/60 rounded-lg border border-border/30">
                      <div>
                        <span className="font-semibold block text-foreground">{exp.category}</span>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span>{exp.date}</span>
                          {exp.note && <span>• {exp.note}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block text-sm">
                          Rp {(exp.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

