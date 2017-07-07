// Create an array of object which includes U of T buildings location info
// Recommend to use a database and serve the info to the site. For details, go to Lesson 7 - Window Shopping Part1
var Model =
[
  {
    title: '(BA) Bahen Center',
    location: {lat: 43.659575, lng: -79.397373 },
    address_street:'40 St. George Street',
    address_city:'Toronto, ON, Canada',
    address_postal:'M5S 2E4'
  },
  {
    title: '(KS) Koffler Student Centre',
    location: {lat:  43.659025, lng: -79.396859},
    address_street:'214 College Street',
    address_city:'Toronto, ON, Canada',
    address_postal:'M5T 2Z9'
  },
  {
    title: '(SM) Gerstein Science Information Centre',
    location: {lat: 43.662195, lng: -79.393965},
    address_street:"7 and 9 King's College Circle",
    address_city:'Toronto, ON, Canada',
    address_postal:'M5S 3K1'
  },
  {
    title: '(CH) Convocation Hall',
    location: {lat: 43.661016, lng: -79.395289},
    address_street:"31 King's College Circle",
    address_city:'Toronto, ON, Canada',
    address_postal:'M5S 1A1'
  },
  {
    title: '(RB) Robarts Library',
    location: {lat: 43.664491, lng: -79.399434},
    address_street:'120 St. George Street',
    address_city:'Toronto, ON, Canada',
    address_postal:'M5S 1A5'
  },
  {
    title: '(VA) Varsity Arena',
    location: {lat: 43.666955, lng: -79.396206},
    address_street:'299 Bloor Street West',
    address_city:'Toronto, ON, Canada',
    address_postal:'M5S 1W2'
  }
];

// Map initialization
var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Create the style array, mapstyle available at https://snazzymaps.com/style/47/nature
  var styledMapType = new google.maps.StyledMapType(
  [
      {
          "featureType": "landscape",
          "stylers": [
              {
                  "hue": "#FFA800"
              },
              {
                  "saturation": 0
              },
              {
                  "lightness": 0
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "road.highway",
          "stylers": [
              {
                  "hue": "#53FF00"
              },
              {
                  "saturation": -73
              },
              {
                  "lightness": 40
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "stylers": [
              {
                  "hue": "#FBFF00"
              },
              {
                  "saturation": 0
              },
              {
                  "lightness": 0
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "road.local",
          "stylers": [
              {
                  "hue": "#00FFFD"
              },
              {
                  "saturation": 0
              },
              {
                  "lightness": 30
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "water",
          "stylers": [
              {
                  "hue": "#00BFFF"
              },
              {
                  "saturation": 6
              },
              {
                  "lightness": 8
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "poi",
          "stylers": [
              {
                  "hue": "#679714"
              },
              {
                  "saturation": 33.4
              },
              {
                  "lightness": -25.4
              },
              {
                  "gamma": 1
              }
          ]
      }
  ],
  {name: "Styled Map"});

  // Constructor creates a new map - only center and zoom are required.
  // Create a map instance, need to specify where to put the map and which part of the world to show
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 43.6629, lng: -79.3957},
    zoom: 15, // How much detail need to show, maximum 21
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
              'styled_map']
    }
  });

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');
  ko.applyBindings(new ViewModel());
}

var Building = function(data){
  var self = this;
  self.title = ko.observable(data.title);
  self.location = ko.observable(data.location);
  self.address_street = ko.observable(data.address_street);
  self.address_city = ko.observable(data.address_city);
  self.address_postal = ko.observable(data.address_postal)
}

//View Model
var ViewModel = function() {
  var self = this;
  self.buildingList = ko.observableArray([]);
  Model.forEach(function(item){
    self.buildingList.push(new Building(item));
  });

  // Set the current location by clicking list
	self.currentBuilding = ko.observable(self.buildingList()[0]);

	self.setBuilding = function(clickedBuilding) {
    var bounds = new google.maps.LatLngBounds();
		self.currentBuilding(clickedBuilding);
    for (var i = 0; i < markers.length; i++) {
			if (clickedBuilding.title() == markers[i].title) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
				populateInfoWindow(markers[i], largeInfowindow);
			}
      else{
        markers[i].setMap(null);
      }
		}
	};

  // Filtering functions
  self.userInput = ko.observable('');

  self.filterMarker = ko.computed(function() {
    var result = self.userInput().toLowerCase();
    for (var i = 0; i < self.buildingList().length; i++) {
      if (self.buildingList()[i].title().toLowerCase().indexOf(result) > -1) {
        for (var j = 0; j < markers.length; j++) {
          if (self.buildingList()[i].title() == markers[j].title) {
            markers[j].setMap(map);
          }
        }
      }else {
        for (var k = 0; k < markers.length; k++) {
          if (self.buildingList()[i].title() == markers[k].title) {
					  markers[k].setMap(null);
         }
       }
     }
   }
   if (!result){
     for (var k = 0; k < markers.length; k++) {
        markers[k].setMap(map);
      }
      return self.buildingList();
   } else {
     return ko.utils.arrayFilter(self.buildingList(), function(item) {
       return item.title().toLowerCase().indexOf(result) > -1;
 			});
		}
 });

  var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < Model.length; i++) {
    // Get the position from the location array.
    var position = Model[i].location;
    var title = Model[i].title;
    var address_street = Model[i].address_street;
    var address_city = Model[i].address_city;
    var address_postal =Model[i].address_postal;
    // Create a marker per location, and put into markers array.
     var marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      address_street: address_street,
      address_city: address_city,
      address_postal: address_postal,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    // Push the marker to our array of markers.
    markers.push(marker);

    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    //Set marker animation when mouse points on marker
    marker.addListener('mouseover',function() {
      this.setIcon(highlightedIcon);
      if (this.getAnimation() !== null) {
        this.setAnimation(null);
      } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
      }
    });

    //Stop animation when mouse moves away from marker
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
      if (this.getAnimation() !== null) {
        this.setAnimation(null);
      }
    });
  }

  // Event listener for show listing, click the show-listing button to call showListing function
  document.getElementById('show-listings').addEventListener('click', showListings);

  // Event listener for hide listing, click the hide-listing button to call hideListing function
  document.getElementById('hide-listings').addEventListener('click', function() {
    hideListings(markers);
  });

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  // Function that makes a marker bounce once only
  function markerBounce(marker) {
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				marker.setAnimation(null);
			}, 700);
		}
	}

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        console.log("markerclosed");
        infowindow.marker = null;
      });

      // Wikipedia api implementaiton
      var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+ marker.title.substr(5) + '&format=json&callback=wikiCallback';

      var wikiRequestTimeOut = setTimeout(function() {
				infowindow.setContent('<div>Failed to get a response from Wikipedia</div>');
				infowindow.open(map, marker);
			}, 5000);

      $.ajax({
      		url: wikiUrl,
      		dataType: 'jsonp',
          success: function(response){
            //console.log(response);
  			    var link = response[3];
  					if (link.length == 0) {
  					  link = "Not available";
  					}
            // Create a new streetview object, get image based on closest location to marker
            var streetViewService = new google.maps.StreetViewService();
            // Within radius of 50 meters of marker
            var radius = 50;
            // In case the status is OK, which means the pano was found, compute the
            // position of the streetview image, then calculate the heading, then get a
            // panorama from that and set the options
            function getStreetView(data, status) {
              if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                  nearStreetViewLocation, marker.position);
                console.log(marker.address_city);
                if (link === "Not available"){
                  infowindow.setContent('<div style="font-weight: bold;">' + marker.title.substr(5) + '</div>' +
                                        '<div style="font-style: italic;">' + marker.address_street + '</br>' + marker.address_city + '</br>' + marker.address_postal + '</div>' +
                                        '<div style="font-style: italic;">Building Info: ' + link + '</div>' + '<div id="pano"></div>');
                }else{
                  infowindow.setContent('<div style="font-weight: bold;">' + marker.title.substr(5) + '</div>' +
                                        '<div style="font-style: italic;">' + marker.address_street + '</br>' + marker.address_city + '</br>' + marker.address_postal + '</div>' +
                                        '<div style="font-style: italic;">Building Info: ' + '<a href="'+ link +'" target="_blank">' + "Click here" + '</a>' + '</div>' + '<div id="pano"></div>');
                }

                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 15
                  }
                };
                var panorama = new google.maps.StreetViewPanorama(
                  document.getElementById('pano'), panoramaOptions);
              } else {
                infowindow.setContent('<div>Name: ' + marker.title.substr(5) + '</div>' + '<div>Building Info: ' + '<a href="'+ link +'"target="_blank">' + "Click here" + '</a>' + '</div>' +
                  '<div>No Street View Found</div>');
              }
            }
            // Use streetview service to get the closest streetview image within
            // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            // Open the infowindow on the correct marker.
            markerBounce(marker);
            infowindow.open(map, marker);
            // Clear error handling timer
            clearTimeout(wikiRequestTimeOut);
          }
        });
      }
    }

  // This function will loop through the markers array and display them all.
  function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
    if (map.getZoom() > 15) {
    map.setZoom(15);
    }
  }

  // This function will loop through the listings and hide them all.
  function hideListings() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }
};
