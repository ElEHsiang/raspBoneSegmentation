function displayImg(){
//   $("#originImg").css('background-image', 'url(imageUpload/test.jpg)');
}

var file;
var fileReader;
var image;
var resultImage;
var originCanvas;
var originContext;
var resultCanvas;
var resultContext;

function init(){
   originCanvas = $("#originCanvas")[0];
   originContext = originCanvas.getContext("2d");
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
   image.onload = function(event){originContext.drawImage(image,0,0, image.width, image.height, 0, 0, 800, 600)};
}

function readFileContent(){
   fileReader.readAsDataURL(file);
}

// image process
function mediumFilter(){
   var pixels;

   imageData = originContext.getImageData(0, 0, image.width, image.height);
   pixels = imageData.data;
   alert(getIntensity(pixels, 0, 0));
   setIntensity(pixels, 0, 0, 100);
   alert(getIntensity(pixels, 0, 0));

   //for(var i = 0; i <>)
}

function getIntensity(image, x, y){
   return image[x*y*4 + (x+1)*4 -1];
}

function setIntensity(image, x, y, value){
   image[x*y*4 + (x+1)*4 -1] = value;
}
