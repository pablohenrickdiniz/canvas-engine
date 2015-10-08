require(['paths'],function(){
    requirejs.config({
        baseUrl:'../'
    });
    require(['CanvasEngine','jquery'],function(CanvasEngine,$){
        $(document).ready(function(){
            var GameEngine = CanvasEngine.createEngine({
                container:'#container',
                width:800,
                height:800
            });

            var layer = GameEngine.createLayer();



        });
    });
});