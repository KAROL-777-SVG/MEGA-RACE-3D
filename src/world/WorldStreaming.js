/**
 * WorldStreaming.js — chunk loading tizimi.
 * O'yinchiga yaqin hududlarni to'liq, uzoqni soddalashtirilgan ko'rsatadi.
 * Hozircha LOD masofasiga qarab guruhlarni ko'rsatish/yashirish.
 */
import * as THREE from 'three';

const CHUNK_SIZE = 200;

export class WorldStreaming {
  constructor(scene, renderDistance = 500) {
    this.scene = scene;
    this.renderDistance = renderDistance;
    this.chunks = new Map(); // key -> { group, loaded }
    this.activeChunks = new Set();
    this._lastPlayerChunk = null;
    this.onChunkLoad = null;
    this.onChunkUnload = null;
  }

  /** Chunk key (world coords asidagi) */
  chunkKey(x, z) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    return `${cx},${cz}`;
  }

  /** Chunk guruhini ro'yxatga olish (statik ob'ektlar uchun) */
  registerChunk(group, x, z) {
    const key = this.chunkKey(x, z);
    if (!this.chunks.has(key)) {
      this.chunks.set(key, { group, loaded: true });
    } else {
      this.chunks.get(key).group = group;
    }
    return key;
  }

  /** Player pozitsiyasi bo'yicha chunk'larni yuklash/tushirish */
  update(playerPos) {
    if (!playerPos) return;

    const currentKey = this.chunkKey(playerPos.x, playerPos.z);
    if (currentKey === this._lastPlayerChunk) return;
    this._lastPlayerChunk = currentKey;

    const needed = new Set();
    const radiusChunks = Math.ceil(this.renderDistance / CHUNK_SIZE);

    for (let dx = -radiusChunks; dx <= radiusChunks; dx++) {
      for (let dz = -radiusChunks; dz <= radiusChunks; dz++) {
        const cx = Math.floor(playerPos.x / CHUNK_SIZE) + dx;
        const cz = Math.floor(playerPos.z / CHUNK_SIZE) + dz;
        needed.add(`${cx},${cz}`);
      }
    }

    // Unload far chunks
    for (const key of this.activeChunks) {
      if (!needed.has(key)) {
        const chunk = this.chunks.get(key);
        if (chunk && chunk.group) chunk.group.visible = false;
        this.activeChunks.delete(key);
        if (this.onChunkUnload) this.onChunkUnload(key);
      }
    }

    // Load needed
    for (const key of needed) {
      if (!this.activeChunks.has(key)) {
        const chunk = this.chunks.get(key);
        if (chunk && chunk.group) chunk.group.visible = true;
        this.activeChunks.add(key);
        if (this.onChunkLoad) this.onChunkLoad(key);
      }
    }
  }

  /** Avtomatik chunklarga bo'lish yordamchisi */
  static splitIntoChunks(objects) {
    const chunks = new Map();
    objects.forEach(obj => {
      if (!obj.position) return;
      const key = `${Math.floor(obj.position.x / CHUNK_SIZE)},${Math.floor(obj.position.z / CHUNK_SIZE)}`;
      if (!chunks.has(key)) chunks.set(key, []);
      chunks.get(key).push(obj);
    });
    return chunks;
  }

  dispose() {
    this.chunks.clear();
    this.activeChunks.clear();
  }
}