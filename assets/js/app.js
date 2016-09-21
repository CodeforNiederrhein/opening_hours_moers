var map, featureList, ladenSearch = [], panoSearch = [];
$(window).resize(function () {
    sizeLayerControl();
});
$(document).on("click", ".feature-row", function (e) {
    $(document).off("mouseout", ".feature-row", clearHighlight);
    sidebarClick(parseInt($(this).attr("id"), 10));
});
if (!("ontouchstart" in window)) {
    $(document).on("mouseover", ".feature-row", function (e) {
        highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
    });
}
$(document).on("mouseout", ".feature-row", clearHighlight);
$("#about-btn").click(function () {
    $("#aboutModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});
$("#branche-btn").click(function () {
    $("#branchenModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});
$("#full-extent-btn").click(function () {
    map.fitBounds(boroughs.getBounds());
    $(".navbar-collapse.in").collapse("hide");
    return false;
});
$("#legend-btn").click(function () {
    $("#legendModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});
$("#login-btn").click(function () {
    $("#loginModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});
$("#list-btn").click(function () {
    animateSidebar();
    return false;
});
$("#nav-btn").click(function () {
    $(".navbar-collapse").collapse("toggle");
    return false;
});
$("#sidebar-toggle-btn").click(function () {
    animateSidebar();
    return false;
});
$("#sidebar-hide-btn").click(function () {
    animateSidebar();
    return false;
});
function animateSidebar() {
    $("#sidebar").animate({
        width: "toggle"
    }, 350, function () {
        map.invalidateSize();
    });
}
function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}
function clearHighlight() {
    highlight.clearLayers();
}
function sidebarClick(id) {
    var layer = markerClusters.getLayer(id);
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
    /* Hide sidebar and go to the map on small screens */
    if (document.body.clientWidth <= 767) {
        $("#sidebar").hide();
        map.invalidateSize();
    }
}
function syncSidebar() {
    /* Empty sidebar features */
    $("#feature-list tbody").empty();
    /* Loop through laden layer and add only features which are in the map bounds */
    laden.eachLayer(function (layer) {
        if (map.hasLayer(ladenLayer)) {
            if (map.getBounds().contains(layer.getLatLng())) {
                $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/img/shopping1.png"></td><td class="feature-name">' + layer.feature.properties.Firma + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            }
        }
    });
    pano.eachLayer(function (layer) {
        if (map.hasLayer(panoLayer)) {
            if (map.getBounds().contains(layer.getLatLng())) {
                $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/img/blitzer.png"></td><td class="feature-name">' + layer.feature.properties.PanoTitle + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            }
        }
    });
    /* Update list.js featureList */
    featureList = new List("features", {
        valueNames: ["feature-name"]
    });
    featureList.sort("feature-name", {
        order: "asc"
    });
}
/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});

/* Overlay Layers*/
var highlight = L.geoJson(null);
var highlightStyle = {
    stroke: false,
    fillColor: "#0000FF",
    fillOpacity: 0.7,
    radius: 10
};
/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 25
});
var openicon = L.icon({
    iconUrl: "assets/img/shopping1_grün.png",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -25]
});
var closeicon = L.icon({
    iconUrl: "assets/img/shopping1.png",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -25]
});
var panoIcon = L.icon({
    iconUrl: "assets/img/blitzer.png",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -25]
});
var dayopen = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
var dayofweeks = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
var date = new Date();
var day = date.getDay();
var hours = date.getHours();
var minute = date.getMinutes();
function isopen(features) {
    var opening_hours = require('opening_hours');
    var oh = new opening_hours(features.properties.opening_hours);
    var is_open = oh.getState();
    return is_open;

}
/* Empty layer placeholder to add to layer control for listening when to add/remove laden to markerClusters layer */
var ladenLayer = L.geoJson(null);
var laden = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        if (isopen(feature)) {
            return L.marker(latlng, {
                icon: openicon,
                title: feature.properties.Firma,
                riseOnHover: true
            });
        }
        else {
            return L.marker(latlng, {
                icon: closeicon,
                title: feature.properties.Firma,
                riseOnHover: true
            });
        }
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            if (feature.properties.Montag_Pause.length > 0) {

                var maincontent = dayopen.map(function (dayofweek) {
                    return "<tr><th>" + dayofweek + "</th><td>" + feature.properties[dayofweek + '_von'] + " - " + feature.properties[dayofweek + '_bis'] + " Pause: " + feature.properties[dayofweek + '_Pause'] + "</td></tr>"

                })
                var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Firma + "</td></tr>" + "<tr><th>Telefonnummer</th><td>" + feature.properties.Fon + "</td></tr>" + "<tr><th>Adresse</th><td>" + feature.properties.Straße + " " + feature.properties.HausNr + "</td></tr>" + "<tr><th>Branche</th><td>" + feature.properties.Branche + "</td></tr>"
                    + maincontent.join('')
                    + "<tr><th>Website</th><td><a class='url-break' target='_blank' href=http://" + feature.properties.URL + ">" + feature.properties.URL + "</a></td></tr>" + "</table>";
            }
            if (feature.properties.Montag_Pause.length == 0) {
                var maincontent1 = dayopen.map(function (dayofweek) {
                    return "<tr><th>" + dayofweek + "</th><td>" + feature.properties[dayofweek + '_von'] + " - " + feature.properties[dayofweek + '_bis'] + "</td></tr>"

                })
                var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Firma + "</td></tr>" + "<tr><th>Telefonnummer</th><td>" + feature.properties.Fon + "</td></tr>" + "<tr><th>Adresse</th><td>" + feature.properties.Straße + " " + feature.properties.HausNr + "</td></tr>" + "<tr><th>Branche</th><td>" + feature.properties.Branche + "</td></tr>"
                    + maincontent1.join("")
                    + "<tr><th>Website</th><td><a class='url-break' target='_blank' href=http://" + feature.properties.URL + ">" + feature.properties.URL + "</a></td></tr>" + "</table>";

            }
            if (feature.properties.Samstag_von.length == 0) {
                var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Firma + "</td></tr>" + "<tr><th>Telefonnummer</th><td>" + feature.properties.Fon + "</td></tr>" + "<tr><th>Adresse</th><td>" + feature.properties.Straße + " " + feature.properties.HausNr + "</td></tr>" + "<tr><th>Branche</th><td>" + feature.properties.Branche + "</td></tr>"
                    + "<tr><th>Montag</th><td>" + feature.properties.Montag_von + " - " + feature.properties.Montag_bis + "</td></tr>"
                    + "<tr><th>Dienstag</th><td>" + feature.properties.Dienstag_von + " - " + feature.properties.Dienstag_bis + "</td></tr>"
                    + "<tr><th>Mittwoch</th><td>" + feature.properties.Mittwoch_von + " - " + feature.properties.Mittwoch_bis + "</td></tr>"
                    + "<tr><th>Donnerstag</th><td>" + feature.properties.Donnerstag_von + " - " + feature.properties.Donnerstag_bis + "</td></tr>"
                    + "<tr><th>Freitag</th><td>" + feature.properties.Freitag_von + " - " + feature.properties.Freitag_bis + "</td></tr>"
                    + "<tr><th>Website</th><td><a class='url-break' target='_blank' href=http://" + feature.properties.URL + ">" + feature.properties.URL + "</a></td></tr>" + "</table>";

            }
            layer.on({
                click: function (e) {
                    $("#feature-title").html(feature.properties.Firma);
                    $("#feature-info").html(content);
                    $("#featureModal").modal("show");
                    highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                }
            });
            $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/img/shopping1.png"></td><td class="feature-name">' + layer.feature.properties.Firma + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            ladenSearch.push({
                name: layer.feature.properties.Firma,
                address: layer.feature.properties.Straße + " " + feature.properties.HausNr,
                branche: layer.feature.properties.Branche,
                source: "Geschäfte",
                id: L.stamp(layer),
                lat: layer.feature.geometry.coordinates[1],
                lng: layer.feature.geometry.coordinates[0]
            });
        }
    }
});
$.getJSON("data/laden.json", function (data) {
    laden.addData(data);
    map.addLayer(ladenLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove laden to markerClusters layer */
var panoLayer = L.geoJson(null);
var pano = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
                icon: panoIcon,
                title: feature.properties.PanoTitle,
                riseOnHover: true
            });
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var url = "https://moers-stadtrundgang.telepano.de/tour.html?s=pano" +feature.properties.PanoID+ "&skipintro&html5=only"
            var content ="Unter folgendem Link findet man ein 360° Panoramer von dem Standort: " +'<br>' + '<a href=https://moers-stadtrundgang.telepano.de/tour.html?s=pano'+feature.properties.PanoID+'&skipintro&html5=only target="_blank">'+feature.properties.PanoTitle +' </a>' ;

                layer.on({
                click: function (e) {
                    $("#feature-title").html(feature.properties.PanoTitle);
                    $("#feature-info").html(content);
                    $("#featureModal").modal("show");
                    highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                }
            });
           panoSearch.push({
                name: layer.feature.properties.Panorama,
                source: "panorama",
                id: L.stamp(layer),
                lat: layer.feature.geometry.coordinates[1],
                lng: layer.feature.geometry.coordinates[0]
            });
        }
    }
});
$.getJSON("data/test.json", function (data) {
    pano.addData(data);
    map.addLayer(panoLayer);
});

map = L.map("map", {
    zoom: 17,
    center: [51.452443, 6.627936],
    layers: [cartoLight, markerClusters, highlight],
    zoomControl: false,
    attributionControl: false
});
/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function (e) {
    if (e.layer === ladenLayer) {
        markerClusters.addLayer(laden);
        syncSidebar();
    }
    if (e.layer === panoLayer) {
        markerClusters.addLayer(pano);
        syncSidebar();
    }
});
map.on("overlayremove", function (e) {
    if (e.layer === ladenLayer) {
        markerClusters.removeLayer(laden);
        syncSidebar();
    }
    if (e.layer === panoLayer) {
        markerClusters.removeLayer(pano);
        syncSidebar();
    }
});
/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
    syncSidebar();
});
/* Clear feature highlight when map is clicked */
map.on("click", function (e) {
    highlight.clearLayers();
});
/* Attribution control */
function updateAttribution(e) {
    $.each(map._layers, function (index, layer) {
        if (layer.getAttribution) {
            $("#attribution").html((layer.getAttribution()));
        }
    });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);
var attributionControl = L.control({
    position: "bottomright"
});
attributionControl.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-control-attribution");
    div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
    return div;
};
map.addControl(attributionControl);
var zoomControl = L.control.zoom({
    position: "bottomright"
}).addTo(map);
/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
    position: "bottomright",
    drawCircle: true,
    follow: true,
    setView: true,
    keepCurrentZoomLevel: true,
    markerStyle: {
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.8
    },
    circleStyle: {
        weight: 1,
        clickable: false
    },
    icon: "fa fa-location-arrow",
    metric: false,
    strings: {
        title: "My location",
        popup: "You are within {distance} {unit} from this point",
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
    },
    locateOptions: {
        maxZoom: 18,
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    }
}).addTo(map);
/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
    var isCollapsed = true;
} else {
    var isCollapsed = false;
}
var baseLayers = {};
var groupedOverlays = {
    "Daten": {
        "<img src='assets/img/shopping1.png' width='20' height='20'>&nbsp;Geschäfte": ladenLayer,
        "<img src='assets/img/blitzer.png' width='20' height='20'>&nbsp;Panorama": panoLayer
    },
};
var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
    collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
    $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();
    }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
    $(document).on("mouseout", ".feature-row", clearHighlight);
});
/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
    $("#loading").hide();
    sizeLayerControl();
    featureList = new List("features", {valueNames: ["feature-name"]});
    featureList.sort("feature-name", {order: "asc"});
    var ladenBH = new Bloodhound({
        name: "Geschäfte",
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: ladenSearch,
        limit: 10
    });
    var brancheBH = new Bloodhound({
        name: "panorama",
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.branche);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: ladenSearch,
        limit: 10
    });
    var geonamesBH = new Bloodhound({
        name: "Städte",
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=DE&name_startsWith=%QUERY",
            filter: function (data) {
                return $.map(data.geonames, function (result) {
                    return {
                        name: result.name + ", " + result.adminCode1,
                        lat: result.lat,
                        lng: result.lng,
                        source: "GeoNames"
                    };
                });
            },
            ajax: {
                beforeSend: function (jqXhr, settings) {
                    settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
                    $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
                },
                complete: function (jqXHR, status) {
                    $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
                }
            }
        },
        limit: 10
    });
    ladenBH.initialize();
    brancheBH.initialize();
    geonamesBH.initialize();
    /* instantiate the typeahead UI */
    $("#searchbox").typeahead({
            minLength: 3,
            highlight: true,
            hint: false
        },
        {
            name: "laden",
            displayKey: "branche",
            source: ladenBH.ttAdapter(),
            templates: {
                header: "<h4 class='typeahead-header'><img src='assets/img/shopping1.png' width='24' height='28'>&nbsp;Geschäfte</h4>",
                suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small> <small>{{branche}}</small>"].join(""))
            }
        },
        {
            name: "laden",
            displayKey: "branche",
            source: brancheBH.ttAdapter(),
            templates: {
                header: "<h4 class='typeahead-header'><img src='assets/img/shopping1.png' width='24' height='28'>&nbsp;Branchen</h4>",
                suggestion: Handlebars.compile(["{{branche}}<br>&nbsp;<small>{{name}}</small>"].join(""))
            }
        }, {
            name: "GeoNames",
            displayKey: "name",
            source: geonamesBH.ttAdapter(),
            templates: {
                header: "<h4 class='typeahead-header'>&nbsp;Städte</h4>"
            }
        }).on("typeahead:selected", function (obj, datum) {
        if (datum.source === "Geschäfte") {
            if (!map.hasLayer(ladenLayer)) {
                map.addLayer(ladenLayer);
            }
            map.setView([datum.lat, datum.lng], 18);
            if (map._layers[datum.id]) {
                map._layers[datum.id].fire("click");
            }
        }
        if (datum.source === "Panorama") {
            if (!map.hasLayer(panoLayer)) {
                map.addLayer(panoLayer);
            }
            map.setView([datum.lat, datum.lng], 18);
            if (map._layers[datum.id]) {
                map._layers[datum.id].fire("click");
            }
        }
        if (datum.source === "GeoNames") {
            map.setView([datum.lat, datum.lng], 14);
        }
        if ($(".navbar-collapse").height() > 50) {
            $(".navbar-collapse").collapse("hide");
        }
    }).on("typeahead:opened", function () {
        $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
        $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
    }).on("typeahead:closed", function () {
        $(".navbar-collapse.in").css("max-height", "");
        $(".navbar-collapse.in").css("height", "");
    });
    $(".twitter-typeahead").css("position", "static");
    $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
    L.DomEvent
        .disableClickPropagation(container)
        .disableScrollPropagation(container);
} else {
    L.DomEvent.disableClickPropagation(container);
}