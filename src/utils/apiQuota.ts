const QUOTA_KEY = "openweather_api_usage";
const DEFAULT_DAILY_LIMIT = 100;
const DEFAULT_MINUTE_LIMIT = 50;
const ONE_MINUTE_MS = 60_000;

type QuotaState = {
  date: string;
  dailyCount: number;
  minuteWindowStartedAt: number;
  minuteCount: number;
};

function getLimit(envValue: string | undefined, fallback: number) {
  const limit = Number(envValue);

  return Number.isFinite(limit) && limit > 0 ? limit : fallback;
}

const DAILY_LIMIT = getLimit(
  import.meta.env.VITE_OPENWEATHER_DAILY_LIMIT,
  DEFAULT_DAILY_LIMIT,
);
const MINUTE_LIMIT = getLimit(
  import.meta.env.VITE_OPENWEATHER_MINUTE_LIMIT,
  DEFAULT_MINUTE_LIMIT,
);

export function reserveApiCall(): boolean {
  const state = getQuotaState();

  if (state.dailyCount >= DAILY_LIMIT || state.minuteCount >= MINUTE_LIMIT) {
    return false;
  }

  saveQuotaState({
    ...state,
    dailyCount: state.dailyCount + 1,
    minuteCount: state.minuteCount + 1,
  });

  return true;
}

export function getApiQuotaStatus() {
  const state = getQuotaState();

  return {
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: Math.max(DAILY_LIMIT - state.dailyCount, 0),
    minuteLimit: MINUTE_LIMIT,
    minuteRemaining: Math.max(MINUTE_LIMIT - state.minuteCount, 0),
  };
}

function getQuotaState(): QuotaState {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const stored = readStoredQuota();
  const state =
    stored?.date === today
      ? stored
      : {
          date: today,
          dailyCount: 0,
          minuteWindowStartedAt: now,
          minuteCount: 0,
        };

  if (now - state.minuteWindowStartedAt >= ONE_MINUTE_MS) {
    return {
      ...state,
      minuteWindowStartedAt: now,
      minuteCount: 0,
    };
  }

  return state;
}

function readStoredQuota(): QuotaState | undefined {
  try {
    const stored = localStorage.getItem(QUOTA_KEY);

    if (!stored) return undefined;

    return JSON.parse(stored) as QuotaState;
  } catch {
    return undefined;
  }
}

function saveQuotaState(state: QuotaState) {
  localStorage.setItem(QUOTA_KEY, JSON.stringify(state));
}
