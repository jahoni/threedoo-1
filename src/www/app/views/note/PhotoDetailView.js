templates.photoDetailView = "app/views/note/PhotoDetailView.html";

window.PhotoDetailView = Backbone.View.extend({

    title: "Photo Detail",
    backLabel:" ",
    scroll:false,
    activeCenter: {x:0,y:0},
    activeDistance: 0,
    pendingCenter: {x:0,y:0},
    pendingDistance: 0,
    imagePosition: {x:0,y:0},
    imageDimensions: {w:0,h:0},
    imageScale: 1,
    targetFPS: 1000/30,

    initialize: function(options) {

        if ( options.model ) {
            this.model = options.model;
        }

        this.imagePosition.x = 0;
        this.imagePosition.y = 0;
        this.imageScale = 1;

        this.render();
        this.view = this.$el;

        this.bindExtraEvents();

        //  var vendorPrefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-", "-khtml-"];
    },

    //"gesturestart #photoContainer":"onGestureStart",
    //
    events:{
        "touchstart #photoContainer":"onTouchStart"
    },

    bindExtraEvents: function() {

        var self = this;
        this.touchMoveHandler = function(event){
            self.onTouchMove(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        this.touchEndHandler = function(event){
            self.onTouchEnd(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        };

        this.headerActions.bind("click", function(event){
            self.onDeleteButtonTap(event);
        } )
    },

    onDeleteButtonTap: function(event) {

        var self;
        var callback = function() {
            alert("deleted");
            window.viewNavigator.popView();
        }

        window.DatabaseManager.instance.deletePhoto(this.model, callback);
    },

    render:function (eventName) {
        var template = templates.photoDetailView;
        this.$el.html(template(this.model));
        this.photo = this.$el.find("#photo");
        this.imageContainer = this.$el.find("#imageContainer");

        this.headerActions = $("<a class='deletePhoto'> </a>");


        var win = $(window);
        var photo = this.photo.get(0);

        /*
        var hAspect = win.width / photo.naturalWidth;
        var vAspect = win.height / photo.naturalHeight;

        if ( hAspect < vAspect ) {
            this.imageScale = hAspect
        }
        else
        {
            this.imageScale = vAspect
        }
        */
        this.update();


        //this.canvas = this.$el.find("#canvas") ;

        /*
        this.photo.css({
            left: this.imagePosition.x + "px",
            top: this.imagePosition.y + "px",
            width: "300px"
        });

        */

        /*
        this.canvas = this.$el.find("#canvas") ;



        var w = $(window);
        console.log( w.width(), w.height() )
        this.canvas.attr( "width", w.width() );
        this.canvas.attr( "height", w.height() - 45 );
        //this.canvas.height( w.height() - 45 );


        var canvas = this.canvas.get(0);
        var ctx = canvas.getContext('2d');
        ctx.canvas.width  = canvas.width;
        ctx.canvas.height  = canvas.height;

        this.renderCanvas();
        */

    },

    onGestureStart: function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    },

    onTouchStart: function(event) {

        var self = this;
        self.setDefaultState(event);


        if ( event.originalEvent != undefined ) {
            event = event.originalEvent;
        }
        if ( event.targetTouches.length == 1 ) {

            clearInterval( self.animationInterval );
            self.animationInterval = setInterval( function() {
                self.update();
            }, self.targetFPS);
            $(window).bind( "touchmove", self.touchMoveHandler );
            $(window).bind( "touchend", self.touchEndHandler );
        }

        this.updatePendingData(event);
        event.preventDefault();
        event.stopPropagation();
        return false;
    },


    onTouchMove: function(event) {
        this.updatePendingData(event);
        event.preventDefault();
        event.stopPropagation();
        return false;
    },

    onTouchEnd: function(event) {
        var self = this;
        self.setDefaultState(event);

        if ( event.originalEvent != undefined ) {
            event = event.originalEvent;
        }
        if ( event.targetTouches.length <= 0 ) {
            clearInterval( self.animationInterval );
            $(window).unbind( "touchmove", self.touchMoveHandler );
            $(window).unbind( "touchend", self.touchEndHandler );
        }
        this.updatePendingData(event);
        event.preventDefault();
        event.stopPropagation();
        return false;
    },

    setDefaultState: function(event) {
        this.updateActiveData(event);
        this.updatePendingData(event);
    },

    updateActiveData: function(event) {
        this.activeCenter = this.calculateCenter( event );
        this.activeDistance = this.calculateAverageDistanceBetweenTouches( event, this.activeCenter );
    },

    updatePendingData: function(event) {
        this.pendingCenter = this.calculateCenter( event );
        this.pendingDistance = this.calculateAverageDistanceBetweenTouches( event, this.pendingCenter );
    },

    calculateCenter: function(event) {
        var x = 0, y = 0;

        if ( event.originalEvent != undefined ) {
            event = event.originalEvent;
        }

        if ( event.touches != undefined && event.touches.length > 0) {
            for (var i=0; i<event.touches.length; i++) {
                var touch = event.touches[i];
                x += touch.screenX;
                y += touch.screenY;
            }

            x = x/event.touches.length;
            y = y/event.touches.length;
        }

        return {x:x,y:y};
    },

    calculateAverageDistanceBetweenTouches: function(event, center) {
        var dist = 0;

        if ( event.originalEvent != undefined ) {
            event = event.originalEvent;
        }

        //console.log (event.touches.length)
        if ( event.touches != undefined && event.touches.length > 1 ) {
            for (var i=0; i<event.touches.length; i++) {
                var touch = event.touches[i];
                //console.log ({x:touch.screenX, y:touch.screenY});
                dist += this.calculateDistance(
                    {x:touch.screenX, y:touch.screenY},
                    center );
            }

            dist = dist/event.touches.length;
        }

        //console.log ('calculateAverageDistanceBetweenTouches')
        //console.log(dist);
        return dist;
    },

    calculateDistance: function( a, b ) {

        var _x = Math.pow(b.x - a.x, 2);
        var _y = Math.pow(b.y - a.y, 2);

        //console.log ('calculateDistance')
        //console.log (x)
        //console.log (y)
        var result = Math.sqrt( _x + _y );
        //console.log(result);

        return result;
    },

    onPhotoLoad: function(event) {

        var img = $(event.target);
        this.imageDimensions = {
            w: img.naturalWidth,
            h: img.height()
        }
        //this.renderCanvas();
        //EXIF.getData( event.target );
        //console.log( EXIF.pretty( event.target ));
    },

    update: function() {

        var diff = {
            x: (this.pendingCenter.x - this.activeCenter.x),
            y: (this.pendingCenter.y - this.activeCenter.y)
        }

        if( diff.x != 0 || diff.y != 0 ) {
            this.imagePosition.x += diff.x;
            this.imagePosition.y += diff.y;
        }


        var scale = 1;
        if ( this.activeDistance != 0 && this.pendingDistance != 0 ) {
            scale = this.pendingDistance/this.activeDistance;

            if( scale != 1) {
                var oldScale = this.imageScale;

                scale =  this.imageScale * scale;

                scale = Math.min( scale, 1.5 );
                scale = Math.max( scale, 0.025 );

                if ( oldScale != scale ) {
                    var photo = this.photo.get(0);
                    var win = $(window);

                    var oldW = photo.naturalWidth * oldScale;
                    var oldH = photo.naturalHeight * oldScale;

                    var newW = photo.naturalWidth * scale;
                    var newH = photo.naturalHeight * scale;

                    var diffW = (newW - oldW);
                    var diffH = (newH - oldH);

                    var pctX = this.pendingCenter.x / win.width();
                    var pctY = this.pendingCenter.y / win.height();

                    /*
                    var _x = -this.imagePosition.x+this.pendingCenter.x;
                    var _y = -this.imagePosition.y+this.pendingCenter.y;

                    //translate(-originPoint); scale(s); translate(originPoint);

                    var _x = -this.imagePosition.x+this.pendingCenter.x;
                    var _y = -this.imagePosition.y+this.pendingCenter.y;

                    _x /= scale;
                    _y /= scale;

                    _x -= this.pendingCenter.x;
                    _y -= this.pendingCenter.y;

                    _x *= scale;
                    _y *= scale;

                    this.imagePosition.x  = -_x;
                    this.imagePosition.y  = -_y;
                                           */
                   this.imagePosition.x += pctX*(diffW)/4;
                   this.imagePosition.y +=  pctY*(diffH)/4;

                      /*

                    var newW = photo.naturalWidth * scale;
                    var newH = photo.naturalHeight * scale;

                    var _x = this.imagePosition.x
                    var _y = this.imagePosition.y


                    this.imagePosition.x += _x * (newW - photo.naturalWidth) / newW
                    this.imagePosition.y += _y * (newH - photo.naturalHeight) / newH
                           */

                    /*
                    //convert to normalized scale (based on old scale)
                    var imageX = (this.imagePosition.x+this.pendingCenter.x)/oldScale;   //oldScale?
                    var imageY = (this.imagePosition.y+this.pendingCenter.y)/oldScale;

                    //convert to new scale
                    imageX = imageX * scale;
                    imageY = imageY * scale;

                    imageX -= this.pendingCenter.x*scale;
                    imageY -= this.pendingCenter.y*scale;

                    //assign to image
                    this.imagePosition.x = imageX;
                    this.imagePosition.y = imageY;

                    */


                    this.imageScale = scale;
                }

            }
        }


        if ( this.imagePosition == null || isNaN(diff.y) || isNaN(diff.y) ) {
            console.log("wtf null")
        }   else {
          //  console.log( this.imagePosition )
        }


        this.$el.find("#focal").css({
            top: (this.pendingCenter.y-55) + "px",
            left: (this.pendingCenter.x-10) + "px"
        })

        //var cssOrigin = this.pendingCenter.x*this.imageScale +"px " +this.pendingCenter.y*this.imageScale +"px";

        //props[vendor +"transform-origin"] = cssOrigin;

        var css = ' translate3d(' + this.imagePosition.x + "px, " + this.imagePosition.y + 'px,0) scale(' + this.imageScale + ')';
        this.imageContainer.css('-webkit-transform', css );
           // '-webkit-transform-origin': cssOrigin

        //console.log( css )
        //}


        this.activeCenter = this.pendingCenter;
        this.activeDistance = this.pendingDistance;
    }

    /*,

    renderCanvas: function() {
        var canvas = this.canvas.get(0);
        var ctx = canvas.getContext('2d');


        var img=this.photo.get(0);

        ctx.clearRect(0,0,canvas.width, canvas.height);
        var w = img.width * this.imageScale;
        var h = img.height * this.imageScale;
        ctx.drawImage(img, this.imagePosition.x,  this.imagePosition.y, w, h );

    } */







});