export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const calculateDuration = (departure: string, arrival: string) => {
  const d = new Date(departure);
  const a = new Date(arrival);
  let diffMs = a.getTime() - d.getTime();
  
  if (diffMs < 0) {
    // assume arrival is next day
    diffMs += 24 * 60 * 60 * 1000;
  }
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
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