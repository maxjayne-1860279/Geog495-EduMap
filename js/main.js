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
  let elementarySchools = schools.features.filter(
    (sc) => sc.properties.Grades === "Elementary School"
  );
  let middleSchools = schools.features.filter(
    (sc) => sc.properties.Grades === "Middle School"
  );
  let highSchools = schools.features.filter(
    (sc) => sc.properties.Grades === "High School"
  );

 /* // let elementarySchools = createGeoJson();
  let middleSchools = createGeoJson();
  let highSchools = createGeoJson();

  schools.features.forEach(function(sc, i) {
    sc.properties.id = i;
    switch (sc.properties.Grades) {
      case "Elementary School":
        elementarySchools.features.push(sc);
        break;
      case "Middle School":
        middleSchools.features.push(sc);
        break;
      case "High School":
        highSchools.features.push(sc);
        break;
      default:
        console.log(`school with id ${i} had an invalid grade: ${sc.properties.Grades}`);
    }
  });
*/ 
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
    map.addSource("elementry-sc", {
      type: "geojson",
      data: { type: "FeatureCollection", features: elementarySchools },
    });
    map.addSource("middle-sc", {
      type: "geojson",
      data: { type: "FeatureCollection", features: middleSchools },
    });
    map.addSource("high-sc", {
      type: "geojson",
      data: { type: "FeatureCollection", features: highSchools },
    });
    addSchoolLayer("elementry-sc-layer", "elementry-sc", "../img/elementary_school.png"
    );
    addSchoolLayer("middle-sc-layer", "middle-sc", "../img/middle_school.png");
    addSchoolLayer("high-sc-layer", "high-sc", "../img/high_school.png");
    map.addControl(geocoder);
    addMarkers(geocoder);
  });
  function addSchoolLayer(id, source, imageUrl) {
    map.loadImage(imageUrl, (err, image) => {
      const imageCls = "image-class" + Math.floor(Math.random() * 1000);
      map.addImage(imageCls, image);
      map.addLayer({
        id: id,
        type: "symbol",
        source: source,
        layout: {
          "icon-image": imageCls,
          "icon-size": 0.03,
        },
      });
    });
  }
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
   /* for (const marker of schools.features) {
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
*/
    geocoder.on("result", (event) => {
        map.getSource("libraries").setData(event.result.geometry);
    });
  }
}
geojsonFetch();
/**
 * Creates a new GeoJSON FeatureCollection object.
 * @returns an empty FeatureCollection GeoJSON object
 */
function createGeoJson() {
  return {
      "type": "FeatureCollection",
      "features": []
  }
}