import { relation, trait } from 'koota';
import { Vector3 } from 'three';

// Something a character can sit on. The seat is where the rider's Position goes, in local space.
// Forward is -z, so a positive z sits the rider further back.
export const Rideable = trait({ seat: () => new Vector3(0, 0.75, 0.3) });
export const Rides = relation({ exclusive: true });
