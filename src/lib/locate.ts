type Geom = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

function normLon(l: number) {
  return l < 0 ? l + 360 : l;
}

function pointInGeom(lon: number, lat: number, geom: Geom) {
  const x = normLon(lon);
  const y = lat;
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  for (const poly of polys as number[][][][]) {
    let inside = false;
    for (const ring of poly) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = normLon(ring[i][0]);
        const yi = ring[i][1];
        const xj = normLon(ring[j][0]);
        const yj = ring[j][1];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
    }
    if (inside) return true;
  }
  return false;
}

export async function locatePlace(lon: number, lat: number) {
  const geo = (await import("@/data/geo.json")).default as {
    regions: { name: string; geometry: Geom }[];
    districts: { name: string; geometry: Geom }[];
  };

  const tryAt = (x: number, y: number) => {
    for (const f of geo.districts) {
      if (pointInGeom(x, y, f.geometry)) return { kind: "ta" as const, name: f.name };
    }
    for (const f of geo.regions) {
      if (pointInGeom(x, y, f.geometry)) return { kind: "region" as const, name: f.name };
    }
    return null;
  };

  const hit = tryAt(lon, lat);
  if (hit) return hit;
  for (const rad of [0.02, 0.05]) {
    for (let k = 0; k < 8; k++) {
      const ang = (k * Math.PI) / 4;
      const h = tryAt(lon + rad * Math.cos(ang), lat + rad * Math.sin(ang));
      if (h) return h;
    }
  }
  return null;
}
