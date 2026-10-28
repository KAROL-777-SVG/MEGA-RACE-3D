/**
 * races.js — Poyga ta'riflari, checkpoint koordinatalari, mukofotlar.
 */
export const RACES = [
  {
    id: 'street_race_1',
    name: 'Street Sprint',
    type: 'sprint',
    zone: 'mega_city',
    difficulty: 'easy',
    reward: 1500,
    xp: 100,
    checkpoints: [
      { x: 0, z: 20, radius: 8 },
      { x: 80, z: 20, radius: 8 },
      { x: 160, z: 80, radius: 8 },
      { x: 160, z: 160, radius: 8 }
    ],
    start: { x: 0, z: 20 },
    finish: { x: 160, z: 160 },
    timeLimit: 90
  },
  {
    id: 'circuit_1',
    name: 'City Circuit',
    type: 'circuit',
    zone: 'mega_city',
    difficulty: 'medium',
    reward: 3000,
    xp: 250,
    laps: 2,
    checkpoints: [
      { x: -80, z: -80, radius: 10 },
      { x: 80, z: -80, radius: 10 },
      { x: 80, z: 80, radius: 10 },
      { x: -80, z: 80, radius: 10 }
    ],
    start: { x: -80, z: -80 },
    finish: { x: -80, z: -80 },
    timeLimit: 180
  },
  {
    id: 'drift_1',
    name: 'Neon Drift',
    type: 'drift',
    zone: 'mega_city',
    difficulty: 'hard',
    reward: 5000,
    xp: 400,
    checkpoints: [
      { x: 0, z: 100, radius: 10 },
      { x: 100, z: 100, radius: 10 },
      { x: 100, z: 0, radius: 10 },
      { x: 0, z: 0, radius: 10 }
    ],
    start: { x: 0, z: 100 },
    finish: { x: 0, z: 100 },
    timeLimit: 120
  },
  {
    id: 'highway_1',
    name: 'Ocean Highway',
    type: 'sprint',
    zone: 'ocean_highway',
    difficulty: 'medium',
    reward: 4000,
    xp: 300,
    checkpoints: [
      { x: 400, z: -200, radius: 12 },
      { x: 450, z: 0, radius: 12 },
      { x: 450, z: 200, radius: 12 },
      { x: 500, z: 400, radius: 12 }
    ],
    start: { x: 400, z: -200 },
    finish: { x: 500, z: 400 },
    timeLimit: 150
  },
  {
    id: 'mountain_1',
    name: 'Mountain Climb',
    type: 'time_trial',
    zone: 'mountain_zone',
    difficulty: 'hard',
    reward: 6000,
    xp: 500,
    checkpoints: [
      { x: -400, z: -300, radius: 10 },
      { x: -450, z: -100, radius: 10 },
      { x: -500, z: 100, radius: 10 },
      { x: -450, z: 300, radius: 10 }
    ],
    start: { x: -400, z: -300 },
    finish: { x: -450, z: 300 },
    timeLimit: 200
  }
];

export function getRaceById(id) {
  return RACES.find(r => r.id === id) || null;
}

export function getRacesByZone(zoneId) {
  return RACES.filter(r => r.zone === zoneId);
}