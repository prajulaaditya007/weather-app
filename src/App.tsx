import { useQuery } from "@tanstack/react-query"
import { getWeatherData } from "./api"
import Card from "./components/cards/Card"

function App() {

  const { data } = useQuery({
    queryKey: ['weather'],
    queryFn: () => getWeatherData({ lat: 28.4, lon: 77 })
  })
  return (
    <>
      <button className="">Get data</button>
      <div className="flex flex-col gap-8">
        <Card title="Current Weather">{JSON.stringify(data?.current)}</Card>
        <Card title="Hourly Weather">{JSON.stringify(data?.hourly)}</Card>
        <Card title="Daily Weather">{JSON.stringify(data?.daily)}</Card>
      </div>
    </>
  )
}
export default App
