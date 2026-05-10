import { useSuspenseQuery } from "@tanstack/react-query";
import { getWeatherData } from "../../api";
import { useCoords } from "../../context/useCoords";
import WeatherIcon from "../WeatherIcon";
import Card from "./Card";

const CurrentWeather = () => {
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
        title="Current Weather"
        childrenClassName="flex flex-col items-center gap-6"
      >
        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-6xl font-semibold text-center">
            {Math.round(data.current.temp)}°C
          </h2>
          <WeatherIcon src={data.current.weather[0].icon} className="size-12" />
          <h3 className="capitalize text-xl">
            {data.current.weather[0].description}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xl text-center">Local Time:</p>
          <h3 className="text-4xl font-semibold">
            {new Intl.DateTimeFormat("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: data.timezone,
            }).format(new Date(data.current.dt * 1000))}
          </h3>
        </div>
        <div className="flex justify-between w-full">
          <div className="flex flex-col items-center  gap-2">
            <p className="text-gray-500">Feels like</p>
            <p>{Math.round(data.current.feels_like)}°C </p>
          </div>
          <div className="flex flex-col items-center  gap-2">
            <p className="text-gray-500">Humidity</p>
            <p>{Math.round(data.current.humidity)}%</p>
          </div>
          <div className="flex flex-col items-center  gap-2">
            <p className="text-gray-500">Wind</p>
            <p>{Math.round(data.current.wind_speed)}m/s </p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default CurrentWeather;
