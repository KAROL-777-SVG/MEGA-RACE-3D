/**
 * World.js — World facade. City, Roads, Traffic, Weather, WorldStreaming birlashmasi.
 */
import * as THREE from 'three';
import { City } from './City.js';
import { Roads } from './Roads.js';
import { Traffic } from './Traffic.js';
import { Weather } from './Weather.js';
import { WorldStreaming } from './WorldStreaming.js';
import { WORLD_BOUNDS } from '../data/locations.js';

export class World {
  constructor(scene, sun, hemi, isMobile = false) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.isMobile = isMobile;
    this.bounds = WORLD_BOUNDS;

    this.roads = new Roads(scene);
    this.city = new City(scene);
    this.traffic = new Traffic(scene, this.roads, isMobile ? 6 : 15);
    this.weather = new Weather(scene, sun, hemi);
    this.streaming = new WorldStreaming(scene, isMobile ? 250 : 500);

    this.build();
  }

  build() {
    this.roads.build();
    this.city.build();
    this.buildSky();

    // Register city chunks for streaming
    if (this.city.buildings.length > 0) {
      const chunks = WorldStreaming.splitIntoChunks(this.city.buildings);
      chunks.forEach((objs, key) => {
        const group = new THREE.Group();
        objs.forEach(o => {
          this.scene.remove(o);
          group.add(o);
        });
        this.scene.add(group);
        const [cx, cz] = key.split(',').map(Number);
        this.streaming.registerChunk(group, cx * 200, cz * 200);
      });
    }
  }

  buildSky() {
    const skyGeo = new THREE.SphereGeometry(900, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x02030a) },
        bottomColor: { value: new THREE.Color(0x0a1a30) },
        offset: { value: 200 },
        exponent: { value: 0.6 }
      },
      vertexShader: `varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorld; void main(){ float h = normalize(vWorld + vec3(0.0, offset, 0.0)).y; gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h,0.0), exponent), 0.0)), 1.0); }`
    });
    this.scene.add(new THREE.Mesh(skyGeo, skyMat));
  }

  update(dt, playerPos) {
    this.weather.update(dt);
    this.traffic.update(dt, playerPos);
    this.streaming.update(playerPos);
  }

  dispose() {
    this.roads.dispose();
    this.city.dispose();
    this.traffic.dispose();
    this.streaming.dispose();
  }
}