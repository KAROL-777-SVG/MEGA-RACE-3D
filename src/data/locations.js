/**
 * locations.js — Xarita hududlari, spawn nuqtalari, POI va waypoint'lar.
 */
export const ZONES = {
  mega_city: {
    id: 'mega_city',
    name: 'Mega City',
    bounds: { minX: -300, maxX: 300, minZ: -300, maxZ: 300 },
    color: 0x246BFD,
    spawn: { x: 0, z: 20 },
    description: 'Osmono\'par binolar va neon chiroqlar shahri'
  },
  ocean_highway: {
    id: 'ocean_highway',
    name: 'Ocean Highway',
    bounds: { minX: 300, maxX: 600, minZ: -600, maxZ: 600 },
    color: 0x00C8FF,
    spawn: { x: 400, z: 0 },
    description: 'Dengiz bo\'yidagi uzun avtomagistral'
  },
  mountain_zone: {
    id: 'mountain_zone',
    name: 'Mountain Road',
    bounds: { minX: -600, maxX: -300, minZ: -600, maxZ: 600 },
    color: 0xB100FF,
    spawn: { x: -450, z: 0 },
    description: 'Tog\'li burilish yo\'llari'
  },
  desert_zone: {
    id: 'desert_zone',
    name: 'Desert Zone',
    bounds: { minX: -600, maxX: 600, minZ: 300, maxZ: 600 },
    color: 0xFF8A00,
    spawn: { x: 0, z: 450 },
    description: 'Cho\'l va off-road hududlari'
  },
  forest_zone: {
    id: 'forest_zone',
    name: 'Forest Zone',
    bounds: { minX: -600, maxX: 600, minZ: -600, maxZ: -300 },
    color: 0x00FF88,
    spawn: { x: 0, z: -450 },
    description: 'O\'rmon yo\'llari va tabiat'
  }
};

export const POINTS_OF_INTEREST = [
  { id: 'garage_1', type: 'garage', name: 'Asosiy Garaj', x: 40, z: 40, icon: '🔧' },
  { id: 'gas_1', type: 'gas', name: 'Benzin Shoxobchasi', x: -120, z: 80, icon: '⛽' },
  { id: 'garage_2', type: 'garage', name: 'Shimoliy Garaj', x: 200, z: -200, icon: '🔧' },
  { id: 'gas_2', type: 'gas', name: 'Ocean Benzin', x: 450, z: 100, icon: '⛽' },
  { id: 'landmark', type: 'landmark', name: 'Mega Arch', x: 0, z: 0, icon: '🏛' }
];

export function getZoneAtPosition(x, z) {
  for (const zone of Object.values(ZONES)) {
    const b = zone.bounds;
    if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
      return zone;
    }
  }
  return ZONES.mega_city;
}

export const WORLD_BOUNDS = { min: -600, max: 600 };