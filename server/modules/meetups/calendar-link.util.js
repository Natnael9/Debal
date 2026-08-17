 function buildCalendarLink({ date, time, locationNote }) {
  const [hourStr = '12', minuteStr = '00'] = (time || '').split(':');
  const hour = hourStr.padStart(2, '0');
  const minute = minuteStr.padStart(2, '0');
  const dateCompact = date.replace(/-/g, '');

  const start = `${dateCompact}T${hour}${minute}00`;


  let endHour = parseInt(hour, 10) + 1;
  let endDateCompact = dateCompact;
  if (endHour >= 24) {

  }
  const end = `${endDateCompact}T${String(endHour).padStart(2, '0')}${minute}00`;

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