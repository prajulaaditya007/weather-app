import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import Map from "./components/Map";
import AdditionalInfo from "./components/cards/AdditionalInfo";
import CurrentWeather from "./components/cards/CurrentWeather";
import DailyForecast from "./components/cards/DailyForecast";
import HourlyForecast from "./components/cards/HourlyForecast";
import LocationDropdown from "./components/dropdowns/LocationDropdown";
import { useCoords } from "./context/useCoords";

function App() {
  const { coords } = useCoords();
  const weatherBoundaryKey = `${coords.lat}:${coords.lng}`;

  return (
    <div className="flex flex-col gap-8">
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            key={weatherBoundaryKey}
            onReset={reset}
            fallback={(error, resetErrorBoundary) => (
              <WeatherErrorFallback
                error={error}
                resetErrorBoundary={resetErrorBoundary}
              />
            )}
          >
            <Suspense fallback={<WeatherLoading />}>
              <LocationDropdown />
              <Map />
              <LocationErrorToast />
              <CurrentWeather />
              <HourlyForecast />
              <DailyForecast />
              <AdditionalInfo />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  );
}

function WeatherLoading() {
  return (
    <div className="rounded-xl bg-zinc-900 p-6 text-zinc-300">
      Loading weather data...
    </div>
  );
}

function WeatherErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  const message = getWeatherErrorMessage(error);
  const isQuotaError = error.message === "QUOTA_EXCEEDED";

  useEffect(() => {
    toast.error(
      isQuotaError ? "API quota exhausted" : "Weather data unavailable",
      {
        id: `weather-error-${message}`,
        description: message,
      },
    );
  }, [isQuotaError, message]);

  return (
    <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-red-100">
      <h2 className="text-2xl font-semibold">Weather data unavailable</h2>
      <p className="mt-2 text-red-100/80">{message}</p>
      <p className="mt-2 text-sm text-red-100/70">
        Select another point on the map or try loading this location again.
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-950"
      >
        Try again
      </button>
    </div>
  );
}

function getWeatherErrorMessage(error: Error) {
  if (error.message === "QUOTA_EXCEEDED") {
    return getQuotaExceededMessage();
  }

  return (
    error.message ||
    "The selected location returned weather data that this app cannot display."
  );
}

function getQuotaExceededMessage() {
  return "The OpenWeather API quota has been reached. No more API calls will be made from this browser today.";
}

function LocationErrorToast() {
  const { locationError, locationStatus } = useCoords();

  useEffect(() => {
    if (locationStatus !== "error" && locationStatus !== "quota-exceeded") {
      return;
    }

    toast.warning("Location name unavailable", {
      id: `location-error-${locationStatus}`,
      description:
        locationStatus === "quota-exceeded"
          ? getQuotaExceededMessage()
          : (locationError ?? "The selected location name is not available."),
    });
  }, [locationError, locationStatus]);

  return null;
}

export default App;
