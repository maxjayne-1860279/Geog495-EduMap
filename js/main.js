"use strict"

mapboxgl.accessToken ="pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  zoom: 6.5,
  center: [-122, 47],
});

let currentFeature;
let currentID;

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: true,
  bbox: [-124.915070, 45.481431, -116.708878 , 49.049332],
});
// map.addControl(geocoder, 'top-right');

window.addEventListener("load", function initialize() {
  // currentFeature = document.querySelector("input[type=radio]:checked").value;
  document.getElementById("geocoder-container").appendChild(geocoder.onAdd(map));
});

async function geojsonFetch() {
  let response, counties, districts, libraries, elementary, middle, high;
  response = await fetch("assets/counties.geojson");
  counties = await response.json();
  response = await fetch("assets/districts.geojson");
  districts = await response.json();
  response = await fetch("assets/libraries2.geojson");
  libraries = await response.json();
  response = await fetch("assets/elementary.geojson");
  elementary = await response.json();
  response = await fetch("assets/middle.geojson");
  middle = await response.json();
  response = await fetch("assets/high.geojson");
  high = await response.json();

  // Generate unique ids used for assigning listings
  // arbitrary addition for unique values
  libraries.features.forEach(function (library, i) {
    library.properties.id = i;
  });  
  elementary.features.forEach(function (elem, i) {
    elem.properties.id = i + 100000;
  });  
  middle.features.forEach(function (mid, i) {
    mid.properties.id = i + 200000;
  });  
  high.features.forEach(function (hg, i) {
    hg.properties.id = i + 300000;
  });  

  map.on("load", function loadingData() {
    
    map.addSource("counties", {
      type: "geojson",
      data: counties,
    });
    map.addLayer({
      id: "counties-layer",
      type: "line",
      source: "counties",
      paint: {
        "line-color": "#4a1486",
        "line-opacity": 0.4,
        "line-width": 2,
      }
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
        "line-color": "#6a51a3",
        "line-opacity": 0.4,
      }
    });
  
    map.addSource("libraries", {
      type: "geojson",
      data: libraries,
    });
    map.loadImage('../img/library.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('lib')) map.addImage('lib', image);
    });
    map.addLayer({
      id: "libraries-layer",
      type: "symbol",
      source: "libraries",
      'layout': {
        'icon-image': 'lib',
        'icon-size': 0.1,
        'visibility': 'visible'
      }
    });

    map.addSource("elementary", {
      type: "geojson",
      data: elementary,
    });
    map.loadImage('img/elementary_school.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('elem')) map.addImage('elem', image);
    });
    map.addLayer({
      id: "elementary-layer",
      type: "symbol",
      source: "elementary",
      layout: {
        'icon-image': 'elem',
        'icon-size': 0.1,
        'visibility': 'none'
      },
    });

    map.addSource("middle", {
      type: "geojson",
      data: middle,
    });
    map.loadImage('img/middle_school.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('mid')) map.addImage('mid', image);
    });
    map.addLayer({
      id: "middle-layer",
      type: "symbol",
      source: "middle",
      layout: {
        'icon-image': 'mid',
        'icon-size': 0.1,
        'visibility': 'none'
      }
    });

    map.addSource("high", {
      type: "geojson",
      data: high,
    });
    map.loadImage('img/high_school.png', (error, image) => {
      if (error) throw error;
      if (!map.hasImage('hg')) map.addImage('hg', image);
    });
    map.addLayer({
      id: "high-layer",
      type: "symbol",
      source: "high",
      layout: {
        'icon-image': 'hg',
        'icon-size': 0.1,
        'visibility': 'none'
      }
    });

    currentFeature = libraries;
    currentID = "libraries-layer";
    buildLocationList(currentFeature);

    geocoder.on("result", (event) => {
      // const sourceName = currentFeature;
      // map.getSource(sourceName).setData(event.result.geometry);
      const searchResult = event.result.geometry;
      const options = { units: 'miles' };

      // const currentLayer = map.getLayer(currentFeature);
      // let currentFeatures = map.querySourceFeatures(sourceName)
      for (const feature of currentFeature.features) {
        feature.properties.distance = turf.distance(
        searchResult,
        feature.geometry,
        options
        );
      }
      currentFeature.sort((a, b) => {
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
      // createPopUp(currentFeatures);
      // const activeListing = document.getElementById(
      //  `listing-${currentFeature[0].properties.id}`
      //  );
      //  activeListing.classList.add('active');
        // const bbox = getBbox(currentFeature, 0, searchResult);
        // map.fitBounds(bbox, {
        // padding: 100
        // });
    });
  });
   
  //radio buttons to toggle layer visibility/use
  const radio1 = document.getElementById("layer-choice-1");
  radio1.addEventListener('click', () => {
    toggleLayerVisibility();
    currentFeature = elementary;
    currentID = "elementary-layer";
    const listings = document.getElementById('listings');
      while (listings.firstChild) {
      listings.removeChild(listings.firstChild);
    }
    buildLocationList(elementary);
    toggleLayerVisibility();
  });

  const radio2 = document.getElementById("layer-choice-2");
  radio2.addEventListener('click', () => {
    toggleLayerVisibility();
    currentFeature = middle;
    currentID = "middle-layer";
    const listings = document.getElementById('listings');
      while (listings.firstChild) {
      listings.removeChild(listings.firstChild);
    }
    buildLocationList(middle);
    toggleLayerVisibility();
  });

  const radio3 = document.getElementById("layer-choice-3");
  radio3.addEventListener('click', () => {
    toggleLayerVisibility();
    currentFeature = high;
    currentID = "high-layer";
    const listings = document.getElementById('listings');
      while (listings.firstChild) {
      listings.removeChild(listings.firstChild);
    }
    buildLocationList(high);
    toggleLayerVisibility();
  });

  const radio4 = document.getElementById("layer-choice-4");
  radio4.addEventListener('click', () => {
    toggleLayerVisibility();
    currentFeature = libraries;
    currentID = "libraries-layer";
    const listings = document.getElementById('listings');
      while (listings.firstChild) {
      listings.removeChild(listings.firstChild);
    }
    buildLocationList(libraries);
    toggleLayerVisibility();
  });
}

geojsonFetch();

function buildLocationList(currentFeature) {
  // const sourceName = currentFeature;
  // let currentFeatures = map.querySourceFeatures(sourceName);
  for (const cLayer of currentFeature.features) {

      /* Add a new listing section to the sidebar. */
      const listings = document.getElementById('listings');
      const listing = listings.appendChild(document.createElement('div'));

      /* Assign a unique `id` to the listing. */
      listing.id = `listing-${cLayer.properties.id}`;

      /* Assign the `item` class to each listing for styling. */
      listing.className = 'item';
      
      /* Add the link to the individual listing created above. */
      const link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.id = `link-${cLayer.properties.id}`;
      link.innerHTML = `${cLayer.properties.Name}`;
      
      /* Add details to the individual listing. */
      const details = listing.appendChild(document.createElement('div'));
      details.innerHTML = `${cLayer.properties.Address}`;
      if (cLayer.properties.Phone) {
          details.innerHTML += ` &middot; ${cLayer.properties.Phone}`;
      }
      if (cLayer.properties.distance) {
          const roundedDistance =
          Math.round(cLayer.properties.distance * 100) / 100;
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
        // const sourceName = currentFeature.substring(0, currentFeature.length - 6);
        // let currentFeatures = map.querySourceFeatures(sourceName);
        for (const feature of currentFeature.features) {
          console.log(feature);
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

function toggleLayerVisibility() {
  const visibility = map.getLayoutProperty(currentID, 'visibility');
  if (visibility === 'visible') {
    map.setLayoutProperty(currentID, 'visibility', 'none');
  } else {
    map.setLayoutProperty(currentID, 'visibility', 'visible');
  }
}

function flyToSchool(currentFeature) {
  map.flyTo({
  center: currentFeature.geometry.coordinates,
  zoom: 15
  });
}

function createPopUp(currentFeatures) {
  const popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();
  const popup = new mapboxgl.Popup({ closeOnClick: false })
  .setLngLat(currentFeature["_geometry"].coordinates)
  .setHTML(`<h4>${currentFeature.properties.Address}</h4>`)
  .addTo(map);
}