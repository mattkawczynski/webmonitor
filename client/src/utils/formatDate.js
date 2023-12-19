import moment from 'moment';

export function formatDate(date) {
    const diffDuration = moment.duration(moment().diff(moment(date)));
    const months = diffDuration.months();
    const days = diffDuration.days();
    const hours = diffDuration.hours();
    const minutes = diffDuration.minutes();
    
    const monthString = months === 1 ? '1 month' : months > 1 ? `${months} months` : '';
    const dayString = days === 1 ? '1 day' : days > 1 ? `${days} days` : '';
    const hourString = hours === 1 ? '1 hour' : hours > 1 ? `${hours} hours` : '';
    const minuteString = minutes === 1 ? '1 minute' : minutes > 1 ? `${minutes} minutes` : '';
    
    if (monthString) {
      return `${monthString} ${dayString} ${hourString}`;
    } else {
      return `${dayString} ${hourString} ${minuteString}`;
    }
}