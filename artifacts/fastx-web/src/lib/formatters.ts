const IST = 'Asia/Kolkata';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const calculateDuration = (departure: string, arrival: string) => {
  const d = new Date(departure);
  const a = new Date(arrival);
  const diffMs = a.getTime() - d.getTime();
  const totalMinutes = Math.round(Math.abs(diffMs) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

export const getBusTypeDisplay = (type: string) => {
  const types: Record<string, string> = {
    'seater_ac': 'A/C Seater',
    'seater_non_ac': 'Non A/C Seater',
    'sleeper_ac': 'A/C Sleeper',
    'sleeper_non_ac': 'Non A/C Sleeper'
  };
  return types[type] || type;
};
