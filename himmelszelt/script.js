var url = "https://spreadsheets.google.com/feeds/cells/1oe7koTNUzTmhl9Z_133RRdQo-W01K9X9BxMvCFZydVw/od6/public/basic?alt=json";
var places = null

var you_are_here_url = "you-are-here.png"

var small_icon_size = 35
var large_icon_size = 65

class Category {
    constructor(name_in_table, name_to_display, icon_path) {
        this.name_in_table = name_in_table;
        this.name_to_display = name_to_display;
        this.icon_path = icon_path;
        this.layerGroup = L.layerGroup();
    }
    
    addPlace(place, html) {
        L.marker(place.latlng.asArray(), {icon: getIcon(this.icon_path, 50)}).addTo(this.layerGroup.addTo(mymap)).bindPopup(html);   
    }
}

var categories = []

categories.push(
    new Category("Stadt", "Stadt", "city.png")
)
categories.push(
    new Category("Freizeit", "Freizeit", "leisure_icon.png")
)
categories.push(
    new Category("Shopping", "Shopping", "shopping.png")
)
categories.push(
    new Category("Essen", "Essen", "essen.png")
)

class LatLng {
    constructor(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }

    asArray() {
        return [this.lat, this.lng]
    }
}

class PlaceToSee {
    constructor(category, name, latlng, description, imageUrl, webseite) {
        this.category = category;
        this.name = name;
        this.latlng = latlng;
        this.description = description;
        this.imageUrl = imageUrl;
        this.webseite = webseite;
    }
}

function getCategoryOfPlace(categoryName) {
    for (var i in categories) {
        var c = categories[i]
        if (c.name_in_table == categoryName) {
            return c
        }
    }
    return null
}

function retrievePlacesToSee(json) {
    array = json.feed.entry
    places = []
    for (var i=6; i + 5 <= array.length; i+= 6) {
        if (array[i+2] !== null) {
            latLng = array[i+2].content.$t.split(",")
            if (latLng[0] !== null && latLng[1] != null) {
                lat = Number(latLng[0].trim())
                lng = Number(latLng[1].trim())
            }
        }
        places.push(
            new PlaceToSee(
                getCategoryOfPlace(array[i].content.$t),
                array[i+1].content.$t,
                (lng!==null) ? new LatLng(lat, lng) : null,
                (array[i+3] != null) ?array[i+3].content.$t : null,
                (array[i+4] != null) ? array[i+4].content.$t : null,
                (array[i+5] != null) ? array[i+5].content.$t : null)
        )
    }
    return places
}

var overlayMaps = {}

$.ajax({
    url:url,
    dataType:"jsonp",
    success:function(data) {
        var freizeit_layer = L.layerGroup();
        var stadt_layer = L.layerGroup();
        var essen_layer = L.layerGroup();
        var shopping_layer = L.layerGroup();
        
        places = retrievePlacesToSee(data)
        for (i in places) {
            place = places[i]
            html = "<h5>" + place.name + ":</h5>"
            if (place.imageUrl != null) {
                html += "<img width='300px' src='" + place.imageUrl + "'></img>"
            }
            if (place.description != null && place.description.length > 2) {
                html += "<br>" + place.description + "<br>"
            }
            if (place.webseite != null && place.webseite.length >  5) {
                html += "<a href='" + place.webseite + "'>Erkunden...</a>"
            }
            if (place.latLng !== null) {
                if (place.category != null) {
                    place.category.addPlace(place, html)
                }
            }
        }
        var baseLayers = {

        };
        overlayMaps = {
        };
        for (var i in categories) {
            var c = categories[i]
            overlayMaps[c.name_to_display] = c.layerGroup
        }
        L.control.layers(baseLayers, overlayMaps).addTo(mymap);
    },
});

function getIcon(url, size) {
    return new L.icon({
        iconUrl: url,
        iconSize:  [size, size]
    })
}



var mymap = L.map('mapid', { 
    zoomControl: false,
    fullscreenControl: true
}).setView([54.05128792423013, 10.749693008609134], 13);
var basemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoiYmVubmlkaWV0ejE5OTciLCJhIjoiY2p2YjQxOXVmMTR1YTQzcGs4am55anFsZSJ9.AMVgZjCNNILvwXnLS3DbyA'
}).addTo(mymap);

// mymap.locate({setView: true, watch: true}) /* This will return map so you can do chaining */
//         .on('locationfound', function(e){
//             var marker = L.marker([e.latitude, e.longitude], {icon: getIcon(you_are_here_url, large_icon_size)} );
//             var circle = L.circle([e.latitude, e.longitude], e.accuracy/2, {
//                 weight: 1,
//                 color: 'blue',
//                 fillColor: '#cacaca',
//                 fillOpacity: 0.2
//             });
//             mymap.addLayer(marker).openPopup();
//             mymap.addLayer(circle);
//             mymap.panTo(new L.LatLng(e.latitude, e.longitude));
//         })
//        .on('locationerror', function(e){
//             console.log(e);
//             alert("Location access denied.");
//         });

// mymap.on('zoomend', function() {
//     var currentZoom = mymap.getZoom();
//     if (currentZoom < 11) {
//         overlayMaps.eachLayer(function(layer) {
//             //if (layer.feature.properties.num < 0.5)
//             return layer.setIcon(getIcon(essen_icon_url, small_icon_size));
//             //else if (feature.properties.num < 1.0)
//               //  return layer.setIcon(ar_icon_2_double_size);
//         });
//     }
// });