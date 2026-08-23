import React, { useState, useRef, useEffect } from 'react';

const POPULAR_SLOTS = [
  { label: '09:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:30 AM', value: '11:30' },
  { label: '01:00 PM', value: '13:00' },
  { label: '02:30 PM', value: '14:30' },
  { label: '04:00 PM', value: '16:00' },
  { label: '06:00 PM', value: '18:00' },
  { label: '07:30 PM', value: '19:30' },
];

export default function CustomTimePicker({ value, onChange, placeholder = 'Select time' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const containerRef = useRef(null);

  // Sync internal custom states when value changes
  useEffect(() => {
    if (value && value.includes(':')) {
      const [hStr, mStr] = value.split(':');
      let hours = parseInt(hStr, 10);
      if (!isNaN(hours)) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        setSelectedHour(String(h12).padStart(2, '0'));
        setSelectedMinute(mStr || '00');
        setSelectedPeriod(period);
      }
    }
  }, [value]);

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

  const formatDisplayTime = (tStr) => {
    if (!tStr) return '';
    const [h, m] = tStr.split(':');
    const hours = parseInt(h, 10);
    if (isNaN(hours)) return tStr;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${m} ${suffix}`;
  };

  const applyCustomTime = (h12Str, minStr, periodStr) => {
    let hours = parseInt(h12Str, 10);
    if (periodStr === 'PM' && hours < 12) hours += 12;
    if (periodStr === 'AM' && hours === 12) hours = 0;
    const h24 = String(hours).padStart(2, '0');
    onChange(`${h24}:${minStr}`);
  };

  const handleHourClick = (h) => {
    setSelectedHour(h);
    applyCustomTime(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteClick = (m) => {
    setSelectedMinute(m);
    applyCustomTime(selectedHour, m, selectedPeriod);
  };

  const handlePeriodClick = (p) => {
    setSelectedPeriod(p);
    applyCustomTime(selectedHour, selectedMinute, p);
  };

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '15', '30', '45'];

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`truncate font-semibold ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {value ? formatDisplayTime(value) : placeholder}
          </span>
        </div>

        <svg className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl transition-all">
          <h4 className="text-xs font-bold text-slate-900 mb-2.5">
            Select Meetup Time
          </h4>

          {/* Custom Time Selector Columns */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-2 text-center">
            {/* Hours Column */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hour</p>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourClick(h)}
                    className={`w-full rounded-lg py-1 text-xs font-semibold transition ${
                      selectedHour === h ? 'bg-blue-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Minute</p>
              <div className="space-y-1">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteClick(m)}
                    className={`w-full rounded-lg py-1 text-xs font-semibold transition ${
                      selectedMinute === m ? 'bg-blue-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM Toggle */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Period</p>
              <div className="space-y-1">
                {['AM', 'PM'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePeriodClick(p)}
                    className={`w-full rounded-lg py-1.5 text-xs font-bold transition ${
                      selectedPeriod === p ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Popular Slots */}
          <div className="mt-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Suggested Slots</p>
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              {POPULAR_SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => {
                    onChange(slot.value);
                    setIsOpen(false);
                  }}
                  className={`rounded-lg border px-1.5 py-1 text-center font-semibold transition ${
                    value === slot.value
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {slot.label.split(' ')[0]}
                  <span className="block text-[8px] opacity-70">{slot.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 text-right border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl bg-blue-900 px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
