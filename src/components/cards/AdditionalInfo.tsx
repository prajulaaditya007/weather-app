import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getWeatherData } from "../../api";
import {
  ArrowIcon,
  BeakerIcon,
  CloudIcon,
  DewIcon,
  DirectionIcon,
  FirstQuarterIcon,
  FullMoonIcon,
  LastQuarterIcon,
  NewMoonIcon,
  PressureIcon,
  RainIcon,
  SunriseIcon,
  SunsetIcon,
  TemperatureIcon,
  UvIcon,
  VisibilityIcon,
  WaningCrescentIcon,
  WaningGibbousIcon,
  WaxingCrescentIcon,
  WaxingGibbousIcon,
  WindIcon,
} from "../../assets";
import { useCoords } from "../../context/useCoords";
import Card from "./Card";

type WeatherData = Awaited<ReturnType<typeof getWeatherData>>;
type RowIcon = ReactNode | ((data: WeatherData) => ReactNode);

type Row = {
  label: string;
  value: (data: WeatherData) => ReactNode | undefined;
  icon?: RowIcon;
};

const AdditionalInfo = () => {
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

  const visibleRows = rows
    .map((row) => ({
      label: row.label,
      value: row.value(data),
      icon: typeof row.icon === "function" ? row.icon(data) : row.icon,
    }))
    .filter(
      (row): row is { label: string; value: ReactNode; icon: ReactNode } =>
        row.value !== undefined,
    );

  return (
    <>
      {error instanceof Error && (
        <p className="mt-4 text-red-500">{error.message}</p>
      )}
      <Card
        title="Additional Weather Info"
        childrenClassName="flex flex-col gap-3"
      >
        {visibleRows.map(({ label, value, icon }) => (
          <div key={label} className="flex justify-between">
            <div className="flex gap-4">
              <span className="text-gray-500">{label}</span>
              {icon}
            </div>
            <span>{value}</span>
          </div>
        ))}
      </Card>
    </>
  );
};

export default AdditionalInfo;

const iconClassName = "size-6 shrink-0 invert";

const rows: Row[] = [
  {
    label: "Sunrise",
    value: (data) => formatOptionalTime(data.current.sunrise, data.timezone),
    icon: <SunriseIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Sunset",
    value: (data) => formatOptionalTime(data.current.sunset, data.timezone),
    icon: <SunsetIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Pressure",
    value: (data) => `${Math.round(data.current.pressure)} hPa`,
    icon: <PressureIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Dew Point",
    value: (data) => `${Math.round(data.current.dew_point)}°C`,
    icon: <DewIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "UV Index",
    value: (data) => data.current.uvi.toFixed(1),
    icon: <UvIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Cloud Cover",
    value: (data) => `${Math.round(data.current.clouds)}%`,
    icon: <CloudIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Visibility",
    value: (data) => `${(data.current.visibility / 1000).toFixed(1)} km`,
    icon: <VisibilityIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Wind Direction",
    value: (data) => (
      <span className="inline-flex items-center gap-2">
        {Math.round(data.current.wind_deg)}°
        <ArrowIcon
          className="size-4 shrink-0 invert"
          style={{ transform: `rotate(${data.current.wind_deg}deg)` }}
          aria-hidden="true"
        />
      </span>
    ),
    icon: <DirectionIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Wind Gust",
    value: (data) =>
      data.current.wind_gust !== undefined
        ? `${Math.round(data.current.wind_gust)} m/s`
        : undefined,
    icon: <WindIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Today's Summary",
    value: (data) => data.daily[0]?.summary,
    icon: <CloudIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Today's Rain Chance",
    value: (data) =>
      data.daily[0] ? `${Math.round(data.daily[0].pop * 100)}%` : undefined,
    icon: <RainIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Today's Rain Volume",
    value: (data) =>
      data.daily[0]?.rain !== undefined
        ? `${data.daily[0].rain} mm`
        : undefined,
    icon: <BeakerIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Moonrise",
    value: (data) =>
      data.daily[0]
        ? formatOptionalTime(data.daily[0].moonrise, data.timezone)
        : undefined,
    icon: <NewMoonIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Moonset",
    value: (data) =>
      data.daily[0]
        ? formatOptionalTime(data.daily[0].moonset, data.timezone)
        : undefined,
    icon: <FullMoonIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Moon Phase",
    value: (data) =>
      data.daily[0] ? formatMoonPhase(data.daily[0].moon_phase) : undefined,
    icon: (data) =>
      data.daily[0] ? getMoonPhaseIcon(data.daily[0].moon_phase) : undefined,
  },
  {
    label: "Morning Temp",
    value: (data) =>
      data.daily[0] ? `${Math.round(data.daily[0].temp.morn)}°C` : undefined,
    icon: <TemperatureIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Evening Temp",
    value: (data) =>
      data.daily[0] ? `${Math.round(data.daily[0].temp.eve)}°C` : undefined,
    icon: <TemperatureIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Night Temp",
    value: (data) =>
      data.daily[0] ? `${Math.round(data.daily[0].temp.night)}°C` : undefined,
    icon: <TemperatureIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Morning Feels Like",
    value: (data) =>
      data.daily[0]
        ? `${Math.round(data.daily[0].feels_like.morn)}°C`
        : undefined,
    icon: <TemperatureIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Evening Feels Like",
    value: (data) =>
      data.daily[0]
        ? `${Math.round(data.daily[0].feels_like.eve)}°C`
        : undefined,
    icon: <TemperatureIcon className={iconClassName} aria-hidden="true" />,
  },
  {
    label: "Night Feels Like",
    value: (data) =>
      data.daily[0]
        ? `${Math.round(data.daily[0].feels_like.night)}°C`
        : undefined,
    icon: <TemperatureIcon className={iconClassName} aria-hidden="true" />,
  },
];

function formatTime(timestamp: number, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(timestamp * 1000));
}

function formatOptionalTime(timestamp: number | undefined, timezone: string) {
  if (!timestamp) return undefined;

  return formatTime(timestamp, timezone);
}

function formatMoonPhase(phase: number) {
  if (phase === 0 || phase === 1) return "New Moon";
  if (phase < 0.25) return "Waxing Crescent";
  if (phase === 0.25) return "First Quarter";
  if (phase < 0.5) return "Waxing Gibbous";
  if (phase === 0.5) return "Full Moon";
  if (phase < 0.75) return "Waning Gibbous";
  if (phase === 0.75) return "Last Quarter";
  return "Waning Crescent";
}

function getMoonPhaseIcon(phase: number) {
  if (phase === 0 || phase === 1) {
    return <NewMoonIcon className={iconClassName} aria-hidden="true" />;
  }
  if (phase < 0.25) {
    return <WaxingCrescentIcon className={iconClassName} aria-hidden="true" />;
  }
  if (phase === 0.25) {
    return <FirstQuarterIcon className={iconClassName} aria-hidden="true" />;
  }
  if (phase < 0.5) {
    return <WaxingGibbousIcon className={iconClassName} aria-hidden="true" />;
  }
  if (phase === 0.5) {
    return <FullMoonIcon className={iconClassName} aria-hidden="true" />;
  }
  if (phase < 0.75) {
    return <WaningGibbousIcon className={iconClassName} aria-hidden="true" />;
  }
  if (phase === 0.75) {
    return <LastQuarterIcon className={iconClassName} aria-hidden="true" />;
  }
  return <WaningCrescentIcon className={iconClassName} aria-hidden="true" />;
}
