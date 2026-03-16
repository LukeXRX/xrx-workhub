"use client";

import { useState } from "react";

interface MiniCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  eventDates?: string[]; // "YYYY-MM-DD" 배열
}

export default function MiniCalendar({
  selectedDate,
  onDateSelect,
  eventDates = [],
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; current: boolean; date: Date }[] = [];

  // 이전 달
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    days.push({ day: d, current: false, date: new Date(year, month - 1, d) });
  }
  // 현재 달
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, current: true, date: new Date(year, month, d) });
  }
  // 다음 달
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, current: false, date: new Date(year, month + 1, d) });
  }

  const isToday = (date: Date) =>
    date.toDateString() === today.toDateString();

  const hasEvent = (date: Date) =>
    eventDates.includes(date.toISOString().split("T")[0]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const dayHeaders = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="mx-3.5 my-3.5 border border-bd p-3.5 bg-card">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2.5">
        <button onClick={prevMonth} className="text-tx-3 hover:text-accent transition-colors text-sm">◂</button>
        <span className="text-sm font-medium text-tx">{year}년 {monthNames[month]}</span>
        <button onClick={nextMonth} className="text-tx-3 hover:text-accent transition-colors text-sm">▸</button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayHeaders.map((d) => (
          <div key={d} className="text-[11px] font-medium uppercase tracking-wider text-tx-3 py-1">{d}</div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {days.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onDateSelect?.(item.date)}
            className={`
              text-[13px] py-1.5 cursor-pointer transition-all relative
              ${!item.current ? "text-tx-4" : ""}
              ${isToday(item.date) ? "bg-accent text-black font-semibold" : "hover:bg-accent-soft"}
            `}
          >
            {item.day}
            {hasEvent(item.date) && !isToday(item.date) && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
