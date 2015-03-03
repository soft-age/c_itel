(function( $ ) {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";
        var localFindInMarkers = jQuery("#localFindInMarkers").val();
        this.input = $( '<input placeholder="' + localFindInMarkers + '">' )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left search-bar-combobox" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
            jQuery(".search-bar-combobox.ui-autocomplete-input").blur();
            panAndBubbleMarker(markersDictionary[ui.item.markerId], "search");
          },
 
          autocompletechange: "_removeIfInvalid"
        });
        
        this.input.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
          // Add class to ul

          return $('<li class="searchResult"></li>')
            .data( "item.autocomplete", item )
            .append( '<a>' + '<div style="position:relative;">' + '<img src="' + item.icon + '" height="20" width="20"/>' + '<div style="position: absolute; left: 30px; bottom: 3px;">' + item.label + '</div>' + '<input class="markerIdSearchBox" type="hidden" value="' + item.markerId + '" /></div>' + '</a>' )
            .appendTo( ul );
        };
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .tooltip()
          .appendTo( this.wrapper )
          .addClass("searchMarkersButton")
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right search-bar-combobox" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var rawInstance = jQuery("#rawInstance").val();
        var originalCompId = jQuery("#origCompId").val();

        $.ajax({
          url: "fetch.php",
          method: "POST",
          dataType: "json",
          data: {
            method: "get_marker_data_by_substring",
            instance: rawInstance,
            origCompId: originalCompId,
            widthInPixels: (jQuery(".search-bar-combobox.ui-autocomplete-input").length > 0) ? jQuery(".search-bar-combobox.ui-autocomplete-input").outerWidth() : '50',
            contains: request.term,
            passwd: jQuery("#passwordForFetchingMarkerInformation").val()
          },
          success: function( data ) {
            response( $.map( data, function( item ) {
              return {
                label: item.bubble_html_clean != null ? item.bubble_html_clean : '',
                value: '',
                markerId: item.id,
                icon: item.icon_url,
                option: this
              }
            }));
          }
        });
      },
      _removeIfInvalid: function( event, ui ) {
 
      // Selected an item, nothing to do
      if ( ui.item ) {
        return;
      }
 
      // Search for a match (case-insensitive)
      var value = this.input.val(),
        valueLowerCase = value.toLowerCase(),
        valid = false;
      this.element.children( "option" ).each(function() {
        if ( $( this ).text().toLowerCase() === valueLowerCase ) {
          this.selected = valid = true;
          return false;
        }
      });
 
        // Found a match, nothing to do
      if ( valid ) {
        return;
      }
 

      this.element.val( "" );
      this._delay(function() {
        this.input.tooltip( "close" ).attr( "title", "" );
      }, 2500 );
      this.input.data( "ui-autocomplete" ).term = "";
    },
 
    _destroy: function() {
      this.wrapper.remove();
      this.element.show();
    }
  });
})( jQuery );