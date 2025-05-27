export const formatTime = (timestamp,t) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diff / 1000);
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffSeconds < 60) {
      return `${diffSeconds} ${t('lemon.message.secondsAgo')}`;
    }else if (diffMinutes < 60) {
      return `${diffMinutes} ${t('lemon.message.minutesAgo')}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t('lemon.message.hoursAgo')}`;
    } else if (diffDays < 30) {
      return `${diffDays} ${t('lemon.message.daysAgo')}`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} ${t('lemon.message.monthsAgo')}`;
    } else {
      return `${Math.floor(diffDays / 365)} ${t('lemon.message.yearsAgo')}`;
    }
  };

export default {
    formatTime
}