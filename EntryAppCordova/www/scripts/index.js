
var db;
//var imagePath = "file:///storage/emulated/0/Android/data/io.cordova.favoritelocation/cache/";
//var imagePath = cordova.file.externalRootDirectory + "FavLocations/";
//var logOb = "";

var myobject = new Object();
//var ddpath = cordova.file.dataDirectory;
var storeObject = {
    PosID: null,
    locationDetails: null,
    coords: null,
    srcImage: null,
    lat: null,
    lng: null,
    locAdd: null,
    numofEntriesSaved:"",
    numOfPicturesSaved:""

}

var position = {
  
    desc: null,
    coords: null,
    created: null,
}

function indexedDBOk() {
    return "indexedDB" in window;
}




//document.addEventListener("DOMContentLoaded", function () {
document.addEventListener("deviceready", function () {



    //load ads

    loadAds();


    //make sure if location enable high accuracy is checked:
    checklocationEnabled();

    copyFilesToExternalAtStart();

    //load profile statistics 
  
    /*-------------*/



            $("#get_saveLocation").click(function () {

                //check to see if navigator exist and then check location
                getPosition();

            });

            
            $("#btnSavePos").click(function () {
                addPosition();
             //   displaySavedPositions();
            });

      
            //store the id to get it on the second page
            $(document).on('click', '#ulViewAllPositions li a', function () {
                var theID = $(this).attr("id");
                storeObject.PosID = theID;
               
                });



    //No support? Go in the corner and pout.
    if (!indexedDBOk) return;

    var openRequest = indexedDB.open("idarticle_people", 1);

    openRequest.onupgradeneeded = function (e) {
        var thisDB = e.target.result;
     
        if (!thisDB.objectStoreNames.contains("Positions")) {
            thisDB.createObjectStore("Positions", { keyPath: "id", autoIncrement: true });
            //read text file after db table created if it doesn't exist

        }
    }

    openRequest.onsuccess = function (e) {
        console.log("running onsuccess");

        db = e.target.result; 
        //load all Positions

        var transaction = db.transaction(["Positions"], "readonly");

        var store = transaction.objectStore("Positions");
        
        var counting = store.count();
        
        counting.onsuccess = function (e) {

            var result = e.target.result;
            var realData = "";
            //alert(result);
            //get number of entries for profile statistics
           // storeObject.numofEntriesSaved = result;

            if (result < 1) {
                //check to see if file exist

                $.getJSON(cordova.file.externalRootDirectory + "FavLocations/log.json").done(function (data) {

                    //insert data to indexedDB when there is no result showing up with the json file if file exist.
                    var transactions = db.transaction(["Positions"], "readwrite");

                    var stores = transactions.objectStore("Positions");

                    for (var i = 0; i < data.length; i++) {

                        //write to app from file
                        stores.put(data[i]);
                    }

                    window.location.href = "index.html";
                }).fail(function () {
                    console.log('no file found')
                });

            }

        }

        counting.onerror = function (e) {
            console.log(e);
        }

        displaySavedPositions();

    }


    openRequest.onerror = function (e) {
        db = e.target.result;


        //Do something for the error
    }

}, false);



//get profile Stats



/*---------------------------*/



/*------*/



function checklocationEnabled() {
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {

        cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
            console.log("Location is " + (enabled ? "enabled" : "disabled"));
            if (!enabled) {               
                alert("Please turn on your GPS and set it to \"High Accuracy\" mode");
                cordova.plugins.diagnostic.switchToLocationSettings();
            }
        }, function (error) {
            alert("The following error occurred: " + error);
            
        });

    }
}


function copyFilesToExternalAtStart() {
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        //ready image folder
        createImageFolderifNotExist(cordova.file.externalRootDirectory);
        //get the array and copy over the files
        returnFilesArray(cordova.file.externalRootDirectory + "FavLocations/");
        listfiles();
    }
}



function dateTime() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    if (minutes < 10) {
        minutes = "0" + today.getMinutes();
    }
    var seconds = today.getSeconds();
    if (seconds < 10) {
        seconds = "0" + today.getSeconds();
    }

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = mm + '/' + dd + '/' + yyyy + ' ' + hours + ':' + minutes + ':' + seconds;

    return today;
    //defining a position;
}

function countData() {

    var transaction = db.transaction(["Positions"], "readonly");

    var store = transaction.objectStore("Positions");

    var counting = store.count();

    counting.onsuccess = function (e) {
        
        var result = e.target.result;

        alert(result);

        return result;
    }

    counting.onerror = function (e) {
        console.log(e);
    }




}

function addPosition(e) {
    var Posdesc = $("#inPosdesc").val();
    var PosCoords = $("#hLatLong").html();

    console.log("trying to add" + Posdesc + "with coords of " + PosCoords);


    var transaction = db.transaction(["Positions"], "readwrite");
    var store = transaction.objectStore("Positions");


    position.desc = Posdesc;
    position.coords = PosCoords;
    position.created = dateTime();

    //performing add
    var request = store.add(position);

    request.onerror = function (e) {
       // alert("add failed");
        console.log("Error", e.target.error.name);
        //some type of error handler
    }

    request.onsuccess = function (e) {
        //if success go back to start page
        
       // alert("sucess");
        console.log("Woot! Did it");
        window.location.href = "index.html";
    }



}

function displaySavedPositions(e) {

    var jsonArray = [];
  
    var transaction = db.transaction(["Positions"], "readonly");

    var store = transaction.objectStore("Positions");
    var cursor = store.openCursor();
    
    var pString = "";
    var test;
  
    $("#ulViewAllPositions").html("");


    cursor.onerror = function (e) {
        console.log("Error", e.target.error.name);
    }

    cursor.onsuccess = function (e) {


        var result = e.target.result;

        if (result) {
       
            myobject.desc = result.value.desc;
            myobject.coords = result.value.coords;
            myobject.created = result.value.created;
            myobject.id = result.key;
         
            //pString += "<h2>"
            pString += "<li><a href='PositionView.html?id="+result.key+"' class='ui-btn ui-btn-icon-right ui-icon-carat-r' id='"+result.key+"'>";
          //  for(var field in result.value) {
            pString += "<b>" + result.value.desc + "</b>";
            pString += " (" + result.value.coords + " )";
            pString += "<div style=font-size:0.8em;>" + result.value.created + "</div>";
           // }
            pString += "</a></li>";
           

            //stringify each object
         jsonArray.push(JSON.stringify(myobject));
           
            result.continue();
     
        }
       
    

    }
    //when completing loop on top

    transaction.oncomplete = function (e) {
        var mainArray = [];
        //json parse back into object for each one to blob var
        for (var i = 0; i < jsonArray.length; i++) {
            var blob = JSON.parse(jsonArray[i]);
            
            console.log(blob);
            //push to array for each blob var that change
            mainArray.push(blob);
        }



        $("#ulViewAllPositions").html(pString);

        
        //write to file
        //write to file only if mainarray is greater than 0, and only retrieve from file if mainar
        if (mainArray.length > 0) {
            backupDB(mainArray);
        }
     
    }
 
}


function getPosition() {
    if (navigator.geolocation) {
        
        navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000, enableHighAccuracy:true } );
    }

    else {
        $('.mymessage').html("Navigation is not supported");
        document.getElementById("popit").click();
    }
}

function isindexDB() {
    var idbSupport = false;
    if ("indexedDB" in window) {
        idbSupport = true;

    }

    return idbSupport;
}



function onSuccess(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    $(".psaveButton").css("display", "block");
    $("#dvLocationInput").css("display", "block");
    $('.mymessage').html("Your location is: " + lat + ", " + lon);
    $('#hLatLong').html(lat + ", " + lon);

    var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&sensor=false";
    $.getJSON(url, function (data) {
        $("#dvAddressShow").html(data.results[0].formatted_address);
    });

    document.getElementById("popit").click();



}

function onError(error) {

    var txt;
    var r = confirm("Cannot detect your GPS. Select 'OK' to enter your own locations or select 'Cancel' to set your GPS on \"High Accuracy\" mode and retry.");
    if (r == true) {
        $(".psaveButton").css("display", "block");
        $("#dvLocationInput").css("display", "block");


        document.getElementById("popit").click();

    } else {
        cordova.plugins.diagnostic.switchToLocationSettings();
    }

   
    //ask if user want to add custom location anyway or go to plugin to check.

    
}


    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
//} )();

/**-------backup data and images**----------*/


/*----backup DB ------------- */

    function backupDB(data) {
        //create folder if not exist
        createImageFolderifNotExist(cordova.file.externalRootDirectory);

        //create textfile
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "FavLocations/", function (dir) {
            console.log("got the main directory", dir);
            dir.getFile("log.json", { create: true, exclusive:false }, gotFileEntry, fail); 
        });

        function gotFileEntry(fileEntry) {
            fileEntry.createWriter(gotFileWriter, fail);
        }

        function gotFileWriter(writer) {
            //console.log("about to write data: " +data)
            writer.write(data);
        }

        function fail(error) {
            console.log(error.code);
        }

    }

   

/*----backup images*---------------*//////

// start creating folder
    function createImageFolderifNotExist(copytopath) {
        window.resolveLocalFileSystemURL(
            copytopath,
            function (entry) {
                entry.getDirectory("FavLocations", { create: true, exclusive: false }, successCreateFolder, failCreateFolder)
            },
            successCreateFolder,
            failCreateFolder);

        function successCreateFolder(parent) {
            //  alert("create:" + parent.name)
             console.log(parent.fullPath);
         
        }
      

        function failCreateFolder(error) {
            alert("Unable to create new directory: " + error.code);
        }
    }




//store file name into an array and then loop through each, copy one by one
    function returnFilesArray(pathofImages) {
        var fail = function (err) { console.log(err) }
        var arrayFiles = [];

        window.resolveLocalFileSystemURL(
            cordova.file.externalCacheDirectory,
            function successCalltoImagePath(entry) {
                //success to path image and now read files in path image
                var directoryReader = entry.createReader();
                directoryReader.readEntries(
                    function readSuccess(entries) {
                        var i = 0;
                        for (i = 0; i < entries.length; i++) {
                            arrayFiles.push(cordova.file.externalCacheDirectory + entries[i].name);

                        }
                        $.each(arrayFiles, function (key, value) {
                            console.log(value);

                              window.resolveLocalFileSystemURL(
                              value,
                                  function (file) {
                                      window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "FavLocations/", function (destination) {
                                          file.copyTo(destination);
                                      }, fail)
                                  }, fail);

                        });
                      
                      
                    },
                    function readFailure(error) {
                        console.log(error.code);
                    });


            },
            function FailedCalltoImagePath(error) {
                console.log(error.code);
            }
                );

      //  return arrayFiles;
    }

    function listfiles() {
        var fail = function (err) { console.log(err) };
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "FavLocations/",
            function successList(parent) {
                var directoryReader = parent.createReader();

                // Get a list of all the entries in the directory
                directoryReader.readEntries(function (entries) {
                    var i = 0;
                    var count = 0;
                    for (i = 0; i < entries.length; i++) {
                        console.log(entries[i].name);
                        count++;
                    }
                  //  alert(count);
                }, fail)

            }, fail);
    }
