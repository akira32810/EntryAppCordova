
var db
var locationDetails = "";
var coords = "";
var lat = "";
var lng = "";

//this might change

   $(document).ready(function () {

  

       loadDetailPosition();

       getAddress();

       //load images in the position
       reloadAllFiles(cordova.file.externalRootDirectory + "FavLocations/");

       $("#btnEditSave").click(function () {

           SaveEditedPosition();

       });
       $("#btnDelLoc").click(function () {

           var txt;
           var r = confirm("Do you want to delete this location?");
           if (r == true) {
               DeletePosition();
           } else {
               
           }

          // DeletePosition();
       });
       
       //share locations

       $("#btnshareImage").click(function () {
       
           var url = 'http://maps.google.com/maps?z=12&t=m&q=loc:' + coords + '';

           //replace comma with + and space with no space
           url = url.replace(/,/g, '+').replace(/ /g, '');
           window.plugins.socialsharing.share(locationDetails, null, null, 'Location on map: '+url+'');


       });

       $("#btnTakePicture").click(function () {
            takePicture();
           //get latest file and rename it.
            
       });

   
});

   $('#dvlocationPictures').on('click', ' img', function () {
       //get source to send to next page
       var imageSource = $(this).attr('src');
       storeObject.srcImage = imageSource

   });



//get id from URL
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//load up the data from the ID

function loadDetailPosition(e) {

    var transaction = db.transaction(["Positions"], "readonly");

    var store = transaction.objectStore("Positions");


    var request = store.get(Number(storeObject.PosID));
    //storeObject.PosID
    request.onsuccess = function (e) {

        var result = e.target.result;
        if (result) {
            //display descriptions
            $("#inSavedPos").val(result.desc);

            $("#inSavedCoords").val(result.coords);

            //save for sharing and get to location
            locationDetails += "Location:" + result.desc + "\n";
            locationDetails += "Coordinates: " + result.coords;
            coords = result.coords;

            //getting seperate lat and longitude for the find location View
            storeObject.lat = result.coords.split(",")[0];
            storeObject.lng = result.coords.split(",")[1];
            
     
         //   alert($.isNumeric(storeObject.lat));
            
            //save for localstorage variables
            storeObject.locationDetails = locationDetails;
            storeObject.coords = coords;
            //go to this location button
            if ((navigator.platform.indexOf("iPhone") != -1)
            || (navigator.platform.indexOf("iPod") != -1)
            || (navigator.platform.indexOf("iPad") != -1)) {

                $("#btntakemehere").attr("href", "maps://maps.google.com/maps?daddr=" + coords + "&amp;ll=");
            }
            else {
                $("#btntakemehere").attr("href", "http://maps.google.com/maps?daddr=" + coords + "&amp;ll=");
            }

           
 
        }

        else {
            $("#inSavedPos").val("No Match record");
        }

    }

    request.onerror = function (e) {
        alert("Load details failed");
    }

}


function SaveEditedPosition(e) {
    var transaction = db.transaction(["Positions"], "readwrite");
    var store = transaction.objectStore("Positions");

    var request = store.get(Number(storeObject.PosID));

    request.onsuccess = function (e) {

        var res = request.result;
        
        res.desc =  $("#inSavedPos").val();
        res.coords =    $("#inSavedCoords").val();
        res.created = dateTime();
        
        //perform update
        var requestUpdate = store.put(res);

        requestUpdate.onerror = function (e) {
            alert("update failed");
        
        }

        requestUpdate.onsuccess = function (e) {
            alert("Update success");
            window.location.href = "index.html";

       
        }

    }

    request.onerror = function (e) {
        alert("error saving");
    }


}


function DeletePosition(e) {
    var transaction = db.transaction(["Positions"], "readwrite");
    var store = transaction.objectStore("Positions");

    var dataDelete = store.delete(Number(storeObject.PosID));

    dataDelete.onsuccess = function (e) {
        alert("Deleted!");
        window.location.href = "index.html";
    }

    dataDelete.onerror = function (e) {
        alert("Error, cannot delete position");
    }
}

function TakeMeHere(coords) {

    function myNavFunc() {
        // If it's an iPhone..
        if ((navigator.platform.indexOf("iPhone") != -1)
            || (navigator.platform.indexOf("iPod") != -1)
            || (navigator.platform.indexOf("iPad") != -1))
            window.open("maps://maps.google.com/maps?daddr=" + coords + "&amp;ll=");
        else
            window.location.href = "http://maps.google.com/maps?daddr=" + coords + "&amp;ll=";
    }
}



/*-----------pictures stuff---------------*/

//rename file
function moveTheFile(fileUri, newfilePath, newFileName) {
    window.resolveLocalFileSystemURL(
          fileUri,
          function (fileEntry) {
    
              newFileUri = newfilePath;
              oldFileUri = fileUri;
              fileExt = "." + oldFileUri.split('.').pop();
              
              console.log("new file uri:"  +newFileUri);
            
              window.resolveLocalFileSystemURL(newfilePath,
                      function (dirEntry) {
                          // move the file to a new directory and rename it
                          fileEntry.moveTo(dirEntry, newFileName, successCallback, errorCallback);
                         
                          //display the image
                          reloadAllFiles(cordova.file.externalRootDirectory + "FavLocations/");
                          console.log("new file name: "+newFileName);
                      },
                      errorCallback);
          },
          errorCallback);
}

function successCallback(entry) {
    console.log("New Path: " + entry.fullPath);
  //  alert("Success. New Path: " + entry.fullPath);
}

function errorCallback(error) {
    console.log("Error:" + error.code)
   // alert(error.code);
}

//read all images with common name and then reload images

function reloadAllFiles(filepath) {
    window.resolveLocalFileSystemURL(
        filepath,
        function (fileEntry) {
        
            var directoryReader = fileEntry.createReader();
            directoryReader.readEntries(gotList, filereadError);
        },
        filereadError);
}


function gotList(entries) {
    var i;
    $("#dvlocationPictures").html("");
    for (i = 0; i < entries.length; i++) {
        if (entries[i].name.indexOf("ID" + storeObject.PosID) != -1 && entries[i].name.indexOf(".jpg") != -1) {
            
                 //alert(entries[i].fullPath);
            $("#dvlocationPictures").append("<a href='displayFullImage.html'><img src='" + cordova.file.externalRootDirectory + "FavLocations/" + entries[i].name + "' alt='stored images' style='width:100px; height:100px;' class='imgSmall'/></a>");
         //   console.log(entries[i].name);
        }
    }
}



function filereadError(error) {
    alert("Failed to list directory contents: " + error.code);
}

function takePicture() {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 75,
        //work on android but it kept 2 pictures instead.
        //allowEdit: true,
          destinationType: Camera.DestinationType.FILE_URI,
        //destinationType: Camera.DestinationType.DATA_URL,
          targetWidth: 1024,
          targetHeight: 768,
        sourceType: Camera.PictureSourceType.CAMERA
        

    });

    function onSuccess(imageURI) {
        var str = imageURI;
       // var filePathimg = str.substring(0, str.lastIndexOf("/") + 1);
        var filePathimg = cordova.file.externalRootDirectory + "FavLocations/";
        var imgname = str.substring(str.lastIndexOf("/") + 1, str.length);
      
        //rename image after sucess
        moveTheFile(imageURI, filePathimg, "ID" + storeObject.PosID + "_" + imgname);

       
        //var image = document.getElementById('imgTaken');
        //image.src = imageURI;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

}

/*----- get address *----- */

function getAddress() {
    //var latlng = "55.397563, 10.39870099999996";


    var transaction = db.transaction(["Positions"], "readonly");

    var store = transaction.objectStore("Positions");

        var request = store.get(Number(storeObject.PosID));
        //storeObject.PosID
        request.onsuccess = function (e) {

            var result = e.target.result;
            if (result) {
                var latlng = result.coords;

                var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng + "&sensor=false";
                $.getJSON(url, function (data) {

                    //console.log(data);
                   // alert(data.results[0].formatted_address);
                   
                    $("#dvAddress").html(data.results[0].formatted_address);
                    //save current address to global variable
                    storeObject.locAdd = data.results[0].formatted_address;

                });


            }


        }

        request.onerror = function (e) {
            alert("Load details failed");
        }

    
}

        //alert(data);
       
