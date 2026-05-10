import { useSuspenseQuery } from "@tanstack/react-query";
import { getWeatherData } from "../../api";
import { useCoords } from "../../context/useCoords";
import WeatherIcon from "../WeatherIcon";
import Card from "./Card";

const DailyForecast = () => {
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

      <Card title="Daily Weather" childrenClassName="flex flex-col gap-4">
        {data?.daily.map((day) => (
          <div key={day.dt} className="flex justify-between">
            <p className="w-9">
              {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                weekday: "short",
              })}
            </p>
            <WeatherIcon src={day.weather[0].icon} />
            <p>{Math.round(day.temp.day)}°C</p>
            <p className="text-gray-500/75">{Math.round(day.temp.min)}°C</p>
            <p className="text-gray-500/75">{Math.round(day.temp.max)}°C</p>
          </div>
        ))}
      </Card>
    </>
  );
};

export default DailyForecast;
