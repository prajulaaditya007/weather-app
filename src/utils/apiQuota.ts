const QUOTA_KEY = 'weather_api_usage';
const DAILY_LIMIT = 100;

export function checkAndIncrementQuota(): boolean {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(QUOTA_KEY) || '{}');

    // Reset if it's a new day
    if (stored.date !== today) {
        localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today, count: 1 }));
        return true;
    }

    if (stored.count >= DAILY_LIMIT) {
        return false; // Limit reached
    }

    localStorage.setItem(QUOTA_KEY, JSON.stringify({ ...stored, count: stored.count + 1 }));
    return true;
}