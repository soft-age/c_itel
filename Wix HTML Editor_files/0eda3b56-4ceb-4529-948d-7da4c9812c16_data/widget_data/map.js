var markersArray = new Array();
var markersDictionary = new Array();
var circlesArray = new Array();
var circlesDictionary = new Array();
var infoWindowOpen = null;
var geolocationString = null;
var globalMap;
var defaultLat;
var defaultLng;
var popupShown = 0;
var defaultZoom;
var initialMapCenter = null;
var borderWidthUpdatedFlag = 0; 
var insideSettings = false;
var insideWidget = false;
var timeoutIdMap = null;
var timeoutIdSatellite = null;
var viewMode = null;
var jsIconsArray = null;
var dummyPassword = null;

function setCookie(c_name,value,exdays)
{
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
}

function sniffHandheld()
{
  if((/iPhone|iPod|iPad|Android|BlackBerry/i).test(navigator.userAgent)) 
  {
    return true;
  }
  
  return false
}

function syncMarkerImage(icon, marker)
{
  if ((isNaN(icon) || (jsIconsArray[icon] && jsIconsArray[icon].premium == "1")) && jQuery("#premiumBool").val() == "false")
  {
    icon = 1;
  }
  
  if (icon != 1)
  {
    if (!isNaN(icon))
    {
      var markerIcon = jsIconsArray[icon].path;
      if (jsIconsArray[icon].auto_center != 1)
      {
        var image = markerIcon;
        
        var newImg = new Image();
        newImg.assocMarker = marker;
        newImg.onload = function() {
          var height = newImg.height;
          var width = newImg.width;            
          var hWidth = width / 2;
          var hHeight = height / 2;
          var markerImage = new google.maps.MarkerImage(newImg.src,
            null,
            new google.maps.Point(0, 0),
            new google.maps.Point(hWidth, hHeight),
            new google.maps.Size(width, height));
          
          newImg.assocMarker.setIcon(markerImage);
        }
        
        newImg.src = image;           
      }
      else
      {
        marker.setIcon(markerIcon);
      }
    }
    else
    {
      var image = icon;
      
      var newImg = new Image();
      newImg.assocMarker = marker;
      newImg.onload = function() {
        var image = icon;
        var height = newImg.height;
        var width = newImg.width;
        var widthHeightRatio = width / height;
        if (height > width)
        {
          height = 45;
          width = widthHeightRatio * height;
        }
        else
        {
          width = 45;
          height = width / widthHeightRatio;
        }
        
        var hWidth = width / 2;
        var hHeight = height / 2;
        var markerImage = new google.maps.MarkerImage(image,
          null,
          new google.maps.Point(0, 0),
          new google.maps.Point(hWidth, hHeight),
          new google.maps.Size(width, height));
        
        newImg.assocMarker.setIcon(markerImage);
      }
      
      newImg.src = image; 
    }    
  }
  else
  {
    marker.setIcon(null);
  }
}

function getCookie(c_name)
{
  var c_value = document.cookie;
  var c_start = c_value.indexOf(" " + c_name + "=");
  if (c_start == -1)
  {
    c_start = c_value.indexOf(c_name + "=");
  }
  if (c_start == -1)
  {
    c_value = null;
  }
  else
  {
    c_start = c_value.indexOf("=", c_start) + 1;
    var c_end = c_value.indexOf(";", c_start);
    if (c_end == -1)
    {
      c_end = c_value.length;
    }
    c_value = unescape(c_value.substring(c_start,c_end));
  }
  
  return c_value;
}


function adjustSearchBarWidth()
{
  var mapWidth = jQuery("#map-canvas").width();
  jQuery(".search-bar-combobox.ui-autocomplete-input").width(mapWidth - 227);
}

function displayEditMarkerHint()
{
  if (jQuery("#markerEditHint").length && popupShown < 2)
  {
    var position = jQuery("#map-canvas").offset();
    var mapWidth = jQuery("#map-canvas").width();
    var mapHeight = jQuery("#map-canvas").height();
    var hintWidth = jQuery("#markerEditHint").width();
    var hintHeight = jQuery("#markerEditHint").height();
    
    position.left += (mapWidth / 2) - (hintWidth / 2);;
    position.top += mapHeight - 2 * hintHeight;
    
    jQuery("#markerEditHint").css(position);
    jQuery("#markerEditHint").stop();
    jQuery("#markerEditHint").hide();
    jQuery("#markerEditHint").fadeTo(1500, 0.7, function() {
      setTimeout(function() {
        jQuery("#markerEditHint").fadeOut(3000);
      }, 2000);
    });  
  }
}


function refreshSearchControl(stop)
{
  stop = typeof stop !== 'undefined' ? stop : false;

  if (stop == false)
  {
    jQuery("#search_bar").show(); 
  }
  
  if (stop == true)
  {
    jQuery("#search_bar").hide();
  }
  
  adjustSearchBarWidth();
}

function createMap(centerLat, centerLng, mapZoom, mapType, userPerms)
{
  mapZoom = typeof mapZoom !== 'undefined' ? mapZoom : 16;
  mapType = typeof mapType !== 'undefined' ? mapType : null;
  userPerms = typeof userPerms !== 'undefined' ? userPerms : null;
  var missingLatLongFlag = false;
  
  if (!centerLat || !centerLng)
  {
    missingLatLongFlag = true;
    centerLat = 37.77493;
    centerLng = -122.419415;
  }
  
  if (!mapType)
  {
    mapType = 'roadmap';
  }
  
  if (userPerms || userPerms == "")
  {
    var map_type_user = false;
    var zoom_options_user = false;
    var navigation_control_user = false;
    var street_view_control_user = false;
    var map_dragging_user = false;
  
    if (userPerms.indexOf("map_type_user") != -1)
    {
      map_type_user = true;
    }
    if (userPerms.indexOf("zoom_options_user") != -1)
    {
      zoom_options_user = true;
    }
    if (userPerms.indexOf("navigation_control_user") != -1)
    {
      navigation_control_user = true;
    }
    if (userPerms.indexOf("street_view_control_user") != -1)
    {
      street_view_control_user = true;
    }
    if (userPerms.indexOf("map_dragging_user") != -1)
    {
      map_dragging_user = true;
    }
    
    initialMapCenter = new google.maps.LatLng(centerLat, centerLng);
    
    if (sniffHandheld() == true)
    {
      navigation_control_user = false;
      zoom_options_user = false;
    }
    
    var mapOptions = {
        center: initialMapCenter,
        zoom: mapZoom,
        mapTypeId: mapType,
        draggable: map_dragging_user,
        streetViewControl: street_view_control_user,
        zoomControl: zoom_options_user,
        mapTypeControl: map_type_user,
        panControl: navigation_control_user
    };
  }
  else
  {
    initialMapCenter = new google.maps.LatLng(centerLat, centerLng);

    if (userPerms == null)
    {
      var navigation_control_user = true;
      var zoom_options_user = true;

      if (sniffHandheld() == true)
      {
        navigation_control_user = false;
        zoom_options_user = false;
      }
      
      var mapOptions = {
          center: initialMapCenter,
          zoom: mapZoom,
          mapTypeId: mapType,
          zoomControl: navigation_control_user,
          panControl: zoom_options_user
      };
    }
  }
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  var mapPanorama = map.getStreetView();
  
  var panoramaOptions = {
      zoomControl: false
  };
  
  mapPanorama.setOptions(panoramaOptions);
  map.setStreetView(mapPanorama);
  
  globalMap = map;

  return map;
}
function updateMarkerRadiusAndLocation(id)
{
  if (!markersDictionary[id])
  {
    return; 
  }

  var originalCompId = jQuery("#origCompId").val();
  var rawInstance = jQuery("#rawInstance").val();

  
  var latitude = markersDictionary[id].getPosition().lat();
  var longitude = markersDictionary[id].getPosition().lng();
  
  radius = null;
  if (circlesDictionary[id])
  {
    radius = circlesDictionary[id].getRadius(); 
  }
  
  $.ajax({
    type: "POST",
    url: "updateSettings.php",
    data: {
      'method': 'updateMarkerRadiusAndLocation',
      'passwd': dummyPassword,
      'instance': rawInstance,
      'origCompId': originalCompId,
      'markerId': id,
      'radiusSize': radius,
      'lat': latitude,
      'lng': longitude
    }
  }).done(function(response) {
    var responseArray = jQuery.parseJSON(response);
    if (!isNaN(responseArray.radius) && jQuery.trim(responseArray.radius) != "")
    {
      var markerCircle = circlesDictionary[responseArray.id];
      removeCircleRadiusChangedListener(markerCircle);
      markerCircle.setRadius(parseFloat(responseArray.radius));
      addCircleRadiusChangedListener(markerCircle);
    }

    Wix.Settings.refreshApp();
  });

}

function addCircleRadiusChangedListener(markerCircle)
{
  google.maps.event.addListener(markerCircle, "radius_changed", function() {
    displayEditMarkerHint();
    updateMarkerRadiusAndLocation(markerCircle.markerId);
  });
}

function removeCircleRadiusChangedListener(markerCircle)
{
  google.maps.event.clearListeners(markerCircle, 'radius_changed');
}

function createCircle(marker)
{
  marker.radiusSize = parseFloat(marker.radiusSize);
  
  if (isNaN(marker.radiusSize))
  {
    marker.radiusSize = 0;
  }
  
  var circleOptions = {
    strokeColor: "#FF0000",
    draggable: false,
    strokeOpacity: 0.8,
    strokeWeight: 0,
    fillColor: "#" + marker.radiusColor,
    fillOpacity: marker.radiusOpacity,
    visible: true,
    map: globalMap,
    center: marker.getPosition(),
    radius: marker.radiusSize,
    markerId: marker.rowId,
    clickable: false
  };
  
  var markerCircle = new google.maps.Circle(circleOptions);
  addCircleRadiusChangedListener(markerCircle);
  
  google.maps.event.addListener(markerCircle, "center_changed", function() {
    var centerPosition = markerCircle.getCenter();

    var associatedMarker = markersDictionary[markerCircle.markerId];
    associatedMarker.setPosition(centerPosition);
    
    updateMarkerRadiusAndLocation(markerCircle.markerId);
    
    var mapCenter = globalMap.getCenter();
    updateViewport(mapCenter.lat().toFixed(8), mapCenter.lng().toFixed(8), globalMap.getZoom());
  });
  
  
  circlesArray.push(markerCircle);
  circlesDictionary[marker.rowId] = markerCircle;
  
}

function addMarker(map, optionsArray)
{
  if (typeof optionsArray['bubbleBool'] == 'undefined') 
  {
    optionsArray['bubbleBool'] = 1;
  }

  if (typeof optionsArray['radiusBool'] == 'undefined') 
  {
    optionsArray['radiusBool'] = 0;
  }
  
  if (typeof optionsArray['radius'] == 'undefined') 
  {
    optionsArray['radius'] = 500;
  }
  
  if (typeof optionsArray['color'] == 'undefined') 
  {
    optionsArray['color'] = "5a0514";
  }

  if (typeof optionsArray['opacity'] == 'undefined') 
  {
    optionsArray['opacity'] = "0.1";
  }
  
  if (typeof optionsArray['icon'] == 'undefined') 
  {
    optionsArray['icon'] = null;
  }
  
  var latLngPos = new google.maps.LatLng(optionsArray['markerLat'], optionsArray['markerLng']);
  
  var marker = new google.maps.Marker({
    position: latLngPos,
    map: map,
    rowId: optionsArray['id'],
    bubbleBool: optionsArray['bubbleBool'],
    bubbleHtml: optionsArray['bubbleHtml'],
    radiusColor: optionsArray['color'],
    radiusOpacity: optionsArray['opacity'],
    radiusSize: optionsArray['radius'],
    radiusBool: optionsArray['radiusBool']
  });

  if ((jQuery("#reduceFeatures").length == 0 || jQuery("#reduceFeatures").val() == "false") && optionsArray['radiusBool'] == 1)
  {
    createCircle(marker);
  }
  
  markersArray.push(marker);  
  markersDictionary[marker.rowId] = marker;

  syncMarkerImage(optionsArray['icon'], marker);
  
  return marker;
}

function askForLocation()
{
  if (navigator.geolocation)
  {
    var options = {
      timeout: 8000
    };

    navigator.geolocation.getCurrentPosition(showPosition, errorFunction, options);
  }
  else
  {
    geolocationString = "ERR";
    $("#geolocationNotSupportedError").dialog({
      resizable: false,
      height:165,
      width:350,
      modal: true,
      dialogClass: 'alertPosition',
      buttons: {
        "Close": function() {
          $(this).dialog("close");
        }
      }
    });
  }
}
function errorFunction(err)
{
  geolocationString = "ERR";
  if (err.code == 1)
  {
    $("#geolocationPermissionDenied").dialog({
      resizable: false,
      height:165,
      width:350,
      modal: true,
      dialogClass: 'alertPosition',
      buttons: {
        "Close": function() {
          $(this).dialog("close");
        }
      }
    });
  }
  if (err.code == 2)
  {
    $("#geolocationPositionUnavailable").dialog({
      resizable: false,
      height:165,
      width:350,
      modal: true,
      dialogClass: 'alertPosition',
      buttons: {
        "Close": function() {
          $(this).dialog("close");
        }
      }
    });
  }
  if (err.code == 3)
  {
    $("#geolocationTimeout").dialog({
      resizable: false,
      height:165,
      width:350,
      modal: true,
      dialogClass: 'alertPosition',
      buttons: {
        "Close": function() {
          $(this).dialog("close");
        }
      }
    });
  }
}
function showPosition(position)
{
  var latlong = position.coords.latitude + "," + position.coords.longitude;
  geolocationString = latlong;
  
  var newCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  globalMap.setCenter(newCenter);
  globalMap.setZoom(17);
}

function updateControlsBasedOnMapInteraction(latControl, lngControl, zoomControl)
{
  google.maps.event.addListener(globalMap, 'zoom_changed', function() {
    var mapCenter = globalMap.getCenter();
    updateViewport(mapCenter.lat().toFixed(8), mapCenter.lng().toFixed(8), globalMap.getZoom());
  });
  google.maps.event.addListener(globalMap, 'dragend', function() {
    var mapCenter = globalMap.getCenter();
    updateViewport(mapCenter.lat().toFixed(8), mapCenter.lng().toFixed(8), globalMap.getZoom());
  });
}

function addListenerForAddressSearch()
{
  var inputBox = document.getElementById('queryAddress');
  var autocomplete = new google.maps.places.Autocomplete(inputBox);

  autocomplete.bindTo('bounds', globalMap);
  $("#findButton").click(function() {
    var queryAddress = $("#queryAddress").val();
    if ($.trim(queryAddress) != "")
    {
      var request = {
          query:  queryAddress
        };
      service = new google.maps.places.PlacesService(globalMap);
      service.textSearch(request, findAddressCallback);
    }
  });
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    $("#findButton").trigger("click");
  });
  
  $("#myLocationButton").click(function() {
    // Do we have user location information?
    var latLongString = geolocationString;
    if (latLongString == null|| latLongString == "ERR")
    {    
      // Expire the existing value and ask again. 
      geolocationString = null;
      askForLocation();
      
      setTimeout(function() {
        // After 3 seconds check that we have user interaction.
        var latLongString = geolocationString;
        var imgSrc = "test";
        
        if($.browser.chrome) 
        {
          imgSrc = 'img/share_loc_chrome.png';
          width = 576;
          height = 35;
        } 
        if ($.browser.mozilla) 
        {
          imgSrc = 'img/share_loc_ff.png';
          width = 404;
          height = 130;
        } 
        if ($.browser.msie) 
        {
          imgSrc = 'img/share_loc_ie.png';
          width = 576;
          height = 40;
        }
        if ($.browser.safari)
        {
          imgSrc = 'img/share_loc_safari.png';
          width = 481;
          height = 183;
        }

        jQuery("#share_loc_image").attr("src", imgSrc);
        jQuery("#share_loc_image").attr("width", width + "px");
        jQuery("#share_loc_image").attr("height", height + "px");
        
        var dialogHeight = jQuery("#geolocationUserTimeout").height() + 110;
        if (!latLongString)
        {
          $("#geolocationUserTimeout").dialog({
            resizable: false,
            height:dialogHeight,
            width:600,
            modal: true,
            dialogClass: 'alertPositionForLocationSharing',
            buttons: {
              "Close": function() {
                $(this).dialog("close");
              }
            }
          });
        }
      }, 3000);
    }
    else
    {
      var latLongArray = latLongString.split(",");
      
      var newCenter = new google.maps.LatLng(latLongArray[0], latLongArray[1]);
      globalMap.setCenter(newCenter);
      globalMap.setZoom(17);
    }
  });
}

function countVisibleMarkers()
{
  var noMarkers = 0;
  for (var i = 0; i < markersArray.length; i++)
  {
    if (markersArray[i].getMap() != null)
    {
      noMarkers++;
    }
  }
  
  return noMarkers;
}

function addMarkerWithValidation(lat, lng)
{
  displayEditMarkerHint();
  var markersArrayNo = countVisibleMarkers();
  if (markersArrayNo >= 1 && jQuery("#premiumBool").val() == "false")
  {
    var localUpgrade = jQuery("#localUpgradeButton").val();
    var localClose = jQuery("#localCloseButton").val();
    
    var buttonsArray = {
    };
    
    buttonsArray[localUpgrade] = function() {
      Wix.Settings.openBillingPage();
      $(this).dialog("close");
    };
    
    buttonsArray[localClose] = function() {
      $(this).dialog("close");
    };
      
    $("#dialogUpgradeApp").dialog({
      resizable: false,
      height:165,
      width:350,
      modal: true,
      dialogClass: 'alertPosition',
      buttons: buttonsArray
    });
  }
  else
  {
    var latitude = lat;
    var longitude = lng;
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();

    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'addMarker',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'latitude': latitude,
        'longitude': longitude
      }
    }).done(function(response) {
      var responseArray = $.parseJSON(response);
      var newM = addMarkerWrapper(responseArray);
      newM.setDraggable(true);
      panAndBubbleMarker(newM);

      Wix.Settings.refreshApp();
    }); 
  }
}

function findAddressCallback(results, status)
{
  if (status == google.maps.places.PlacesServiceStatus.OK) 
  {
    if (results.length > 0)
    {
      if (results[0].geometry.viewport)
      {
        globalMap.fitBounds(results[0].geometry.viewport);
      }
      else
      {
        globalMap.setCenter(results[0].geometry.location);
        globalMap.setZoom(17); 
      }
    }
    
    addMarkerWithValidation(results[0].geometry.location.lat(), results[0].geometry.location.lng());
  }
}