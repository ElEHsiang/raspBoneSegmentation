function displayImg(){
//   $("#originImg").css('background-image', 'url(imageUpload/test.jpg)');
}

var file;
var fileReader;
var image;
var originCanvas;
var originContext;
var resultCanvas;
var resultContext;

function init(){
   originCanvas = $("#originCanvas")[0];
   originContext = originCanvas.getContext("2d");
   resultCanvas = $("#resultCanvas")[0];
   resultContext = resultCanvas.getContext("2d");
   image = new Image();
}

function uploadFile(){
   fileReader = new FileReader();
   fileReader.onload = openfile;

   file = $("#uploadImg")[0].files[0];
   readFileContent();
}

function openfile(event){
   image.src = event.target.result;
   image.onload = function(event){originContext.drawImage(image,0,0,image.width,image.height)};
}

function readFileContent(){
   fileReader.readAsDataURL(file);
}

// image process

function threshold(){
   var pixels;
   var resultImageData;
   var resultPixels;

   imageData = originContext.getImageData(0, 0, image.width, image.height);
   resultImageData = resultContext.createImageData(image.width, image.height);
   pixels = imageData.data;
   resultPixels = resultImageData.data;
   for(var i = 0; i < image.width; i++){
      for(var j = 0; j < image.height; j++){
         if(getIntensity(imageData.data, j, i) > 100){
            setIntensity(resultImageData.data, j, i, 255);
         }else{
            setIntensity(resultImageData.data, j, i, 0);
         }
      }
   }
   alert("threshold complete");
   resultContext.putImageData(resultImageData, 0, 0);
}

function mediumFilter(){
   var pixels;
   var resultImageData;
   var resultPixels;

   imageData = originContext.getImageData(0, 0, image.width, image.height);
   resultImageData = imageData;
   pixels = imageData.data;
   resultPixels = resultImageData.data;

   for(var i = 1; i < image.height - 1; i++){
      for(var j = 1; j < image.width - 1; j++){
         var value = midiumByWindow(pixels, j, i);
         setIntensity(resultImageData.data, j, i, value);
      }
   }
   
   alert("done medium");

   //resultImageData.data = resultPixels;
   resultContext.putImageData(resultImageData, 0, 0);
   //alert("display on result canvas!");
}

function midiumByWindow(image, x, y){
   var window = [getIntensity(image, x-1, y-1),
                 getIntensity(image, x-1, y),
                 getIntensity(image, x, y-1),
                 getIntensity(image, x+1, y+1),
                 getIntensity(image, x+1, y),
                 getIntensity(image, x, y+1),
                 getIntensity(image, x+1, y-1),
                 getIntensity(image, x-1, y+1),
                 getIntensity(image, x, y)
                 ];
   window.sort();
   return window[4];
}

function getIntensity(imageData, x, y){
   var r = imageData[image.width*y*4 + x*4];
   var g = imageData[image.width*y*4 + x*4 +1];
   var b = imageData[image.width*y*4 + x*4 +2];
   return (r + g + b)/3;
}

function setIntensity(imageData, x, y, value){
   imageData[image.width*y*4 + x*4] = value;
   imageData[image.width*y*4 + x*4 +1] = value;
   imageData[image.width*y*4 + x*4 +2] = value;
   imageData[image.width*y*4 + x*4 +3] = 255;
}
