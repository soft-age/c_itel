function addAjaxLoadingBehavior()
{
  new imageLoader(cImageSrc, 'startAnimation()');
  $('#loaderImage')
  .hide()  // hide it initially
  .ajaxStart(function() {
    $(this).show();
  })
  .ajaxStop(function() {
      $(this).hide();
  });
}
function hidePopup()
{
  jQuery("#popup").slideUp(800);
}

function fillTemplateWithData(data)
{
  // Icon
  if (!isNaN(data.icon) ||  jQuery("#premiumBool").val() == "false")
  {
    if ((isNaN(data.icon) || jsIconsArray[data.icon].premium == "1") && jQuery("#premiumBool").val() == "false")
    {
      data.icon = 1;
    }
    
    jQuery("#icon_id_template").val(data.icon);
    jQuery("#icon_url_template").val("");
    jQuery(".markerIconContent .markerIconContentImage").css("background-image", "url('" + jsIconsArray[data.icon].path + "')");
    jQuery(".markerIconContent .markerIconContentText").html(jsIconsArray[data.icon].name);
  }
  else
  {
    jQuery("#icon_url_template").val(data.icon);
    jQuery("#icon_id_template").val("");
    jQuery(".markerIconContent .markerIconContentImage").css("background-image", "url('" + data.icon + "')");
    jQuery(".markerIconContent .markerIconContentText").html(jQuery("#localCustom").val());
  }
  
  // Bubble
  if (!data.bubbleHtml || data.bubbleHtml == "<p><br /></p>")
  {
    data.bubbleHtml = "";
  }  
  tinyMCE.get('bubbleText_template').setContent(data.bubbleHtml);

  
  // Radius
  jQuery("#color_picker_input_template").val(data.color);
  jQuery("#radius_input_template").val(data.radius);
  
  var radiusColor = "#" + data.color;
  jQuery(".colorPickerDiv .inner").css("background-color", radiusColor);
  var leftOffset = parseFloat(data.opacity) * 80 - 9.5;
  jQuery("#slider_template .knob").css("left", leftOffset); 

  if (data.radiusBool != 1)
  {
    jQuery("#radius_checkbox_template").removeClass("checked");
    jQuery("#radius_panel_template").hide();
  }
  else
  {
    jQuery("#radius_checkbox_template").addClass("checked");
    jQuery("#radius_panel_template").show();
  }  
}

function showPopup(marker)
{
  jQuery(".searchResult").first().parent().hide();
  window.scrollTo(0, 0);
  popupShown++;
  
  var rawInstance = jQuery("#rawInstance").val();
  var originalCompId = jQuery("#origCompId").val();

  $.ajax({
    type: "POST",
    url: "updateSettings.php",
    data: {
      'method': 'updateMarkerSettings',
      'passwd': dummyPassword,
      'instance': rawInstance,
      'origCompId': originalCompId,
      'markerId': marker.rowId,
      'fetchOnly': true
    }
  }).done(function(response) {
    jQuery("#popup").find("#current_marker_id_template").val(marker.rowId);
    
    var data = jQuery.parseJSON(response);
    fillTemplateWithData(data);
    jQuery("#markerSettingsAccordion .box .feature").show();
    jQuery("#popup").slideDown(1000);
  });
  
}
function updateBorderOptionsVisibility()
{
  if (jQuery('#checkbox_borders').hasClass("checked"))
  {
    jQuery("#border_color_table_row").hide();
    jQuery("#border_width_table_row").hide();
  }
  else
  {
    jQuery("#border_color_table_row").show();
    jQuery("#border_width_table_row").show();
  }
}
function updateBorderSettings()
{
  var rawInstance = jQuery("#rawInstance").val();
  var originalCompId = jQuery("#origCompId").val();

  var leftPx = jQuery("#border_width_slider").find("div.knob").css("left");
  leftPx = parseFloat(leftPx.replace("px","")) + 10;
  jQuery("#borderWidthInput").val(leftPx / 81);

  updateBorderOptionsVisibility();
  $.ajax({
    type: "POST",
    url: "updateSettings.php",
    data: {
      'method': 'updateBorderSettings',
      'passwd': dummyPassword,
      'instance': rawInstance,
      'origCompId': originalCompId,
      'border_color': "'" + jQuery("#color_picker_input_border").val() + "'",
      'border_width': jQuery("#borderWidthInput").val(),
      'border_shape': jQuery('#border_shape_select').find(":selected").val(),
      'no_border': jQuery('#checkbox_borders').hasClass("checked")
    }
  }).done(function() {
    Wix.Settings.refreshApp();
  });
}

function addBorderSettingsListeners()
{  
  jQuery("#checkbox_borders").click(function() {
    updateBorderSettings();
  });
  
  jQuery("#border_width_slider .knob").mousedown(function() {
    borderWidthUpdatedFlag = 1;
  });

  jQuery("body").mouseup(function() {
    if (borderWidthUpdatedFlag == 1)
    {
      updateBorderSettings(); 
      borderWidthUpdatedFlag = 0;
    }
  });
  jQuery("#border_shape_select").change(function() {
    updateBorderSettings();
  }); 
}
function escapeHtml(text) 
{
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function performMarkerUpdate(rawInstance, originalCompId)
{
  var noId = jQuery("#popup").find("#current_marker_id_template").val();
  if (!markersDictionary[noId])
  {
    return;
  }
  
  var bubbleHtml = tinyMCE.get('bubbleText_template').getContent();

  var icon = null;
  if ($('#icon_id_template').val() != "")
  {
    icon = $('#icon_id_template').val();
  }
  else
  {
    icon = $("#icon_url_template").val();
  }
  
  var radiusLength = jQuery("#radius_input_template").val();
  
  var leftPx = jQuery("#slider_template").find("div.knob").css("left");
  leftPx = parseFloat(leftPx.replace("px","")) + 10;
  jQuery('#opacity_input_template').val(leftPx / 81);
  var radiusOpacity =  jQuery('#opacity_input_template').val();

  var radiusColor = jQuery("#color_picker_input_template").val();
  var radiusBool = jQuery("#radius_checkbox_template").hasClass('checked');
  
  var upperPart = true;
  var options = {
      success:  markerSettingsUpdateOK,
      data: {
        'instance': rawInstance,
        'passwd': dummyPassword,
        'origCompId': originalCompId,
        'method': 'updateMarkerSettings',
        'markerId': noId,
        'bubbleHtml': bubbleHtml,
        'bubbleBool': upperPart,
        'icon': icon,
        'opacity': radiusOpacity,
        'color': radiusColor,
        'radiusBool': radiusBool
      }
  }; 
  jQuery("#marker_settings_form_template").ajaxSubmit(options); 
}
function updateViewport(centerLat, centerLng, mapZoom)
{
  if (!isNaN(centerLat) && !isNaN(centerLng) && !isNaN(mapZoom))
  {
    var originalCompId = jQuery("#origCompId").val();
    var rawInstance = jQuery("#rawInstance").val();
      
    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'viewportSettings',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'centerLatitude': centerLat,
        'centerLongitude': centerLng,
        'mapZoom': mapZoom
      }
    }).done(function() {
      jQuery("#compCoords").val("true");
      Wix.Settings.refreshApp();
    });
  }
}

function markerSettingsUpdateOK(response)
{
  var responseArray = jQuery.parseJSON(response);
  var updatedMarkerId = responseArray['markerId'];
  var updateMarker = markersDictionary[updatedMarkerId];
  
  hidePopup();
  updateMarker.bubbleHtml = responseArray['bubbleHtml'];
  updateMarker.bubbleBool = responseArray['bubbleBool'];
  updateMarker.radiusBool = responseArray['radiusBool'];
  updateMarker.radiusOpacity = responseArray['opacity'];
  updateMarker.radiusColor = responseArray['color'];
  
  if (infoWindowOpen != null)
  {
    infoWindowOpen.close();
    infoWindowOpen = null;
  }

  syncMarkerImage(responseArray['icon'], updateMarker);

  if (!updateMarker.radiusBool)
  {
    if (circlesDictionary[updateMarker.rowId])
    {
      circlesDictionary[updateMarker.rowId].setEditable(false);
      circlesDictionary[updateMarker.rowId].setVisible(false);
    }
  }
  else
  {
    if (!circlesDictionary[updateMarker.rowId])
    {
      createCircle(updateMarker);
    }
    
    var opts = {
        fillColor: "#" + responseArray['color'],
        fillOpacity: responseArray['opacity'],
    };
    circlesDictionary[updateMarker.rowId].setOptions(opts);

    circlesDictionary[updateMarker.rowId].setEditable(true);
    circlesDictionary[updateMarker.rowId].setVisible(true);
  }
  
  if (!updateMarker.bubbleBool)
  {
    removeMarkerLeftClickListener(updateMarker);
  }

  panAndBubbleMarker(updateMarker);
    
  Wix.Settings.refreshApp();
}
function convertSpecificTextareaToRTE(textareaId)
{
  var supportedCultures = jQuery("#supportedCultures").val();
  var supportedCulturesArray = supportedCultures.split(",");
  var wixLocale = jQuery("#wixLocale").val();
  
  if (supportedCulturesArray.indexOf(wixLocale) == -1)
  {
    wixLocale = 'en';
  }
  
  tinyMCE.init({
    selector: "textarea#bubbleText_" + textareaId,
    width: 520,
    theme : "advanced",
    apply_source_formatting : false,
    language: wixLocale,
    theme_advanced_resizing : false,
    plugins: "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,visualblocks",
    theme_advanced_buttons1_add: "fontselect,fontsizeselect",
    theme_advanced_buttons3_add : "forecolor,backcolor",
    setup : function(ed) {
      ed.onLoadContent.add(function(ed, o) {
        // Output the element name
        jQuery("#bubbleText_" + textareaId + "_styleselect").parent().hide();
      });
   }
  });  
  /*
   // tinymce V4
  tinymce.init({
    selector: "textarea#bubbleText_" + textareaId,
    width: 380,
    theme: "modern",
    plugins: [
         "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
         "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
         "save table contextmenu directionality emoticons template paste textcolor"
   ],
   menubar: false,
   statusbar: false,
   toolbar: "insertfile | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | forecolor backcolor"
  });*/
}
function convertDivToSlider(id)
{
  var opacityValue = parseFloat(jQuery("#opacity_input_" + id).val());
  if (!isNaN(opacityValue) && opacityValue >= 0 && opacityValue <= 1)
  {
    jQuery("#slider_" + id).Slider({ type: "Value", value: opacityValue}); 
  }
  else
  {
    $("#slider_" + id).Slider({ type: "Value", value: 0.1}); 
  }
}
function convertSpansToWixCheckboxes(id)
{
  // For marker radius.
  $('#radius_checkbox_' + id).each(function() {
    if ($(this).hasClass("dbCheck"))
    {
      $(this).Checkbox({ checked: true });
    }
    else
    {
      $(this).Checkbox();
    }      
  });
  
  // For map borders.
  $('#checkbox_' + id).each(function() {
    if ($(this).hasClass("dbCheck"))
    {
      $(this).Checkbox({ checked: true });
    }
    else
    {
      $(this).Checkbox();
    }      
  });
  
  // Attach click listener for the radius checkbox.
  $('#radius_checkbox_' + id).click(function() {
    if ($('#radius_checkbox_' + id).hasClass('checked'))
    {
      jQuery("#radius_panel_" + id).show();
    }
    else
    {
      jQuery("#radius_panel_" + id).hide();
    }
  });
  
  // Attach click listener for the radius surrounding text.
  if (jQuery("#radius_checkbox_click_" + id).length)
  {
    jQuery("#radius_checkbox_click_" + id).click(function() {
      jQuery('#radius_checkbox_' + id).trigger("click");
    });
  }
}

function convertInputToColorPicker(id)
{
  $("#color_picker_" + id).each(function() {
      var color = "'#" + jQuery("#color_picker_input_" + id).val() + "'";
      $(this).ColorPicker({startWithColor : color});      
  });
}
function attachSaveButtonListener()
{
  $("#save_settings_button_template").click(function() { 
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();
    
    performMarkerUpdate(rawInstance, originalCompId);
  });
}

function map_recenter(latlng,offsetx,offsety) 
{
  var point1 = globalMap.getProjection().fromLatLngToPoint(
      (latlng instanceof google.maps.LatLng) ? latlng : globalMap.getCenter()
  );
  var point2 = new google.maps.Point(
      ( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, globalMap.getZoom()) ) || 0,
      ( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, globalMap.getZoom()) ) || 0
  );  
  
  var newCenter = globalMap.getProjection().fromPointToLatLng(new google.maps.Point(
    point1.x - point2.x,
    point1.y + point2.y
  ));
  
  var oldCenter = globalMap.getCenter();
  
  if (Math.abs(oldCenter.lat() - newCenter.lat()) > 0.000000001 || 
      Math.abs(oldCenter.lng() - newCenter.lng()) > 0.000000001)
  {
    globalMap.setCenter(globalMap.getProjection().fromPointToLatLng(new google.maps.Point(
        point1.x - point2.x,
        point1.y + point2.y
    )));
    
    google.maps.event.trigger(globalMap, 'dragend');
  }
}

function panAndBubbleMarker(newMarker, source)
{
  source = typeof source !== 'undefined' ? source : "click";
  var contentEmpty = false;
  
  var markerHTML = newMarker.bubbleHtml;
  if (markerHTML == '<p><br /></p>')
  {
    markerHTML = "";
  }
  
  var drivingDirectionsHTML = '<div id="ddircontainer">';
  
  drivingDirectionsHTML += '<img src="img/car_vehicle.png" width="25" height="25" />';
  
  if (sniffHandheld() == true)
  {
    if((/iPhone|iPod|iPad/i).test(navigator.userAgent)) 
    {
      drivingDirectionsHTML += '<div id="ddirdiv"><a id="drivingDirectionsLink" target="_blank" href="http://maps.apple.com/maps?saddr=&';
    }
    else
    {
      drivingDirectionsHTML += '<div id="ddirdiv"><a id="drivingDirectionsLink" target="_blank" href="https://maps.google.com/maps?saddr=&';
    }
  }
  else
  {
    drivingDirectionsHTML += '<div id="ddirdiv"><a id="drivingDirectionsLink" target="_blank" href="https://maps.google.com/maps?saddr=Current+Location&';
  }
  
  drivingDirectionsHTML += 'daddr=' + newMarker.getPosition().lat() + ',' + newMarker.getPosition().lng() +'">';
  drivingDirectionsHTML += '[' + jQuery("#drivingDirectionsKeyword").val() + ']</a></div>';
  drivingDirectionsHTML += '</div>';

  if ($("#driving_directions_check").length > 0)
  {
    if ($("#driving_directions_check").hasClass("checked"))
    {
      if (jQuery("#premiumBool").val() == "true")
      {
        markerHTML += drivingDirectionsHTML;
      }
    }
  }
  else
  {
    if (jQuery("#drivingDirections").val() == "true")
    {
      if (jQuery("#premiumBool").val() == "true")
      {
        markerHTML += drivingDirectionsHTML;
      }  
    }
  }
  
  var hasImage = false;
  var textWithoutTags = $('<div>' + markerHTML ? markerHTML : '' + '</div>').text();
  if (markerHTML.toLowerCase().indexOf("img") >= 0)
  {
    hasImage = true;  
  }
   
  
  if ($.trim(textWithoutTags) == "" && hasImage == false)
  {
    contentEmpty = true;
  }

  if (newMarker.bubbleBool == 1 && contentEmpty == false)
  {
    var contentString = '<div id="iwMarker' + newMarker.rowId + '" class="iwContent">' + markerHTML + '</div>';
    var infowindow = new google.maps.InfoWindow({
      content: contentString,
      markerId: newMarker.rowId,
      disableAutoPan: true
    });
    
    if (insideWidget == true || source == "search")
    {
      google.maps.event.addListenerOnce(infowindow, 'domready', function() {
        var minPxVal = Math.min(jQuery("#map-canvas").height() / 2 - 20, jQuery("#iwMarker" + newMarker.rowId).height() / 1.5 + 20);
        map_recenter(newMarker.getPosition(), 0, -minPxVal);
      });
    }
    
    google.maps.event.addListener(infowindow, 'closeclick', function() {
      infoWindowOpen = null;
    });
    
    if (infoWindowOpen != null)
    {
      infoWindowOpen.close();
    }
    
    var markerMap = newMarker.getMap();
    
    infowindow.open(markerMap, newMarker);
    infoWindowOpen = infowindow;
  }
  else
  {
    if (insideWidget == true || source == "search")
    {
      map_recenter(newMarker.getPosition(), 0, -20);
    }
    
    if (infoWindowOpen != null)
    {
      infoWindowOpen.close();
      infoWindowOpen = null;
    }
  }
  
}
function removeMarkerLeftClickListener(newMarker)
{
  if (infoWindowOpen != null)
  {
    if (infoWindowOpen.markerId == newMarker.rowId)
    {
      infoWindowOpen.close();
    }
  }
}
function addMarkerDoubleClickListener(marker)
{
  google.maps.event.addListener(marker, 'dblclick', function() {
    showPopup(marker);
  }); 

}
function handleMarkerRemoval(marker)
{
  if ($("#dialogConfirmDelete").length)
  {
    var localYes = jQuery("#localYesButton").val();
    var localCancel = jQuery("#localCancelButton").val();
    
    var buttonsArray = {
    };
    
    buttonsArray[localYes] = function() {
      hidePopup();
      var rawInstance = jQuery("#rawInstance").val();
      var originalCompId = jQuery("#origCompId").val();
      var rowId = marker.rowId;
      
      if (circlesDictionary[rowId])
      {
        circlesDictionary[rowId].setMap(null); 
        circlesDictionary[rowId] = null;
      }
      
      $.ajax({
        type: "POST",
        url: "updateSettings.php",
        data: {
          'method': 'removeMarker',
          'passwd': dummyPassword,
          'instance': rawInstance,
          'origCompId': originalCompId,
          'markerId': rowId
        }
      }).done(function() {
        Wix.Settings.refreshApp();
      });
      
      marker.setMap(null);
      $(this).dialog("close");
    };
    buttonsArray[localCancel] = function() {
      $(this).dialog("close");
    };
      
    $("#dialogConfirmDelete").dialog({
      resizable: false,
      height:165,
      width:350,
      modal: true,
      dialogClass: 'alertPosition',
      buttons: buttonsArray
    });
  }
}
function addMarkerLeftClickListener(newMarker)
{
  google.maps.event.addListener(newMarker, 'click', function() {
    panAndBubbleMarker(newMarker);
    displayEditMarkerHint();
  }); 
}

function addDraggableListener(marker)
{
  google.maps.event.addListener(marker, "dragend", function() {
    displayEditMarkerHint();

    if (circlesDictionary[marker.rowId])
    {
      var associatedCircle = circlesDictionary[marker.rowId];
      associatedCircle.setCenter(marker.getPosition());
      if (marker.radiusBool == 1)
      {
        associatedCircle.setVisible(true); 
      }
    }
    else
    {
      updateMarkerRadiusAndLocation(marker.rowId);
    }    
  });
  
  google.maps.event.addListener(marker, "dragstart", function() {
    var rowId = marker.rowId;
    var associatedCircle = circlesDictionary[rowId];
    if (associatedCircle)
    {
      associatedCircle.setVisible(false);
    }
  });
}
function addMarkerRightClickListener(marker)
{
  google.maps.event.addListener(marker, "rightclick", function() {
    handleMarkerRemoval(marker);
  });
}
function addMarkerWrapper(optionsArray)
{
  var newMarker = addMarker(globalMap, optionsArray);
  addMarkerLeftClickListener(newMarker);

  if (!insideWidget)
  {
    addMarkerRightClickListener(newMarker);
    addMarkerDoubleClickListener(newMarker);
    addDraggableListener(newMarker);
  }
  
  return newMarker;
}

function attachEventForMarkerRemoveButton(id)
{
  jQuery("#removeMarker_" + id).on("click", function() {

    if (markersDictionary[id].getMap() != null)
    {
      google.maps.event.trigger(markersDictionary[id], "rightclick"); 
    }
  });
}


function createSearchBar()
{  
  jQuery("#search_combobox").combobox();
  
  jQuery(".search-bar-combobox").keypress(function(e) {
    if(e.which == 13) {
      var toBePanned = jQuery(".searchResult").parent().find(".searchResult").first().find(".markerIdSearchBox").val();
      if (!isNaN(toBePanned))
      {
        panAndBubbleMarker(markersDictionary[toBePanned]);
        jQuery(".searchResult").first().parent().hide();
      }
      
      jQuery(".search-bar-combobox.ui-autocomplete-input").blur();
    }
  });
}


function handleMarkerIconsMenu()
{
  jQuery("#popup .markerIcon").click(function() {
    jQuery("#menu_container").toggle();
  }); 
}

function syncSearchBar()
{
  if (jQuery("#premiumBool").val() == "false")
  {
    refreshSearchControl(true);
  }
  else
  {
    if (jQuery("#enable_search_check").length > 0)
    {
      if (jQuery("#enable_search_check").hasClass("checked"))
      {
        refreshSearchControl();
      }
      else
      {
        refreshSearchControl(true);
      }
    }
    else
    {
      if (jQuery("#searchBar").val() == "true")
      {
        refreshSearchControl();
      }
      else
      {
        refreshSearchControl(true);
      }
    }
  }
}

function mapOptionsSettings()
{
  updateControlsBasedOnMapInteraction('lat', 'lng', 'zoom');

  jQuery("#map_type_ctrl_check").Checkbox({ checked: jQuery("#map_type_ctrl_check").hasClass("dbCheck") ? true : false });
  jQuery("#zoom_ctrl_check").Checkbox({ checked: jQuery("#zoom_ctrl_check").hasClass("dbCheck") ? true : false });
  jQuery("#nav_ctrl_check").Checkbox({ checked: jQuery("#nav_ctrl_check").hasClass("dbCheck") ? true : false });
  jQuery("#street_view_control_check").Checkbox({ checked: jQuery("#street_view_control_check").hasClass("dbCheck") ? true : false });
  jQuery("#drag_control_check").Checkbox({ checked: jQuery("#drag_control_check").hasClass("dbCheck") ? true : false });
  jQuery("#driving_directions_check").Checkbox({ checked: jQuery("#driving_directions_check").hasClass("dbCheck") ? true : false });
  jQuery("#enable_search_check").Checkbox({ checked: jQuery("#enable_search_check").hasClass("dbCheck") ? true : false });
  
  $("#map_type").change(function() {
    var mapTypeString = $(this).find("option:selected").attr("value");
    // globalMap.setMapTypeId(mapTypeString);
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();
    
    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'setMapType',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'mapTypeString': mapTypeString
      }
    }).done(function() {
      Wix.Settings.refreshApp();
    });
  });
  
  $("#map_type_ctrl_check").click(function(){
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();

    var value = 'no';
    if ($(this).hasClass('checked'))
    {
      /*var mapOptions = {
          mapTypeControl:true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT
        }
      };*/
      value = 'yes'
    }
    else
    {
      /*var mapOptions = {
          mapTypeControl:false        
      };*/
    }
    
    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'map_type_user',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'mapTypeControl': value
      }
    }).done(function() {
      // globalMap.setOptions(mapOptions);      
      Wix.Settings.refreshApp();
    });
  });
  
  $("#driving_directions_check").click(function(){
    if (jQuery("#premiumBool").val() == "false")
    {
      var localUpgrade = jQuery("#localUpgradeButton").val();
      var localClose = jQuery("#localCloseButton").val();
      
      var buttonsArray =  {
      };
      
      buttonsArray[localUpgrade] = function() {
        Wix.Settings.openBillingPage();
        $(this).dialog("close");
      };
      
      buttonsArray[localClose] = function() {
        $(this).dialog("close");
      };

      $("#dialogUpgradeAppDrivingDirections").dialog({
        resizable: false,
        height:165,
        width:350,
        modal: true,
        dialogClass: 'alertPosition',
        buttons: buttonsArray
      });
      jQuery("#driving_directions_check").removeClass("checked");
      return;
    }
    else
    {
      var rawInstance = jQuery("#rawInstance").val();
      var originalCompId = jQuery("#origCompId").val();

      var value = 'no';
      if ($(this).hasClass('checked'))
      {
        value = 'yes'
      }
      
      $.ajax({
        type: "POST",
        url: "updateSettings.php",
        data: {
          'method': 'driving_directions',
          'passwd': dummyPassword,
          'instance': rawInstance,
          'origCompId': originalCompId,
          'drivingDirections': value
        }
      }).done(function() {
        if (infoWindowOpen)
        {
          infoWindowOpen.close();
        }
        infoWindowOpen = null;
        Wix.Settings.refreshApp();
      });
    }

  });
  
  
  $("#enable_search_check").click(function(){
    if (jQuery("#premiumBool").val() == "false")
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
      
      $("#dialogUpgradeAppEnableSearch").dialog({
        resizable: false,
        height:165,
        width:350,
        modal: true,
        dialogClass: 'alertPosition',
        buttons: buttonsArray
      });
      jQuery("#enable_search_check").removeClass("checked");
      return;
    }
    else
    {
      var rawInstance = jQuery("#rawInstance").val();
      var originalCompId = jQuery("#origCompId").val();

      var value = 'no';
      if ($(this).hasClass('checked'))
      {
        value = 'yes'
      }
      
      $.ajax({
        type: "POST",
        url: "updateSettings.php",
        data: {
          'method': 'enable_search',
          'passwd': dummyPassword,
          'instance': rawInstance,
          'origCompId': originalCompId,
          'enableSearch': value
        }
      }).done(function() {
        syncSearchBar();
        Wix.Settings.refreshApp();
      });
    }

  });
  
  
  
  $("#zoom_ctrl_check").click(function(){
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();

    var value = 'no';
    if ($(this).hasClass('checked'))
    {
      var mapOptions = {
          zoomControl: true        
      };

      value = 'yes'
    }
    else
    {
      var mapOptions = {
          zoomControl: false        
      };
    }
    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'zoom_options_user',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'zoomControl': value
      }
    }).done(function() {
      // globalMap.setOptions(mapOptions);
      Wix.Settings.refreshApp();
    });
  });
  
  $("#nav_ctrl_check").click(function(){
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();
    
    var value = 'no';
    if ($(this).hasClass('checked'))
    {
      var mapOptions = {
          panControl: true        
      };
      value = 'yes'
    }
    else
    {
      var mapOptions = {
          panControl: false        
      };
    }

    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'navigation_control_user',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'navigationControl': value
      }
    }).done(function() {
      // globalMap.setOptions(mapOptions);
      Wix.Settings.refreshApp();
    });
  });
  
  $("#street_view_control_check").click(function(){
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();

    var value = 'no';
    if ($(this).hasClass('checked'))
    {
      var mapOptions = {
          streetViewControl:true        
      };
      value = 'yes'
    }
    else
    {
      var mapOptions = {
          streetViewControl:false        
      };
    }
    
    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'street_view_control_user',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'streetViewControl': value
      }
    }).done(function() {
      // globalMap.setOptions(mapOptions);
      Wix.Settings.refreshApp();
    });
  });
  
  $("#drag_control_check").click(function(){
    var rawInstance = jQuery("#rawInstance").val();
    var originalCompId = jQuery("#origCompId").val();
    
    var value = 'no';
    if ($(this).hasClass('checked'))
    {
      var mapOptions = {
          draggable: true        
      };
      value = 'yes'
    }
    else
    {
      var mapOptions = {
          draggable: false        
      };
    }

    $.ajax({
      type: "POST",
      url: "updateSettings.php",
      data: {
        'method': 'map_dragging_user',
        'passwd': dummyPassword,
        'instance': rawInstance,
        'origCompId': originalCompId,
        'draggingControl': value
      }
    }).done(function() {
      // globalMap.setOptions(mapOptions);
      Wix.Settings.refreshApp();
    });
  });
    
  var widthValue = parseFloat(jQuery("#borderWidthInput").val());
  if (!isNaN(widthValue) && widthValue >= 0 && widthValue <= 1)
  {
    jQuery("#border_width_slider").Slider({ type: "Value", value: widthValue}); 
  }
  else
  {
    jQuery("#border_width_slider").Slider({ type: "Value", value: 0.1}); 
  }
  
  convertSpansToWixCheckboxes('borders');
  convertInputToColorPicker('border');
  addBorderSettingsListeners();
  updateBorderOptionsVisibility();
  jQuery("#search_combobox").combobox();
}

function fitToMarkers(markers) {

  if (!markers || markers.length == 0) return;
  var bounds = new google.maps.LatLngBounds();

  // Create bounds from markers
  for( var index in markers ) {
    if (markers[index].getMap() != null)
    {
      var latlng = markers[index].getPosition();
      bounds.extend(latlng);
    }
  }

  // Don't zoom in too far on only one marker
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
     var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
     var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
     bounds.extend(extendPoint1);
     bounds.extend(extendPoint2);
  }

  globalMap.fitBounds(bounds);

  // Adjusting zoom here doesn't work :/

}

function refreshMapObjects()
{
  var markerCount = markersArray.length;
  
  for(var i = 0; i < markerCount; i++)
  {
    if (markersArray[i].getMap() != null)
    {
      markersArray[i].setDraggable(true);
      var associatedCircle = circlesDictionary[markersArray[i].rowId];
      if (associatedCircle.getMap() != null && markersArray[i].radiusBool == 1)
      {
        associatedCircle.setEditable(true);
      }
    }
  }
  
  if (infoWindowOpen != null)
  {
    infoWindowOpen.close();
    infoWindowOpen = null;
  }

  if (jQuery("#compCoords").val() == "true")
  {    
    var centerLatLng = new google.maps.LatLng(defaultLat, defaultLng);
    if (centerLatLng && !isNaN(defaultZoom))
    {
      mapZoom = parseInt(defaultZoom);
      globalMap.setCenter(centerLatLng);
      globalMap.setZoom(mapZoom);
    }
  }
  else
  {
    if (jQuery("#compCoords").val() == "false")
    {
      fitToMarkers(markersArray);
    }
  }

}

function createMarkerPanel()
{
  convertSpecificTextareaToRTE("template");
  convertInputToColorPicker("template");
  convertSpansToWixCheckboxes("template");
  convertDivToSlider("template");
  attachSaveButtonListener();
  attachDeleteButtonListener();

  // Create the menu(only one instance that will be used everwhere).
  jQuery("#menu").menu();

  // Close the menu upon mouseleave.
  $("#menu").mouseleave(function() {
    $("#menu_container").hide();
  });

  // Menu item selected event.
  $("#menu").on("menuselect", function( event, ui ) {
    // Is the selected item a category? If so, return.
    if (!ui.item.closest("ul").hasClass("menuSecondLevel"))
    {
      return;
    }

    jQuery("#menu_container").hide();
    
    // Not a premium user!!!
    if (jQuery("#premiumBool").val() == "false")
    {
      if (jsIconsArray[parseInt(ui.item.find("input.icon-id").val())].premium == "1")
      {
        var localUpgrade = jQuery("#localUpgradeButton").val();
        var localClose = jQuery("#localCloseButton").val();
        
        var buttonsArray =  {
        };
        
        buttonsArray[localUpgrade] = function() {
          Wix.Settings.openBillingPage();
          $(this).dialog("close");
        };
        
        buttonsArray[localClose] = function() {
          $(this).dialog("close");
        };

        $("#dialogPremiumImageSelected").dialog({
          resizable: false,
          height:165,
          width:350,
          modal: true,
          dialogClass: 'alertPosition',
          buttons: buttonsArray
        });
        return;
      }
    }
    
    var text = ui.item.text();
    var url = ui.item.find("span").css("background-image");
    var urlClean = url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    
    var markerId = jQuery(".markerIcon:visible").attr("id").replace("icon_", "");
    
    jQuery(".markerIcon .markerIconContent .markerIconContentText").html(text);
    jQuery(".markerIcon .markerIconContent .markerIconContentImage").css("background-image", url);
    jQuery("#icon_id_template").val(ui.item.find("input.icon-id").val());    
    jQuery("#icon_url_template").val("");    
  });
  
  jQuery("#popup").on("click", ".wix_image_gallery", function() {
    Wix.Settings.openMediaDialog(Wix.Settings.MediaType.IMAGE, false, function(data) {
      var imageUrl = Wix.Utils.Media.getImageUrl(data.relativeUri);

      jQuery("#icon_template").find(".markerIconContentImage").css("background-image", "url('" + imageUrl + "')");
      jQuery("#icon_template").find(".markerIconContentText").html(jQuery("#localCustom").val());
      jQuery("#icon_url_template").val(imageUrl);
      jQuery("#icon_id_template").val("");      
    }); 
  });
  
  jQuery("#closeButtonDiv").click(function() {
    var localYes = jQuery("#localYesButton").val();
    var localNo = jQuery("#localNoButton").val();
 
    jQuery("#menu_container").hide();
    
    var buttonsArray = {
        
    };
      
    buttonsArray[localYes] = function() {
      $(this).dialog("close");
      hidePopup();
    };
    
    buttonsArray[localNo] = function() {
      $(this).dialog("close");
    };
    
    jQuery("#changesDiscardedError").dialog({
      resizable: false,
      height:165,
      width:350,
      modal: true,
      dialogClass: 'alertPosition',
      buttons: buttonsArray
    });
  });
  
  jQuery("#closeButtonDiv").hover(
    function() {
      $(this).addClass("hover");
    }, function() {
      $(this).removeClass("hover");
    }
  );  
  
  google.maps.event.addListener(globalMap, 'click', function(event) {
    addMarkerWithValidation(event.latLng.lat(), event.latLng.lng());
  });

  handleMarkerIconsMenu();
}

function resizeEditorHintStrip()
{
  /*if (viewMode == 'editor')
  {
    var topInPixels = (jQuery("#widget_container").height() / 2) - (jQuery("#insideEditorHint").outerHeight() / 2);
    jQuery("#insideEditorHint").css('top', topInPixels + 'px');
  }*/
}

function widget_js()
{
  // jQuery("body").show();

  viewMode = Wix.Utils.getViewMode();
  $(window).resize(function() {
    
    if (jQuery("#premiumBool").val() == "true")
    {
      jQuery("#info_strip").hide();
    }
    else
    {
      var bannerHeight = parseFloat(jQuery("#info_strip").height());    
      var mapCanvasHeight = $("#widget_container").height() - bannerHeight; 
      jQuery("#map-canvas").height(mapCanvasHeight);
    }

    globalMap.setCenter(initialMapCenter); 
    if (jQuery("#compCoords").val() == "false")
    {
      fitToMarkers(markersArray);
    }
    
    adjustSearchBarWidth();
  });
  
  if (jQuery("#compCoords").val() == "false")
  {
    fitToMarkers(markersArray);
  }

  google.maps.event.addListenerOnce(globalMap, 'idle', function(){
    if (jQuery("#origCompId").val() == "dummy")
    {
      for(var i = 0; i < markersArray.length; i++)
      {
        if (markersArray[i].getMap() != null && markersArray[i].bubbleBool == 1)
        {
          setTimeout(function() {
             google.maps.event.trigger(markersArray[i], 'click');
          }, 500);
          break;
        }
      }
    }
  });
  
  if (viewMode == 'editor' && jQuery("#settingsEndpoint").val() == 'false')
  {
    jQuery("#insideEditorHint").show();
  }
  /*
  if (jQuery("#wixBaseUrl").val() == "")
  {
    Wix.getSiteInfo(function(siteInfo) {
      var rawInstance = jQuery('#rawInstance').val();
      var compId = jQuery('#compId').val();
      if (siteInfo)
      {
        $.ajax({
          type: "POST",
          url: "updateSettings.php",
          data: {
            'method': 'updateWebsiteUrl',
            'instance': rawInstance,
            'websiteUrl': siteInfo.baseUrl,
            'compId': compId
          }
        }).done(function() {
          Wix.Settings.refreshApp();
        });
      }
    });
  }
  */
  
  google.maps.event.addListener(globalMap, 'click', function(event) {
    if (infoWindowOpen != null)
    {
      infoWindowOpen.close();
      infoWindowOpen = null;
    }
  });

  createSearchBar();
  syncSearchBar();
}

function attachDeleteButtonListener()
{
  jQuery(".delete_button").click(function() {
    var id = $(this).closest(".markersSettingsTable").find("#current_marker_id_template").val();
    if (markersDictionary[id])
    {
      handleMarkerRemoval(markersDictionary[id]); 
    }
  });
}

function settings()
{
  viewMode = Wix.Utils.getViewMode();
  // Wix-UI
  jQuery("#settingsAccordion.accordion").each(function() {
    $(this).Accordion();
  });
  jQuery(".upgrade").click(function() {
    Wix.Settings.openBillingPage();
  });
  
  jQuery("body").tooltip({
    placement: function(a, element) {
      var position = $(element).position();
      if (position.left > 300) {
          return "left";
      }
      if (position.left < 300) {
          return "right";
      }
      return "top";
    },
    selector: '[rel=tooltip]:not([disabled])'
  });
  
  addAjaxLoadingBehavior();
  addListenerForAddressSearch();

  if (jQuery("#dummyPassword").length)
  {
    dummyPassword = jQuery("#dummyPassword").val();
  }
  
  // Map settings listeners. 
  mapOptionsSettings();
  
  // Popup/template listeners.
  createMarkerPanel();

  $(document).on("colorChanged", function (event, data) {
    var cPickerIdArray = data.type.split("_");
    var inputColor = data.selected_color.replace("#", "");

    jQuery('#color_picker_input_' + cPickerIdArray[2]).val(inputColor);

    if (!cPickerIdArray[2] || cPickerIdArray[2] != "template")
    {
      jQuery("#border_shape_select").trigger("change"); 
    }
  });
  
  if (jQuery("#wixBaseUrl").val() == "")
  {
    Wix.getSiteInfo(function(siteInfo) {
      var rawInstance = jQuery('#rawInstance').val();
      var compId = jQuery('#origCompId').val();
      
      if (siteInfo && $.trim(siteInfo.baseUrl) != "")
      {
        $.ajax({
          type: "POST",
          url: "updateSettings.php",
          data: {
            'method': 'updateWebsiteUrl',
            'passwd': dummyPassword,
            'instance': rawInstance,
            'websiteUrl': siteInfo.baseUrl,
            'compId': compId
          }
        }).done(function() {
          Wix.Settings.refreshApp();
        });
      }
    });
  }
  
  createSearchBar();
  syncSearchBar();
  // addChangeMapTypeListener();
  
  var mapCenter = globalMap.getCenter();
  updateViewport(mapCenter.lat().toFixed(8), mapCenter.lng().toFixed(8), globalMap.getZoom());
}