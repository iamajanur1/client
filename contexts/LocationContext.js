
import { createContext } from 'react';

export const LocationContext = createContext({
  liveCoords: null,     
  routeId: null,
  locationStatus: 'unknown',
});
