jQuery.addressPicker is a jQuery plugin that:

* autocompletes addresses using Google Maps API
* displays the selected address on a map
* helps the developer in getting address details into a form

Some of the ideas and some code are borrowed by [@sgruhier](https://github.com/sgruhier) [jQuery Address Picker](https://github.com/sgruhier/jquery-addresspicker) which depends on jQuery UI.

## Installation

This plugin depends on jQuery (it was tested with jQuery 1.8.2), bootstrap-typahead (version 2.2.1) and Google Maps.
```
    <script src="js/jquery-1.8.2.min.js"></script>
    <script src="js/bootstrap-typeahead.js"></script>
    <script src="js/jquery.addressPicker.js"></script>
    <script src="//maps.google.com/maps/api/js?sensor=false"></script>
```

The Bootstrap Typahead plugin works out-of-the-box with Twitter Bootstrap CSS. This is not mandatory (you can write the CSS yourself), but it's the suggested way to start using it.
```
    <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
```
To avoid conflicts between Bootstrap CSS and Google Maps, make sure to apply the rule `#googleMap img {max-width: none;}` where `#googleMap` is the selector you are using to display the map.

## Usage

To start using the plugin, use the method `typeahead` on any jQuery selection.

`$('#foo input').addressPicker();`

In most cases you will want to pass some options:

```$('#foo input').addressPicker({
  map: ...
});```

## Options
<table>
  <tr>
    <th>key</th><th>valid values</th><th>usage</th>
  </tr>
  <tr>
    <td>map</td><td>(string) any valid selector</td><td>a selector for the element where the map that will be kept in sync with the input should be displayed</td>
  </tr>
  <tr>
    <td>mapStatic</td><td>(boolean) false</td><td>if set to true uses Static Maps instead of JS Api.</td>
  </tr>
  <tr>
    <td>mapOptions</td><td>object</td><td>this value will be passed almost as is to the Google Maps constructor (see the <a href="https://developers.google.com/maps/documentation/javascript/reference#MapOptions">Google Maps JS API reference</a> for a list of all the keys you can use here). As it is a common need to indicate a center the `center` key can also be passed as a 2 elements array and the plugin will take care of transforming it into a LatLng object.</td>
  </tr>
  <tr>
    <td>geocoderOptions</td><td>object</td><td>this value will be passed as is to Google Maps Geocoder Request function (see the <a href="https://developers.google.com/maps/documentation/javascript/reference#GeocoderRequest">reference</a> for a list of all possible keys you can use here). The `address` value will be filled with the user input by the plugin.</td>
  </tr>
  <tr>
    <td>boundElements</td><td>object</td><td>this value has to contain key/value pairs where the key is a `CSS selector` and the value can be either a `string` or a `function`. If a string is given, it will be used to select which address component will be set to fill the value of the element selected by the CSS selector. The string will be used to find the first component whose types contain it and return its long_name property.For a list of possible address components see the <a href="https://developers.google.com/maps/documentation/geocoding/#Types">Google Geocoding documentation</a>. If a function is given, it will be passed the address object as it is received by the geocoder. The function has to return a string. An address object sample can be found below.</td>
  </tr>
</table>

## Example instantiation
```
$('input selector').addressPicker({
    map: '#map',
    mapOptions:{
        zoom: 11,
        center: [47.383183,8.500671],
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    },
    geocoderOptions: {
        location: new google.maps.LatLng(47.3, 8.5),
        region: 'CH',
        bounds: new google.maps.LatLngBounds(new google.maps.LatLng(47.4, 8.3), new google.maps.LatLng(47.2, 8.6))
    },
    bindings: {
        'selector': 'administrative_zone_2',
        '#event_foo': function (data) {
            var result = '';
            _.each(data.address_components, function (value) {
                if (matches = value.short_name.match(/District (\d{1,2})/)) {
                    result = matches[1];
                }
            });
            return result;
        }
    }
});
```

## Example address object from Google Maps Geocoding API
```
{
         "address_components" : [
            {
               "long_name" : "Baden",
               "short_name" : "Baden",
               "types" : [ "locality", "political" ]
            },
            {
               "long_name" : "Baden District",
               "short_name" : "Baden District",
               "types" : [ "administrative_area_level_2", "political" ]
            },
            {
               "long_name" : "Aargau",
               "short_name" : "AG",
               "types" : [ "administrative_area_level_1", "political" ]
            },
            {
               "long_name" : "Switzerland",
               "short_name" : "CH",
               "types" : [ "country", "political" ]
            }
         ],
         "formatted_address" : "Baden, Switzerland",
         "geometry" : {
            "bounds" : {
               "northeast" : {
                  "lat" : 47.48550010,
                  "lng" : 8.314719999999999
               },
               "southwest" : {
                  "lat" : 47.44359000000001,
                  "lng" : 8.265649999999999
               }
            },
            "location" : {
               "lat" : 47.47376670,
               "lng" : 8.306473199999999
            },
            "location_type" : "APPROXIMATE",
            "viewport" : {
               "northeast" : {
                  "lat" : 47.48550010,
                  "lng" : 8.314719999999999
               },
               "southwest" : {
                  "lat" : 47.44359000000001,
                  "lng" : 8.265649999999999
               }
            }
         },
         "types" : [ "locality", "political" ]
      }
```
