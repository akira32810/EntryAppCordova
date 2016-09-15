$(document).ready(function () {

    //load image object from requested click on positionView page

    $("#imgFullImg").attr('src', storeObject.srcImage);
  

//image zooming
    $("#imgFullImg").panzoom({
        easing: "ease-in-out",
        transition: true,
        contain: false,
        increment: 0.3
    });

    //  FullScreenImage.showImageURL(storeObject.srcImage);

   // getlocalfileSystem();
   
    $("#btnDeleteImage").click(function () {


        var r = confirm("Do you want to delete this image");
        if (r == true) {
            deleteCurrentImage();
            window.history.go(-1);
        } else {

        }

    });

    //
    $("#btnshareImageFull").click(function () {
        var url = 'http://maps.google.com/maps?z=12&t=m&q=loc:' + storeObject.coords + '';

        //replace comma with + and space with no space
        url = url.replace(/,/g, '+').replace(/ /g, '');
        window.plugins.socialsharing.share(storeObject.locationDetails, null, storeObject.srcImage, 'Location on map: ' + url + '');

    });

});




function deleteCurrentImage() {
    window.resolveLocalFileSystemURL(
        //file location
        storeObject.srcImage,
        function (fileEntry) {

            fileEntry.remove(successRemoved, failedRemove)
        },
        failedRemove);
}

function successRemoved(entry) {
    alert("Image Deleted");
}

function failedRemove(error) {
    alert('Error removing file: ' + error.code);
}