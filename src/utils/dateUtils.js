/**
 * Date utilities for TaskCoin Pro 7-Day Date-Wise Task Scheduling
 * Automatically handles local time zones and 00:00 midnight transitions.
 */

export function getLocalDateString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateInput) {
  if (!dateInput) return '';
  try {
    let d;
    if (dateInput instanceof Date) {
      d = dateInput;
    } else if (typeof dateInput === 'string' && dateInput.includes('-')) {
      const parts = dateInput.split('T')[0].split('-').map(Number);
      if (parts.length === 3) {
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = new Date(dateInput);
    }
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return String(dateInput || '');
  }
}

export function formatFullReadableDate(dateInput) {
  if (!dateInput) return '';
  try {
    let d;
    if (dateInput instanceof Date) {
      d = dateInput;
    } else if (typeof dateInput === 'string' && dateInput.includes('-')) {
      const parts = dateInput.split('T')[0].split('-').map(Number);
      if (parts.length === 3) {
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = new Date(dateInput);
    }
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateInput || '');
  }
}

/**
 * Returns an array of the upcoming 7 days starting from today (offset 0 to 6).
 */
export function getUpcoming7Days() {
  const days = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayName = dayNames[d.getDay()];
    const monthName = monthNames[d.getMonth()];
    const dayNum = d.getDate();

    let tag = `+${offset} Days`;
    if (offset === 0) tag = 'Today';
    else if (offset === 1) tag = 'Tomorrow';

    days.push({
      dateStr,
      offset,
      isToday: offset === 0,
      isTomorrow: offset === 1,
      dayName,
      monthName,
      dayNum,
      shortLabel: `${dayNum} ${monthName}`,
      tag,
      fullLabel: `${tag} (${dayName}, ${dayNum} ${monthName})`
    });
  }
  return days;
}

/**
 * Calculates remaining time until midnight 00:00:00 in HH:MM:SS
 */
export function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next 00:00:00
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
    formatted: `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
  };
}
