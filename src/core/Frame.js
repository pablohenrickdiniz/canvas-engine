define(['PropsParser','IdGenerator'],function(Parser,IdGenerator){
    var Frame = function(options){
        var self = this;
        options = options == undefined?{}:options;
        self.imageSets = [];
        self.soundEffect = null;
        self.parent = null;
        self.set(options);
    };

    Frame.prototype.set = function(options){
        var self = this;
        self.imageSets = Parser.parseArray(options.imageSets,self.imageSets);
        return self;
    };

    Frame.prototype.toJSON = function(){
        var self = this;
        return {
            imageSets: self.imageSets.map(function(imageSet){return imageSet.toJSON();})
        }
    };

    Frame.prototype.removeImageSet = function(imageSet){
        var self = this;
        var index = self.imageSets.indexOf(imageSet);
        if(index != -1){
            self.imageSets.splice(index,1);
        }
        return self;
    };

    return Frame;
});