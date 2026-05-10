import { useSuspenseQuery } from "@tanstack/react-query";
import { getWeatherData } from "../../api";
import { useCoords } from "../../context/useCoords";
import WeatherIcon from "../WeatherIcon";
import Card from "./Card";

function HourlyForecast() {
  const { coords } = useCoords();
  const { data, error } = useSuspenseQuery({
    queryKey: ["weather", coords.lat, coords.lng],
    queryFn: () => getWeatherData({ lat: coords.lat, lon: coords.lng }),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
  return (
    <>
      {error instanceof Error && (
        <p className="mt-4 text-red-500">{error.message}</p>
      )}
      <Card
        title="Hourly Forecast (48 Hours)"
        childrenClassName="flex gap-6 overflow-x-scroll scrollbar-hide"
      >
        {data?.hourly.map((hour) => (
          <div key={hour.dt} className="flex flex-col gap-2 items-center p-2">
            <p className="whitespace-nowrap">
              {new Date(hour.dt * 1000).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <WeatherIcon src={hour.weather[0].icon} />
            <p>{Math.round(hour.temp)}°C</p>
          </div>
        ))}
      </Card>
    </>
  );
}

export default HourlyForecast;
