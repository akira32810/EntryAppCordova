var db;
var numOfEntriesSaved;
var numofPictureSaved;
var curCoords;
var curlat;
var curlng

$(document).ready(function () {
  

    $(".btnAbout").on('click',function () {
 
        displayAbout();
    });

    $(".btnProfile").on('click', function () {
        GetProfile();
    });

    $(".btnWeatherCheck").on('click', function () {

        getCurPosition();
       //  getWeatherBasedonCoords();
    });

})


//panel functionalities
function displayAbout() {
    $(".pContentOptions").html('<h3>App Creator</h3> <b>ITTechProf</b>\
                 <h3>Description</h3>\
                    We have created this app as a solution to let you save your time and enjoy taking pictures\
                    with your family and friends.  You do not have to worry about\
                    finding the right pictures in the future to share with others for your memorable locations.\
                    <h3>Contact</h3>\
                    Please visit <a href="http://www.favoritelocations.net">http://www.favoritelocations.net</a> to get more\
                    info about our app and use the contact page if you have any questions or concerns.');
}



//get current position, useful for getting weather data
function getCurPosition() {
    $(".pContentOptions").html("");

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function onSuccess(position) {
            curlat = position.coords.latitude;
            curlng = position.coords.longitude;
            curCoords = curlat + ", " + curlng;

     

            $(".pContentOptions").append("<p><b>Weather for current location: </b></p>");

            //get address of coords
            var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + curlat + "," + curlng + "&sensor=false";
            $.getJSON(url, function (data) {
                // $("#dvAddressShow").html(data.results[0].formatted_address);
                $(".pContentOptions").append("<p>" + data.results[0].formatted_address + "</p> <br/>");
            });


            getWeatherBasedonCoords();
        }, onError, { timeout: 5000, enableHighAccuracy: true });
    }

    else {
        alert("Locations is not supported or GPS 'High Accuracy' mode is not on.");
    }


    function onError(e) {
        console.log(e);
    }

}


function getWeatherBasedonCoords() {

    var weatherstr = "";
    $.get("http://forecast.weather.gov/MapClick.php?lat="+curlat+"&lon="+curlng+"&FcstType=dwml").done(function (data) {
        $xml = $(data);
        $credit = $xml.find("credit");
        $timeLayout = $xml.find('data[type="forecast"]').find("time-layout").eq(2).find("start-valid-time");
        $minTemp = $xml.find('data[type="forecast"]').find("temperature[type='minimum']").find("value");
        $maxTemp = $xml.find('data[type="forecast"]').find("temperature[type='maximum']").find("value");
        $imageWeather = $xml.find('data[type="forecast"]').find("conditions-icon").find("icon-link");

    
        var countPic = 1;
        weatherstr += '<ul data-role="listview" class="ui-listview ui-listview-inset ui-corner-all ui-shadow">';
        $timeLayout.each(function (index) {
          
            //   alert($(this).attr("period-name"));
            weatherstr += '<li class="ui-li-static ui-body-inherit ui-li-has-thumb"><img src="' + $imageWeather.eq((index + countPic)).text() + '" alt=""/><h2>' + $(this).attr("period-name") + '</h2><p>' + $maxTemp.eq(index).text() + ' / ' + $minTemp.eq(index).text() + ' °F</p>';
         //   alert(index);
            countPic++;
        });
        weatherstr += '</ul>'

        $(".pContentOptions").append(weatherstr);

    }).fail(function () {
        alert("Cannot get Weather data");
    });

}


//get profile Stats


function GetProfile() {
    window.resolveLocalFileSystemURL(
        cordova.file.externalRootDirectory + "FavLocations/",
        function (fileEntry) {

            var directoryReader = fileEntry.createReader();
            directoryReader.readEntries(function gotFileList(entries) {
                var i;
                var count = 0;
               
                for (i = 0; i < entries.length; i++) {
                    if (entries[i].name.indexOf("ID") != -1 && entries[i].name.indexOf(".jpg") != -1) {
                        count++;
                    }
                }

                storeObject.numOfPicturesSaved = count;
                

                //ouput to screen
                $(".pContentOptions").html('<h3>Locations Saved</h3> <b>' + storeObject.numofEntriesSaved + '</b><h3>Total Pictures Taken</h3> <b>' + storeObject.numOfPicturesSaved + '</b>');
             

            }, function filereadErrors(error) {
                alert("Failed to list directory contents: " + error.code);
            });
        },
        DirectoryReadErrors);

    db.transaction(["Positions"], "readonly").objectStore("Positions").count().onsuccess = function (e) {
        var result = e.target.result;
        storeObject.numofEntriesSaved = result;


    }, onError = function (e) {
        alert("Error getting Profile: " + e);
    };
  
}


function DirectoryReadErrors(error) {
    alert("Failed to list directory contents: " + error.code);
}

/*---------------------------*/

