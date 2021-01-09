var url = "https://spreadsheets.google.com/feeds/cells/1Nc36on2CHcVC3nxxgXdlL4PrRnxCCRECXFHkHoxs8Vs/od6/public/basic?alt=json";
var places = null

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

function retrievePlacesToSee(json) {
    array = json.feed.entry
    places = []
    for (var i=6; i + 5 <= array.length; i+= 6) {
        latLng = array[i+2].content.$t.split(",")
        lat = Number(latLng[0].trim())
        lng = Number(latLng[1].trim())
        places.push(
            new PlaceToSee(
                array[i].content.$t,
                array[i+1].content.$t,
                new LatLng(lat, lng),
                array[i+3].content.$t,
                array[i+4].content.$t,
                array[i+5].content.$t)
        )
    }
    return places
}

$.ajax({
    url:url,
    dataType:"jsonp",
    success:function(data) {
        var mensa_marker = L.layerGroup();
        var overlayMaps = {
            "Mensa": mensa_marker
        };
        places = retrievePlacesToSee(data)
        for (i in places) {
            place = places[i]
            html = "<h5>" + place.name + ":</h5><img width='300px' src='" + place.imageUrl + "'><br>" +  place.description + "<br><a href='" + place.webseite + "'>Erkunden...</a>"
            console.log(html)
            L.marker(place.latlng.asArray()).addTo(mensa_marker.addTo(mymap)).bindPopup(html);
        }
        L.control.layers(overlayMaps).addTo(mymap);
    },
});

var mymap = L.map('mapid', { zoomControl: false }).setView([51.96, 7.59], 4);
var basemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoiYmVubmlkaWV0ejE5OTciLCJhIjoiY2p2YjQxOXVmMTR1YTQzcGs4am55anFsZSJ9.AMVgZjCNNILvwXnLS3DbyA'
}).addTo(mymap);