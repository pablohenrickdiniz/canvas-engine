define(['AppObject','IdGenerator'],function(AppObject){
    var Frame = function(options){
        var self = this;
        self.imageSets = [];
        self.soundEffect = null;
        self.parent = null;
        self.set(options);
    };

    Frame.prototype = new AppObject();

    Frame.prototype.toJSON = function(){
        var self = this;
        return {
            imageSets: self.imageSets.map(function(imageSet){return imageSet.toJSON();})
        };
    };

    Frame.prototype.removeImageSet = function(imageSet){
        var self = this;
        var index = self.imageSets.indexOf(imageSet);
        if(index !== -1){
            self.imageSets.splice(index,1);
        }
        return self;
    };

    return Frame;
});