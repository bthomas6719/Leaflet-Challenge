let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

let faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

//----------------------------------------------------------------------------
// Calls function to render map
//----------------------------------------------------------------------------
renderMap(earthquakeURL, faultLinesURL);

//----------------------------------------------------------------------------
// Function to render map
//----------------------------------------------------------------------------
function renderMap(earthquakeURL, faultLinesURL) {

  // Performs GET request for the earthquake URL
  d3.json(earthquakeURL, function(data) {
    console.log(earthquakeURL)
    // Stores response into earthquakeData
    let earthquakeData = data;
    // Performs GET request for the fault lines URL
    d3.json(faultLinesURL, function(data) {
      // Stores response into faultLineData
      let faultLineData = data;

      // Passes data into createFeatures function
      createFeatures(earthquakeData, faultLineData);
    });
  });

  // Function to create features
  function createFeatures(earthquakeData, faultLineData) {

    // Defines two functions that are run once for each feature in earthquakeData
    // Creates markers for each earthquake and adds a popup describing the place, time, and magnitude of each
    function onEachQuakeLayer(feature, layer) {
      return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        fillOpacity: 1,
        color: chooseColor(feature.properties.mag),
        fillColor: chooseColor(feature.properties.mag),
        radius:  markerSize(feature.properties.mag)
      });
    }
    function onEachEarthquake(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }

    // Defines a function that is run once for each feature in faultLineData
    // Create fault lines
    function onEachFaultLine(feature, layer) {
      L.polyline(feature.geometry.coordinates);
    }

    // Creates a GeoJSON layer containing the features array of the earthquakeData object
    // Run the onEachEarthquake & onEachQuakeLayer functions once for each element in the array
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachEarthquake,
      pointToLayer: onEachQuakeLayer
    });

    // Creates a GeoJSON layer containing the features array of the faultLineData object
    // Run the onEachFaultLine function once for each element in the array
    let faultLines = L.geoJSON(faultLineData, {
      onEachFeature: onEachFaultLine,
      style: {
        weight: 2,
        color: 'blue'
      }
    });

    

    // Sends earthquakes, fault lines and timeline layers to the createMap function
    createMap(earthquakes, faultLines);
  }

  // Function to create map
  function createMap(earthquakes, faultLines) {
    // Define outdoors, satellite, and darkmap layers
    // Outdoors layer
    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={"sk.eyJ1IjoiYnRob21hczY3MTkiLCJhIjoiY2s4Nmk2MTA0MDZmZDNtbGpwdGg3cWw1bSJ9.iVGEGqetoGYQtDjB1o9g9g"}', {
        attribution: 'Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>',
        maxZoom: 13,
        id: 'mapbox.satellite',
        //accessToken: API_KEY
    });
    var grayscale = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={"sk.eyJ1IjoiYnRob21hczY3MTkiLCJhIjoiY2s4Nmk2MTA0MDZmZDNtbGpwdGg3cWw1bSJ9.iVGEGqetoGYQtDjB1o9g9g"}', {
        attribution: 'Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>',
        maxZoom: 13,
        id: 'mapbox.light',
        //accessToken: API_KEY
    });

    var outdoors = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={"sk.eyJ1IjoiYnRob21hczY3MTkiLCJhIjoiY2s4Nmk2MTA0MDZmZDNtbGpwdGg3cWw1bSJ9.iVGEGqetoGYQtDjB1o9g9g"}', {
        attribution: 'Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>',
        maxZoom: 13,
        id: 'mapbox.outdoors',
        //accessToken: API_KEY
    });
    var dark = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={"sk.eyJ1IjoiYnRob21hczY3MTkiLCJhIjoiY2s4Nmk2MTA0MDZmZDNtbGpwdGg3cWw1bSJ9.iVGEGqetoGYQtDjB1o9g9g"}', {
        attribution: 'Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>',
        maxZoom: 13,
        id: 'mapbox.dark',
        //accessToken: API_KEY
    });

    var baseLayers = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors,
        "Dark": dark       
    };


    // Create overlay object to hold overlay layers
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": faultLines
    };

    // Create map, default settings: outdoors and faultLines layers display on load
    let map = L.map("map", {
      center: [39.8283, -98.5785],
      zoom: 3,
      layers: [outdoors, faultLines, satellite, dark, grayscale],
      scrollWheelZoom: false
    });

    // Create a layer control
    // Pass in baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseLayers, overlayMaps, {
      collapsed: true
    }).addTo(map);

    // Adds Legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
      let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };
    legend.addTo(map);

    // Adds timeline and timeline controls
    
  }
}

//----------------------------------------------------------------------------
// chooseColor function:
// Returns color for each grade parameter using ternary expressions
//----------------------------------------------------------------------------
function chooseColor(magnitude) {
  return magnitude > 5 ? "red":
    magnitude > 4 ? "orange":
      magnitude > 3 ? "gold":
        magnitude > 2 ? "yellow":
          magnitude > 1 ? "yellowgreen":
            "greenyellow"; // <= 1 default
}

//----------------------------------------------------------------------------
// Function to amplify circle size by earthquake magnitude
//----------------------------------------------------------------------------
function markerSize(magnitude) {
  return magnitude * 5;
}