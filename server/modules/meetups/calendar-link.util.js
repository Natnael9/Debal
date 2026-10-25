export function buildCalendarLink({ date, time, locationNote }) {
  const [hourStr = '12', minuteStr = '00'] = (time || '').split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr.padStart(2, '0');
  const dateCompact = date.replace(/-/g, '');

  const startHourStr = String(hour).padStart(2, '0');
  const start = `${dateCompact}T${startHourStr}${minute}00`;

  let endHour = hour + 1;
  let endDateCompact = dateCompact;
  if (endHour >= 24) {
    endHour = endHour - 24;
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    endDateCompact = d.toISOString().slice(0, 10).replace(/-/g, '');
  }
  const endHourStr = String(endHour).padStart(2, '0');
  const end = `${endDateCompact}T${endHourStr}${minute}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Debal Roommate Meetup',
    dates: `${start}/${end}`,
    details: locationNote ? `Meeting location: ${locationNote}` : 'Debal roommate meetup',
    location: locationNote || '',
    ctz: 'Africa/Addis_Ababa',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}