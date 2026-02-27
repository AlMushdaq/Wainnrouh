import React from 'react';
import { MapPin } from 'lucide-react';

export default function WinnerMap({ winnerName, city, address, t }) {
  const query = address
    ? `${winnerName}, ${address}`
    : `${winnerName}, ${city}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary google-maps-btn"
    >
      <MapPin size={22} />
      {t.openInMaps}
    </a>
  );
}
