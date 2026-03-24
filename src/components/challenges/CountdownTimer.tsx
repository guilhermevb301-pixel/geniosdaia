import { useState, useEffect } from "react";

function formatCountdown(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export function CountdownTimer({ endDate }: { endDate: string }) {
  const [time, setTime] = useState(formatCountdown(endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatCountdown(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex gap-2 sm:gap-3">
      {[
        { value: time.days, label: "DIAS" },
        { value: time.hours, label: "HORAS" },
        { value: time.minutes, label: "MIN" },
        { value: time.seconds, label: "SEG" },
      ].map(({ value, label }, idx) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="text-center">
            <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{value.toString().padStart(2, '0')}</div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
          </div>
          {idx < 3 && <span className="text-2xl text-muted-foreground font-light self-start mt-2">:</span>}
        </div>
      ))}
    </div>
  );
}
