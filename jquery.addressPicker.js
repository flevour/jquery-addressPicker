/*global jQuery: false, google: false */
/*!
 * jQuery Address Picker v1.4.4
 *
 * Copyright 2012, Francesco Levorato
 * Licensed under the MIT license.
 *
 */
(function ($) {
    "use strict";
    var methods;

    function findInfo(result, type) {
        var i, component;
        if (type === 'lat' || type === 'lng') {
            return result.geometry.location[type]();
        }
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
            this.gmap = new google.maps.Map($(this.settings.map)[0], mapOptions);
            this.gmarker = new google.maps.Marker({
                position: mapOptions.center,
                map: this.gmap,
                draggable: this.settings.draggableMarker
            });
            this.gmarker.setVisible(false);
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

            if (this.gmarker) {
                this.gmarker.setPosition(currentItem.geometry.location);
                this.gmarker.setVisible(true);

                this.gmap.fitBounds(currentItem.geometry.viewport);
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

    // make IE think it doesn't suck
    if (!Array.indexOf) {
        Array.prototype.indexOf = function (obj) {
            var i;
            for (i = 0; i < this.length; i += 1) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
    }

}(jQuery));