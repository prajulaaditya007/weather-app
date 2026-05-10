import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useCoords } from "../context/useCoords";

const Map = () => {
  const { coords } = useCoords();
  const position = [coords.lat, coords.lng] as [number, number];

  return (
    <MapContainer
      center={position}
      zoom={11}
      style={{ width: "95vw", height: "500px" }}
    >
      <MapSync lat={coords.lat} lng={coords.lng} />
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

function MapSync({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return null;
}
