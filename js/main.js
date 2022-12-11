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
    map.addControl(geocoder, 'top-right');
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
  geocoder.on("result", (event) => {
    map.getSource("libraries").setData(event.result.geometry);
    const searchResult = event.result.geometry;
    const options = { units: 'miles' };
    for (const library of libraries.features) {
      library.properties.distance = turf.distance(
      searchResult,
      library.geometry,
      options
      );
    }
    libraries.features.sort((a, b) => {
      if (a.properties.distance > b.properties.distance) {
        return 1;
        }
        if (a.properties.distance < b.properties.distance) {
        return -1;
        }
        return 0;
    });
    const listings = document.getElementById('listings');
    while (listings.firstChild) {
    listings.removeChild(listings.firstChild);
    }
    buildLocationList(libraries);
    createPopUp(libraries.features[0]);
    const activeListing = document.getElementById(
      `listing-${libraries.features[0].properties.id}`
      );
      activeListing.classList.add('active');
      const bbox = getBbox(libraries, 0, searchResult);
      map.fitBounds(bbox, {
      padding: 100
    });
  });
}

function getBbox(sortedLibraries, storeIdentifier, searchResult) {
  const lats = [
    sortedLibraries.features[storeIdentifier].geometry.coordinates[1],
    searchResult.coordinates[1]
  ];
  const lons = [
    sortedLibraries.features[storeIdentifier].geometry.coordinates[0],
    searchResult.coordinates[0]
  ];
  const sortedLons = lons.sort((a, b) => {
    if (a > b) {
      return 1;
    }
    if (a.distance < b.distance) {
      return -1;
    }
    return 0;
  });
  const sortedLats = lats.sort((a, b) => {
    if (a > b) {
      return 1;
    }
    if (a.distance < b.distance) {
      return -1;
    }
    return 0;
  });
  return [
    [sortedLons[0], sortedLats[0]],
    [sortedLons[1], sortedLats[1]]
  ];
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
}