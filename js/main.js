mapboxgl.accessToken ="pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  zoom: 6.5,
  center: [-122, 47],
});

let currentFeature;

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: true,
  bbox: [-124.915070, 45.481431, -116.708878 , 49.049332],
});

window.addEventListener("load", function initialize() {
  currentFeature = document.querySelector("input[type=radio]:checked").value;
});

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

    map.addSource("schools", {
        type: "geojson",
        data: schools
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
    addSchoolLayer("elementry-sc-layer", "elementry-sc", "img/elementary_school.png");
    addSchoolLayer("middle-sc-layer", "middle-sc", "img/middle_school.png");
    addSchoolLayer("high-sc-layer", "high-sc", "img/high_school.png");
    map.addControl(geocoder, 'top-right');

    geocoder.on("result", (event) => {
      map.getSource(currentFeature).setData(event.result.geometry);
      const searchResult = event.result.geometry;
      const options = { units: 'miles' };
      for (const feature of currentFeature.features) {
        feature.properties.distance = turf.distance(
        searchResult,
        feature.geometry,
        options
        );
      }
      currentFeature.features.sort((a, b) => {
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
      buildLocationList(currentFeature);
      createPopUp(currentFeature.features[0]);
      const activeListing = document.getElementById(
        `listing-${currentFeature.features[0].properties.id}`
        );
        activeListing.classList.add('active');
        // const bbox = getBbox(currentFeature, 0, searchResult);
        // map.fitBounds(bbox, {
        // padding: 100
        // });
    });
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

  map.addSource("libraries", {
    type: "geojson",
    data: libraries,
  });

  map.addLayer({
    id: "libraries-layer",
    type: "symbol",
    source: "libraries",
  });

  //radio buttons to toggle layer visibility/use
  const radio1 = document.getElementById("layer-choice-1");
  radio1.addEventListener('click', () => {
    currentFeature = map.getLayer("elementarySchools");
    const visibility = map.getLayoutProperty(
      currentFeature,
      'visibility'
    );

    // Toggle layer visibility by changing the layout object's visibility property.
    // if it is currently visible, after the clicking, it will be turned off.
    if (visibility === 'visible') {
      map.setLayoutProperty(currentFeature, 'visibility', 'none');
      this.className = '';
    } else { //otherise, it will be turned on.
      this.className = 'active';
      map.setLayoutProperty(
          currentFeature,
          'visibility',
          'visible'
      );
    }
  });

  const radio2 = document.getElementById("layer-choice-2");
  radio2.addEventListener('click', () => {
    currentFeature = map.getLayer("middleSchools");
    const visibility = map.getLayoutProperty(
      currentFeature,
      'visibility'
    );
    if (visibility === 'visible') {
      map.setLayoutProperty(currentFeature, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      map.setLayoutProperty(
          currentFeature,
          'visibility',
          'visible'
      );
    }
  });

  const radio3 = document.getElementById("layer-choice-3");
  radio3.addEventListener('click', () => {
    currentFeature = map.getLayer("highSchools");
    const visibility = map.getLayoutProperty(
      currentFeature,
      'visibility'
    );
    if (visibility === 'visible') {
      map.setLayoutProperty(currentFeature, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      map.setLayoutProperty(
          currentFeature,
          'visibility',
          'visible'
      );
    }
  });

  const radio4 = document.getElementById("layer-choice-4");
  radio4.addEventListener('click', () => {
    currentFeature = map.getLayer("libraries");
    const visibility = map.getLayoutProperty(
      currentFeature,
      'visibility'
    );
    if (visibility === 'visible') {
      map.setLayoutProperty(currentFeature, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      map.setLayoutProperty(
          currentFeature,
          'visibility',
          'visible'
      );
    }
  });
}

//  function addMarkers(currLayer, geocoder) {
//    for (const marker of currLayer.features) {
//      const el = document.createElement("div");
//      el.id = `marker-${marker.properties.id}`;
//      el.className = "marker";
//      new mapboxgl.Marker(el, { offset: [0, -23] })
//        .setLngLat(marker.geometry.coordinates)
//        .addTo(map);
//      el.addEventListener('click', (e) => {
//        flyToSchool(marker);
//        createPopUp(marker);
//        const activeItem = document.getElementsByClassName('active');
//        e.stopPropagation();
//        if (activeItem[0]) {
//          activeItem[0].classList.remove('active');
//       }
//        const listing = document.getElementById(
//          `listing-${marker.properties.id}`
//       );
//      listing.classList.add('active');
//      });
//    }
//  }

//  function getBbox(sortedFeats, storeIdentifier, searchResult) {
//    const lats = [
//      sortedFeats.features[storeIdentifier].geometry.coordinates[1],
//      searchResult.coordinates[1]
//    ];
//    const lons = [
//      sortedFeats.features[storeIdentifier].geometry.coordinates[0],
//      searchResult.coordinates[0]
//    ];
//    const sortedLons = lons.sort((a, b) => {
//      if (a > b) {
//        return 1;
//      }
//      if (a.distance < b.distance) {
//        return -1;
//      }
//      return 0;
//    });
//    const sortedLats = lats.sort((a, b) => {
//      if (a > b) {
//        return 1;
//      }
//      if (a.distance < b.distance) {
//        return -1;
//      }
//      return 0;
//   });
//    return [
//      [sortedLons[0], sortedLats[0]],
//      [sortedLons[1], sortedLats[1]]
//    ];
//  }

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

function buildLocationList(currentFeature) {
  for (const currentFeature of currentFeature.features) {

      /* Add a new listing section to the sidebar. */
      const listings = document.getElementById('listings');
      const listing = listings.appendChild(document.createElement('div'));

      /* Assign a unique `id` to the listing. */
      listing.id = `listing-${currentFeature.properties.id}`;

      /* Assign the `item` class to each listing for styling. */
      listing.className = 'item';
      
      /* Add the link to the individual listing created above. */
      const link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.id = `link-${currentFeature.properties.id}`;
      link.innerHTML = `${currentFeature.properties.Name}`;
      
      /* Add details to the individual listing. */
      const details = listing.appendChild(document.createElement('div'));
      details.innerHTML = `${currentFeature.properties.Address}`;
      if (currentFeature.properties.Phone) {
          details.innerHTML += ` &middot; ${currentFeature.properties.Phone}`;
      }
      if (currentFeature.properties.distance) {
          const roundedDistance =
          Math.round(currentFeature.properties.distance * 100) / 100;
          details.innerHTML += `<div><strong>${roundedDistance} miles away</strong></div>`;
      }
   
      /**
      * Listen to the element and when it is clicked, do four things:
      * 1. Update the `currentFeature` to the store associated with the clicked link
      * 2. Fly to the point
      * 3. Close all other popups and display popup for clicked store
      * 4. Highlight listing in sidebar (and remove highlight for all other listings)
      **/
      link.addEventListener('click', function () {
          for (const feature of currentFeature.features) {
              if (this.id === `link-${feature.properties.id}`) {
                  flyToSchool(feature);
                  createPopUp(feature);
              }
          }
          const activeItem = document.getElementsByClassName('active');
          if (activeItem[0]) {
              activeItem[0].classList.remove('active');
          }
          this.parentNode.classList.add('active');
      });
  }
}

function flyToSchool(currentFeature) {
  map.flyTo({
  center: currentFeature.geometry.coordinates,
  zoom: 15
  });
}

function createPopUp(currentFeature) {
  const popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();
   
  const popup = new mapboxgl.Popup({ closeOnClick: false })
  .setLngLat(currentFeature.geometry.coordinates)
  .setHTML(`<h4>${currentFeature.properties.Address}</h4>`)
  .addTo(map);
}
