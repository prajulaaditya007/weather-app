import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useCoords } from "../context/useCoords";

const Map = () => {
  const { coords } = useCoords();
  const position = [coords.lat, coords.lng] as [number, number];

  return (
    <MapContainer
      center={position}
      zoom={11}
      style={{ width: "1000px", height: "500px" }}
    >
      <MapClick />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} />
    </MapContainer>
  );
};

export default Map;

function MapClick() {
  const { setCoords } = useCoords();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });
      e.target.panTo([lat, lng]);
    },
  });

  return null;
}
