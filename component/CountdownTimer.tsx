"use client";

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate?: string | null;
}

function getDiff(targetDate: string): TimeLeft {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const distance = target - now;

  if (Number.isNaN(target) || distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 20,
  });

  useEffect(() => {
    if (targetDate) {
      setTimeLeft(getDiff(targetDate));
    }

    const timer = setInterval(() => {
      if (targetDate) {
        setTimeLeft(getDiff(targetDate));
        return;
      }

      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  const units = [
    { value: timeLeft.days, label: 'يوم' },
    { value: timeLeft.hours, label: 'ساعة' },
    { value: timeLeft.minutes, label: 'دقيقة' },
    { value: timeLeft.seconds, label: 'ثانية' },
  ];

  return (
    <div className="flex gap-3 justify-center md:justify-start">
      {units.map((unit, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="bg-white text-pink-dark font-bold text-xl md:text-2xl w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-lg">
            {formatNum(unit.value)}
          </div>
          <span className="text-white text-xs mt-1 font-tajawal">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
