/**
 * AssetManager — 3D modellar, texture va audio yuklashni boshqaradi.
 * Tashqi aktivlar mavjud bo'lmasa, fallback geometrik shakllar qaytaradi.
 */
import * as THREE from 'three';

export class AssetManager {
  constructor() {
    this.cache = new Map();
    this.loading = 0;
    this.loaded = 0;
    this.audioContext = null;
    this.sounds = new Map();
  }

  /** GLB/glTF model yuklash (mavjud bo'lmasa null qaytaradi) */
  async loadGLTF(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    try {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
      this.cache.set(url, gltf);
      return gltf;
    } catch (e) {
      console.warn(`[AssetManager] GLTF yuklanmadi: ${url}`, e.message);
      return null;
    }
  }

  /** Texture yuklash (mavjud bo'lmasa null qaytaradi) */
  async loadTexture(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    try {
      const loader = new THREE.TextureLoader();
      const tex = await new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      this.cache.set(url, tex);
      return tex;
    } catch {
      console.warn(`[AssetManager] Texture yuklanmadi: ${url}`);
      return null;
    }
  }

  /** Procedural texture yaratish (fallback) */
  createProceduralTexture(type = 'asphalt', size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (type === 'asphalt') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 2000; i++) {
        const g = 20 + Math.random() * 40;
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
      }
    } else if (type === 'grass') {
      ctx.fillStyle = '#1a2a1a';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle = `hsl(${100 + Math.random() * 40}, 40%, ${10 + Math.random() * 15}%)`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 3, 3);
      }
    } else if (type === 'concrete') {
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(${60 + Math.random() * 40},${60 + Math.random() * 40},${60 + Math.random() * 40},0.5)`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 4, 4);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /** Audio yuklash */
  async loadAudio(url) {
    if (this.sounds.has(url)) return this.sounds.get(url);
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      const buf = await this.audioContext.decodeAudioData(arr);
      this.sounds.set(url, buf);
      return buf;
    } catch {
      console.warn(`[AssetManager] Audio yuklanmadi: ${url}`);
      return null;
    }
  }

  playSound(url, volume = 1) {
    const buf = this.sounds.get(url);
    if (!buf || !this.audioContext) return;
    const src = this.audioContext.createBufferSource();
    src.buffer = buf;
    const gain = this.audioContext.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(this.audioContext.destination);
    src.start();
  }

  dispose() {
    this.cache.forEach(v => {
      if (v.isTexture) v.dispose();
      if (v.scene) v.scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) Array.isArray(o.material) ? o.material.forEach(m => m.dispose()) : o.material.dispose();
      });
    });
    this.cache.clear();
    this.sounds.clear();
  }
}