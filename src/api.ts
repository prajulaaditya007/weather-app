import { OneCallSchema } from "./schemas/weatherSchema";
import { checkAndIncrementQuota } from "./utils/apiQuota";


const apiKey = import.meta.env.VITE_API_KEY

export async function getWeatherData({ lat, lon }: { lat: number, lon: number }) {
    if (!checkAndIncrementQuota()) {
        throw new Error("QUOTA_EXCEEDED");
    }

    const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${apiKey}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API Error');
    }

    const data = await response.json();
    return OneCallSchema.parse(data);
}