import { trait } from 'koota';

// Seconds since the last tick, and the clock reading of this tick in milliseconds.
export const Time = trait({ delta: 0, current: 0 });
