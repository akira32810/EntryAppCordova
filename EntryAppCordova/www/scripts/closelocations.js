$(document).ready(function () {

    $("#dvCurrentCoords").html(storeObject.coords);

    $("#dvCurrentAddr").html(storeObject.locAdd);


    $("#btnSearchLocation").click(function () {

        if ($.isNumeric(storeObject.lat) && $.isNumeric(storeObject.lng)) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(displayPosition, errorFunction);
            } else {
                alert('Please turn on your GPS');
            }
            $("#dvkey").css("display", "block");
        }

        else {
            alert("The current coordinate is incorrect. Make sure the saved coordinates are in x,y (28.743, -80.123) format")
        }

    });

});



function displayPosition() {

    //Load Google Map
    var latlng = new google.maps.LatLng(storeObject.lat, storeObject.lng);

    var myOptions = {
        zoom: 10,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var request = {
        location: latlng,
        radius: '20000',
        name: [$.trim($("#inNameSearch").val())]

    };

    var service = new google.maps.places.PlacesService(map);
    service.search(request, callback);


    function callback(results, status) 
    {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                createMarker(results[i]);
            
            }

           

        }
    }

    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            url: 'http://www.google.com'
        });
        
        var latlngCoord = placeLoc.lat() + "," + placeLoc.lng();

        google.maps.event.addListener(marker, 'click', function () {
            //window.location.href = marker.url;

            if ((navigator.platform.indexOf("iPhone") != -1)
    || (navigator.platform.indexOf("iPod") != -1)
    || (navigator.platform.indexOf("iPad") != -1))
                window.open("maps://maps.google.com/maps?daddr=" + latlngCoord + "&amp;ll=");
            else
                window.location.href = "http://maps.google.com/maps?daddr=" + latlngCoord + "&amp;ll=";

        });
    }
    var image = 'images/iconMe_N.png';
    var marker = new google.maps.Marker({
        position: latlng, 
        map: map,
        icon: image,
        title:"You're here"
    });


}

// Error callback function
function errorFunction() {
    alert('Enable GPS in High Accuracy mode and try again.');
}
