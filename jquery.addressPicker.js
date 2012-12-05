/*global jQuery: false, google: false */
(function ($) {
    "use strict";
    var gmap, gmarker, methods;

    function findInfo(result, type) {
        var i, component;
        if (result.address_components) {
            for (i = 0; i < result.address_components.length; i += 1) {
                component = result.address_components[i];
                if (component.types.indexOf(type) !== -1) {
                    return component.long_name;
                }
            }
        }
        return false;
    }

    methods = {
        init: function (options) {
            var settings = $.extend(true, {
                map: false,
                mapOptions: {
                    zoom: 5,
                    center: [0, 0],
                    scrollwheel: false,
                    mapTypeId: "roadmap"
                },
                geocoderOptions: {
                    appendAddressString: '',
                    regionBias: ''
                },
                typeaheadOptions: {
                    source: $.proxy(methods.geocode, this),
                    updater: $.proxy(methods.updater, this),
                    matcher: methods.matcher,
                    sorter: methods.sorter,
                    highlighter: methods.highlighter
                },
                boundElements: {}
            }, options);
            
            this.settings = settings;
            // hash to store geocoder results keyed by address
            this.addressMapping = {}; 
            
            this.geocoder = new google.maps.Geocoder();

            if (this.settings.map) {
                methods.initMap.apply(this, undefined);
            }

            return this
                .change($.proxy(methods.onChange, this))
                .typeahead(settings.typeaheadOptions);
        },
        initMap: function () {
            var mapOptions = $.extend({}, this.settings.mapOptions);
            mapOptions.center = new google.maps.LatLng(mapOptions.center[0], mapOptions.center[1]);
            gmap = new google.maps.Map($(this.settings.map)[0], mapOptions);
            gmarker = new google.maps.Marker({
                position: mapOptions.center,
                map: gmap,
                draggable: this.settings.draggableMarker
            });
            gmarker.setVisible(false);
        },
        geocode: function (query, process) {
            var labels, self = this;
            this.geocoder.geocode({
                'address': query + this.settings.geocoderOptions.appendAddressString,
                'region': this.settings.geocoderOptions.regionBias
            }, function (geocoderResults, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    self.addressMapping = {};
                    labels = [];
                    $.each(geocoderResults, function (index, element) {
                        self.addressMapping[element.formatted_address] = element;
                        labels.push(element.formatted_address);
                    });
                    return process(labels);
                }
            });
        },
        updater: function (item) {
            this.currentItem = this.addressMapping[item];
            return item;
        },
        onChange: function (event) {
            var currentItem = this.currentItem,
                self = this;

            if (gmarker) {
                gmarker.setPosition(currentItem.geometry.location);
                gmarker.setVisible(true);

                gmap.fitBounds(currentItem.geometry.viewport);
            }

            $.each(this.settings.boundElements, function (selector, geocodeProperty) {
                var newValue = $.isFunction(geocodeProperty)
                    ? ($.proxy(geocodeProperty, self)(currentItem))
                    : findInfo(currentItem, geocodeProperty);
                $(selector).val(newValue);
            });
        }
    };

    $.fn.addressPicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.addressPicker');
        }
    };

}(jQuery));