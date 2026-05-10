import Map from "./components/Map";
import AdditionalInfo from "./components/cards/AdditionalInfo";
import CurrentWeather from "./components/cards/CurrentWeather";
import DailyForecast from "./components/cards/DailyForecast";
import HourlyForecast from "./components/cards/HourlyForecast";

function App() {
  return (
    <>
      <div className="flex flex-col gap-8">
        <Map />
        <CurrentWeather />
        <HourlyForecast />
        <DailyForecast />
        <AdditionalInfo />
      </div>
    </>
  );
}
export default App;
