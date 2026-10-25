import React, { useState, useRef, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({ value, onChange, minDate, placeholder = 'Select date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDateObj = value ? new Date(`${value}T00:00:00`) : null;
  
  const [viewDate, setViewDate] = useState(() => {
    return selectedDateObj || new Date();
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  const minDateObj = minDate ? new Date(`${minDate}T00:00:00`) : null;

  // Calendar logic
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Prev month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, dayNum);
    calendarDays.push({ dateObj, dayNum, currentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarDays.push({ dateObj, dayNum: d, currentMonth: true });
  }

  // Next month padding days
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const dateObj = new Date(year, month + 1, i);
    calendarDays.push({ dateObj, dayNum: i, currentMonth: false });
  }

  const formatIso = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSelectDay = (dayItem) => {
    if (isDisabled(dayItem.dateObj)) return;
    const isoStr = formatIso(dayItem.dateObj);
    onChange(isoStr);
    setIsOpen(false);
  };

  const isDisabled = (dateObj) => {
    if (!minDateObj) return false;
    const checkObj = new Date(dateObj);
    checkObj.setHours(0, 0, 0, 0);
    return checkObj < minDateObj;
  };

  const isSelected = (dateObj) => {
    if (!selectedDateObj) return false;
    return (
      dateObj.getFullYear() === selectedDateObj.getFullYear() &&
      dateObj.getMonth() === selectedDateObj.getMonth() &&
      dateObj.getDate() === selectedDateObj.getDate()
    );
  };

  const isToday = (dateObj) => {
    return (
      dateObj.getFullYear() === todayObj.getFullYear() &&
      dateObj.getMonth() === todayObj.getMonth() &&
      dateObj.getDate() === todayObj.getDate()
    );
  };

  const formatDisplay = (dStr) => {
    if (!dStr) return '';
    try {
      const d = new Date(`${dStr}T00:00:00`);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-xs transition outline-none ${
          isOpen
            ? 'border-blue-900 bg-white ring-2 ring-blue-900/10'
            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <svg className="h-4 w-4 shrink-0 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`truncate font-semibold ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        <svg className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl transition-all">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-bold text-slate-900">
              {MONTH_NAMES[month]} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition font-bold text-sm"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition font-bold text-sm"
              >
                ›
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const disabled = isDisabled(item.dateObj);
              const selected = isSelected(item.dateObj);
              const today = isToday(item.dateObj);

              let btnClass = 'text-slate-700 hover:bg-slate-100 font-semibold';
              if (!item.currentMonth) btnClass = 'text-slate-300';
              if (disabled) btnClass = 'text-slate-300 cursor-not-allowed opacity-50';
              if (today && !selected) btnClass += ' ring-1 ring-blue-900 text-blue-900 font-bold';
              if (selected) btnClass = 'bg-blue-900 text-white font-bold shadow-xs hover:bg-blue-800';

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(item)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs transition ${btnClass}`}
                >
                  {item.dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Presets Bar */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px]">
            <button
              type="button"
              onClick={() => {
                const todayStr = formatIso(new Date());
                onChange(todayStr);
                setViewDate(new Date());
                setIsOpen(false);
              }}
              className="font-bold text-blue-900 hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                onChange(formatIso(tomorrow));
                setViewDate(tomorrow);
                setIsOpen(false);
              }}
              className="font-semibold text-slate-600 hover:text-slate-900"
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
