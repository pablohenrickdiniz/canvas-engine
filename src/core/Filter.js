define(['Color'],function(Color) {
    return {
        filterList:[],
        filtering:false,
        canvas:null,
        context:null,
        /*
         cria um elemento canvas temporário
         HTMLCanvasElement : getCanvas(int width, int height)
         */
        getCanvas: function (w, h) {
            var self = this;
            if(self.canvas == null){
                self.canvas = document.createElement('canvas');
                self.canvas.width = w;
                self.canvas.height = h;
            }
            else{
                if(w != undefined && self.canvas.width != w){
                    self.canvas.width = w;
                }

                if(h != undefined && self.canvas.height != h){
                    self.canvas.height = h;
                }
            }
            return self.canvas;
        },
        /*
         Array[] : getPixels(HTMLImage image)
         obtém os pixels da imagem
         */
        getPixels: function (img) {
            var c = this.getCanvas(img.width, img.height);
            var ctx = c.getContext('2d');
            ctx.drawImage(img,0,0);
            return ctx.getImageData(0, 0, img.width, img.height);
        },
        /*
         void: applyFilter(function filter, HTMLImage img)
         aplica o filtro na imagem
         */
        createImageData:function(w,h) {
            return this.getCanvas(w,h).getContext('2d').createImageData(w,h);
        },
        applyFilter: function (filter, image,args,callback) {
            var self = this;
            if(!self.filtering){
                self.filtering = true;
                var args = [this.getPixels(image)].concat(args);
                var imageData = filter.apply(self, args);
                var canvas = self.getCanvas(imageData.width,imageData.height);
                var ctx = canvas.getContext('2d');
                ctx.putImageData(imageData,0,0);
                var url = canvas.toDataURL('image/png');
                var img = document.createElement('img');
                img.onload = function(){
                    callback(img);
                };
                img.src = url;
                self.filtering = false;
                if(self.filterList.length > 0){
                    var filter_args = self.filterList.shift();
                    self.applyFilter.apply(self,filter_args);
                }
            }
            else{
                self.filterList.push([filter,image,args,callback]);
            }
        },
        removeColor:function(imageData,color){
            var self = this;
            var data = imageData.data;
            var size =data.length;
            for(var i = 0; i < size;i+=4){
                if(data[i+3] != 0 && data[i] == color.red && data[i+1] == color.blue && data[i+2] == color.green){
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                    data[i + 3] = 0;
                }
            }
            return imageData;
        },
        trim:function(imageData){
            var self = this;
            var data = imageData.data;
            var size =data.length;
            var top = null;
            var left = null;
            var right = null;
            var bottom = null;
            var x = 0;
            var y = 0;

            for (var i = 0; i < size; i += 4) {
                if (data[i+3] !== 0) {
                    x = (i / 4) % imageData.width;
                    y = ~~((i / 4) / imageData.width);

                    if (top === null) {
                        top = y;
                    }

                    if (left === null) {
                        left = x;
                    } else if (x < left) {
                        left = x;
                    }

                    if (right === null) {
                        right = x;
                    } else if (right < x) {
                        right = x;
                    }

                    if (bottom === null) {
                        bottom = y;
                    } else if (bottom < y) {
                        bottom = y;
                    }
                }
            }
            var height = bottom - top;
            var width  = right - left;
            return {x:left,y:top,width:width,height:height};
        },
        convolute : function(pixels, weights, opaque) {
            var side = Math.round(Math.sqrt(weights.length));
            var halfSide = Math.floor(side/2);
            var src = pixels.data;
            var sw = pixels.width;
            var sh = pixels.height;
            // pad output by the convolution matrix
            var w = sw;
            var h = sh;
            var output = this.createImageData(w, h);
            var dst = output.data;
            // go through the destination image pixels
            var alphaFac = opaque ? 1 : 0;
            for (var y=0; y<h; y++) {
                for (var x=0; x<w; x++) {
                    var sy = y;
                    var sx = x;
                    var dstOff = (y*w+x)*4;
                    // calculate the weighed sum of the source image pixels that
                    // fall under the convolution matrix
                    var r=0, g=0, b=0, a=0;
                    for (var cy=0; cy<side; cy++) {
                        for (var cx=0; cx<side; cx++) {
                            var scy = sy + cy - halfSide;
                            var scx = sx + cx - halfSide;
                            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                var srcOff = (scy*sw+scx)*4;
                                var wt = weights[cy*side+cx];
                                r += src[srcOff] * wt;
                                g += src[srcOff+1] * wt;
                                b += src[srcOff+2] * wt;
                                a += src[srcOff+3] * wt;
                            }
                        }
                    }
                    dst[dstOff] = r;
                    dst[dstOff+1] = g;
                    dst[dstOff+2] = b;
                    dst[dstOff+3] = a + alphaFac*(255-a);
                }
            }
            return output;
        },
        invert: function (imageData) {
            var data = imageData.data;
            for (var i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];     // red
                data[i + 1] = 255 - data[i + 1]; // green
                data[i + 2] = 255 - data[i + 2]; // blue
            }
            return imageData;
        }
    }
});
