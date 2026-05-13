import L from 'leaflet';

export const unvisitedIcon = L.divIcon({
  className: '',
  html: '<div class="dx-marker-unvisited"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export const visitedIcon = L.divIcon({
  className: '',
  html: '<div class="dx-marker-visited">✓</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export function clusterIcon(kind: 'visited' | 'unvisited') {
  return (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 32 : count < 100 ? 40 : 52;
    return L.divIcon({
      html: `<div class="dx-cluster ${kind}" style="width:${size}px;height:${size}px;">${count}</div>`,
      className: '',
      iconSize: [size, size]
    });
  };
}
