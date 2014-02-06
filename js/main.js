
var file;
var fileReader;
var image;
var compareImage;
var originCanvas;
var originContext;
var resultCanvas;
var resultContext;
var compareCanvas;
var compareContext;
var segX;
var segY;
var pointStack;
var mark;
var gradient;
var maxGradient
function init(){
   originCanvas = $("#originCanvas")[0];
   originContext = originCanvas.getContext("2d");
   resultCanvas = $("#resultCanvas")[0];
   resultContext = resultCanvas.getContext("2d");
   compareCanvas = $("#compareCanvas")[0];
   compareContext = compareCanvas.getContext("2d");
   image = new Image();
   compareImage = new Image();
   pointStack = new Array();
   mark = new Array(600);
   for(var i = 0; i < 600; i++){
      mark[i] = new Array(600);
   }

   gradient = new Array(600);
   for(var i = 0; i < 600; i++){
      gradient[i] = new Array(600);
   }

   for(var i = 0; i < 600; i++){
      for(var j = 0; j < 600; j++){
         gradient[i][j] = 0;
         mark[i][j] = 0;
      }
   }
   
   var canvas = $("#originCanvas")[0];
   canvas.addEventListener('mousedown', function(evt){
   getMousePos(canvas,evt);
   }, false);
}

function uploadFile(){
   fileReader = new FileReader();
   fileReader.onload = openfile;

   file = $("#uploadImg")[0].files[0];
   readFileContent();
}

function uploadCompareFile(){
   fileReader = new FileReader();
   fileReader.onload = openCompareFile;

   file = $("#uploadCompareImg")[0].files[0];
   readFileContent();
}

function openfile(event){
   image.src = event.target.result;
   image.onload = function(event){originContext.drawImage(image,0,0,image.width,image.height);
                                  resultContext.drawImage(image,0,0,image.width,image.height);
                                  };
}

function openCompareFile(event){
   compareImage.src = event.target.result;
   compareImage.onload = function(event){
                           compareContext.drawImage(compareImage,0,0,compareImage.width,compareImage.height)
   };
}

function readFileContent(){
   fileReader.readAsDataURL(file);
}

// image process

function gradientMap(){
   calculateGradient();

}
function threshold(){
   var pixels;
   var resultImageData;
   var resultPixels;
   

   moveData = resultContext.getImageData(0, 0, image.width, image.height);
   originContext.putImageData(moveData, 0, 0);

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

   moveData = resultContext.getImageData(0, 0, image.width, image.height);
   originContext.putImageData(moveData, 0, 0);

   imageData = originContext.getImageData(0, 0, image.width, image.height);
   resultImageData = resultContext.createImageData(image.width, image.height);
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

function segmentation(){
   //alert(segX + "\n" + segY);
   var pixels;
   var resultImageData;
   var resultPixels;


   imageData = originContext.getImageData(0, 0, image.width, image.height);
   resultImageData = resultContext.createImageData(image.width, image.height);
   pixels = imageData.data;
   resultPixels = resultImageData.data;

   pointStack = new Array();
   for(var i = 0; i < 600; i++){
      for(var j = 0; j < 600; j++){
         mark[i][j] = 0;
      }
   }
   alert("start from " + segX + "  " + segY);
   pointStack.push(createPoint(parseInt(segX),parseInt(segY)));
   regionGrowing("bone");

   for(var j = 0; j < image.height; j++){
      for(var i = 0; i < image.width; i++){
         if(mark[j][i] == 1){
            drawRed(resultImageData.data, i, j);
         }else{
            setIntensity(resultImageData.data, i,j, getIntensity(imageData.data,i ,j));
         }
      }
   }
   resultContext.putImageData(resultImageData, 0, 0);

   alert("cut edge");

   regionGrowing("edge");

   for(var j = 0; j < image.height; j++){
      for(var i = 0; i < image.width; i++){
         if(mark[j][i] == 2){
            drawRed(resultImageData.data, i, j);
         }else{
            setIntensity(resultImageData.data, i,j, getIntensity(imageData.data,i ,j));
         }
      }
   }
   resultContext.putImageData(resultImageData, 0, 0);

}
//sub function
function calculateGradient(){
   
   var pixels;
   var resultImageData;
   var resultPixels;
   maxGradient = 0;
   
   imageData = originContext.getImageData(0, 0, image.width, image.height);
   for(var j = 1; j < image.height - 1; j++){
      for(var i = 1; i < image.width - 1; i++){
         gradient[j][i] = Math.abs(getIntensity(imageData.data,i+1,j) - getIntensity(imageData.data,i-1,j)) + Math.abs(getIntensity(imageData.data,i,j+1) - getIntensity(imageData.data,i,j-1));
         if(gradient[j][i] > maxGradient){
            maxGradient = gradient[j][i];
         }
      }
   }
   alert("done gradient");
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

function regionGrowing(type){
   
   var gradientThreshold = maxGradient * 0.3;
   var imageData;

   imageData = originContext.getImageData(0, 0, image.width, image.height);
   if(type == "bone"){
   while(pointStack.length > 0){
   
   var point = pointStack.pop();

   if(point.x > 512 || point.x < 0 || point.y > 512 || point.y < 0){
      alert("out of range");
   }

   if(mark[point.y][point.x] == 0 && gradient[point.y][point.x] <= 55 && getIntensity(imageData.data, point.x, point.y) > 190){
      mark[point.y][point.x] = 1;
      pointStack.push(createPoint(point.x+1, point.y));
      pointStack.push(createPoint(point.x, point.y+1));
      pointStack.push(createPoint(point.x-1, point.y));
      pointStack.push(createPoint(point.x, point.y-1));
   }
   }
   }else if(type == "edge"){

   /*   
   for(var i = 0; i < 600; i++){
      for(var j = 0; j < 600 -1; j++){
         if(mark[i][j+1] == 1){
            mark[i][j] = 2;
            break;
         }
      }
   }
   for(var i = 0; i < 600; i++){
      for(var j = 600-1; j > 0; j--){
         if(mark[i][j-1] == 1){
            mark[i][j] = 2;
            break;
         }
      }
   }
   for(var i = 0; i < 600; i++){
      for(var j = 0; j < 600 -1; j++){
         if(mark[j+1][i] == 1){
            mark[j][i] = 2;
            break;
         }
      }
   }
   for(var i = 0; i < 600; i++){
      for(var j = 600-1; j > 0; j--){
         if(mark[j-1][i] == 1){
            mark[j][i] = 2;
            break;
         }
      }
   }*/
   /*
   for(var i = 0; i < 600; i++){
      for(var j = 0; j < 600; j++){
         if(getIntensity(imageData.data, i, j) > 50){
            pointStack.push(createPoint(i, j));
         }
      }
   }*/
   pointStack.push(createPoint(100, 100));
   
   while(pointStack.length > 0){
      var point = pointStack.pop();

      if(point.x+1 > 512 || point.x-1 < 0 || point.y+1 > 512 || point.y-1 < 0){
      }else{

      if(mark[point.y][point.x] == 0){
            if(mark[point.y+1][point.x] == 1 ||
               mark[point.y-1][point.x] == 1 ||
               mark[point.y][point.x+1] == 1 ||
               mark[point.y][point.x-1] == 1){
                  mark[point.y][point.x] = 2;
            }else{
                  mark[point.y][point.x] = 3;
                  pointStack.push(createPoint(point.x+1, point.y));
                  pointStack.push(createPoint(point.x, point.y+1));
                  pointStack.push(createPoint(point.x-1, point.y));
                  pointStack.push(createPoint(point.x, point.y-1));
            }
         }
      }
   }
   }
   alert("done region growing");
}

//getter
function getIntensity(imageData, x, y){
   var r = imageData[image.width*y*4 + x*4];
   var g = imageData[image.width*y*4 + x*4 +1];
   var b = imageData[image.width*y*4 + x*4 +2];
   return (r + g + b)/3;
}

//setter
function setIntensity(imageData, x, y, value){
   imageData[image.width*y*4 + x*4] = value;
   imageData[image.width*y*4 + x*4 +1] = value;
   imageData[image.width*y*4 + x*4 +2] = value;
   imageData[image.width*y*4 + x*4 +3] = 255;
}

function drawRed(imageData, x, y){
   imageData[image.width*y*4 + x*4] = 255;
   imageData[image.width*y*4 + x*4 +1] = 0;
   imageData[image.width*y*4 + x*4 +2] = 0;
   imageData[image.width*y*4 + x*4 +3] = 255;

}

//mouse event
function getMousePos(canvas, evt){
   var rect = canvas.getBoundingClientRect();
   segX = evt.clientX - rect.left;
   segY = evt.clientY - rect.top;
}

//class

function createPoint(x, y){
   var point = new Object(); 
   point.x = x;
   point.y = y;
   return point;
}
