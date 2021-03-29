var url = "https://spreadsheets.google.com/feeds/cells/1Nc36on2CHcVC3nxxgXdlL4PrRnxCCRECXFHkHoxs8Vs/od6/public/basic?alt=json";
var places = null

var large_icon_size = 50

var searchParams = new URLSearchParams(window.location.search)

var selectedPlaceIndex = parseInt(searchParams.get("place"))-2

class Category {
    constructor(name_in_table, name_to_display, icon_path, iconSize = large_icon_size) {
        this.name_in_table = name_in_table;
        this.name_to_display = name_to_display;
        this.icon_path = icon_path;
        this.layerGroup = L.layerGroup();
        this.iconSize = iconSize;
    }
    
    addPlace(place, html, showPopup = false) {
        var m = L.marker(place.latlng.asArray(), {icon: getIcon(this.icon_path, this.iconSize)}).addTo(this.layerGroup.addTo(mymap)).bindPopup(html);
        if (showPopup) {
            m.openPopup()
        }
    }
}

var categories = []

categories.push(
    new Category("Stadt", "Stadt", "city.png", 60)
)

categories.push(
    new Category("Natur", "Natur", "berge.png", 60)
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
    constructor(category, name, latlng, description, imageUrl,webseite) {
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

$.ajax({
    url:url,
    dataType:"jsonp",
    success:function(data) {
        var mensa_marker = L.layerGroup();
        places = retrievePlacesToSee(data)
        for (i in places) {
            place = places[i]
            html = "<h5>" + place.name + "</h5>"
            if (place.imageUrl != null && place.imageUrl.length > 2) {
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
                    place.category.addPlace(place, html, i == selectedPlaceIndex)
                    if (i == selectedPlaceIndex) {
                        mymap.setView([place.latlng.lat, place.latlng.lng], 14)
                    }
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
}).setView([51.96, 7.59], 4);
var basemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoiYmVubmlkaWV0ejE5OTciLCJhIjoiY2p2YjQxOXVmMTR1YTQzcGs4am55anFsZSJ9.AMVgZjCNNILvwXnLS3DbyA'
}).addTo(mymap);