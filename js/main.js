mapboxgl.accessToken ="pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  zoom: 6.5,
  center: [-122, 47],
});

const marker = new mapboxgl.Marker()
  .setLngLat([-122.25948, 47.87221])
  .addTo(map);

async function geojsonFetch() {
  let response, counties, districts, libraries, schools;
  response = await fetch("assets/counties.geojson");
  counties = await response.json();
  response = await fetch("assets/districts.geojson");
  districts = await response.json();
  response = await fetch("assets/libraries2.geojson");
  libraries = await response.json();
  response = await fetch("assets/schools2.geojson");
  schools = await response.json();

  libraries.features.forEach(function (library, i) {
    library.properties.id = i;
  });

  schools.features.forEach(function(sc, i) {
    sc.properties.id = i;
  });

map.on("load", function loadingData() {
    map.addSource("libraries", {
      type: "geojson",
      data: libraries,
    });

    map.addSource("schools", {
        type: "geojson",
        data: schools
    });

const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: true,
      bbox: [-122.30932, 37.84213, -122.23712, 37.89824],
    });
    
    map.addControl(geocoder);
    addMarkers(geocoder);

  });
  map.addSource("counties", {
    type: "geojson",
    data: counties,
  });
  map.addLayer({
    id: "counties-layer",
    type: "line",
    source: "counties",
    paint: {
      "line-color": "#FFFFFF",
      "line-opacity": 1,
    },
  });
  map.addSource("districts", {
    type: "geojson",
    data: districts,
  });
  map.addLayer({
    id: "districts-layer",
    type: "line",
    source: "districts",
    paint: {
      "line-color": "#0080ff",
      "line-opacity": 0.4,
    },
  });

  function addMarkers(geocoder) {
    for (const marker of libraries.features) {
      const el = document.createElement("div");
      el.id = `marker-${marker.properties.id}`;
      el.className = "marker";
      new mapboxgl.Marker(el, { offset: [0, -23] })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
    }

    for (const marker of schools.features) {
        const el = document.createElement("div");
        el.id = `marker-${marker.properties.id}`;
        switch (marker.properties.Grades) {
            case "Elementary School": el.className = "marker_sc_elementry"; break;
            case "Middle School":el.className = "marker_sc_middle"; break;
            case "High School": el.className = "marker_sc_high"; break;
            case "PK-12": el.className = "marker_sc_pk12"; break;
            case "K-12": el.className = "marker_sc_k12"; break;
            case "Other": el.className = "marker_sc_other"; break;
            case "PK Only": el.className = "marker_sc_pk"; break;
            default: el.className = "marker_sc_elementry"; break;
        }
    
    new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
      }

    geocoder.on("result", (event) => {
        map.getSource("libraries").setData(event.result.geometry);
    });
  }
}
geojsonFetch();
