import { useCoords } from "../../context/useCoords";
import { useWeatherData } from "../../hooks/useWeatherData";
import WeatherIcon from "../WeatherIcon";
import Card from "./Card";

const DailyForecast = () => {
  const { coords } = useCoords();
  const { data, error } = useWeatherData(coords);

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
