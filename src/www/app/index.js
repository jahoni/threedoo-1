/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {

        window.FileUtil.initialize();

        //Setup the ViewNavigator
        loadTemplates( app.templatesLoaded );
    },

    templatesLoaded: function() {
        $("body").empty();

        //new FastClick(document.body);

        var listView= new HomeView();

        window.viewNavigator = new ViewNavigator( 'body' );
        window.viewNavigator.pushView( listView );

        //initialize database
        new DatabaseManager();

        //document.addEventListener("backbutton", onBackKey, false);
    }
};

function killEvent(event) {

    event.preventDefault;
    event.stopPropagation();
    if (event.stopImmediatePropagation) {
        event.stopImmediatePropagation();
    }
    return false;
}

window.lastTouchTime = 0;
window.TouchHandler = function (target, listener, useCapture){
    var self = this;
    this.target = target;
    this.useCapture = useCapture;
    this.MAX_TAP_FLOAT = 8;
    this.MAX_TAP_TIME = 400;
    this.MIN_ELAPSED_TIME = 350;


    var touch = ('ontouchstart' in window);
    this.START_EVENT = touch ? "touchstart" : "mousedown";
    this.MOVE_EVENT  = touch ? "touchmove" : "mousemove";
    this.END_EVENT  = touch ? "touchend" : "mouseup";

    this.destroy = function() {
        self.target.removeEventListener( self.START_EVENT, self.touchStart );
        self.target.removeEventListener( self.MOVE_EVENT, self.touchMove );
        self.target.removeEventListener( self.END_EVENT, self.touchEnd );
        self.target = undefined;
    }

    this.touchStart = function( event ) {
        var element = $(event.target);
        element.addClass("active");
        var id = element.attr("id");
        self.startTime = new Date().getTime();

        //console.log(event.type + " " + id + " " + self.startTime.toString())

        var touchItem = (event.targetTouches == undefined) ? event : event.targetTouches[0];
        self.startX = touchItem.pageX;
        self.startY = touchItem.pageY;
        self.endX = touchItem.pageX;
        self.endY = touchItem.pageY;

        if ( event.targetTouches == undefined || event.targetTouches.length == 1 ) {
            self.target.removeEventListener( self.START_EVENT, self.touchStart );
            self.target.addEventListener( self.MOVE_EVENT, self.touchMove, false );
            self.target.addEventListener( self.END_EVENT, self.touchEnd, false );
        }

        //return self.killEvent(event);
    }

    this.touchMove = function( event ) {
        var element = $(event.target);
        var id = element.attr("id");

        var touchItem = (event.targetTouches == undefined) ? event : event.targetTouches[0];
        self.endX = touchItem.pageX;
        self.endY = touchItem.pageY;
    }

    this.touchEnd = function( event ) {
        var element = $(event.target);
        element.removeClass("active");
        var id = element.attr("id");
        var now = new Date().getTime();
        var diff = now - self.startTime;


        if ( event.targetTouches == undefined ||event.targetTouches.length <= 0 ) {
            self.target.addEventListener( self.START_EVENT, self.touchStart, false );
            self.target.removeEventListener( self.MOVE_EVENT, self.touchMove );
            self.target.removeEventListener( self.END_EVENT, self.touchEnd );
        }

        if ( diff < self.MAX_TAP_TIME ) {

            if ( event.targetTouches == undefined || event.targetTouches.length > 0 ) {

                var touchItem = (event.targetTouches == undefined) ? event : event.targetTouches[0];
                self.endX = touchItem.pageX;
                self.endY = touchItem.pageY;
            }

            var diffX = Math.abs( self.startX - self.endX );
            var diffY = Math.abs( self.startY - self.endY );

            //alert(diffX + ", " +diffY)
            if ( diffX <= self.MAX_TAP_FLOAT && diffY <= self.MAX_TAP_FLOAT ) {

                if (window.lastTouchTime - now < self.MIN_ELAPSED_TIME) {
                    window.lastTouchTime = now;

                    //the timeout is to prevent duplicate touch events (this does happen)
                    //but shorter than 300 ms delay by operating system
                    clearTimeout(self.triggerTimeout);
                    //self.triggerTimeout = setTimeout(function(){
                        //console.log("touchend " + id + " " + self.startTime.toString())
                        //element.trigger("tap");

                        // Synthesise a click event, with an extra attribute so it can be tracked
                        var clickEvent = document.createEvent('MouseEvents');
                        clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
                        clickEvent.forwardedTouchEvent = true;
                        element.get(0).dispatchEvent(clickEvent);
                          console.log("dispatched")
                    //}, 50);
                }

                return killEvent(event);
            }
        }
        //return self.killEvent(event);
    }

    target.addEventListener( self.START_EVENT, self.touchStart, false );
    //return;//self.killEvent(event);
}




if ( 'ontouchstart' in window) {

    HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
    HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;

    HTMLElement.prototype.addEventListener = function (type, listener, useCapture) {

        //console.log("addEventListener:" + type)
        if ( type == "click") {
            var th = new TouchHandler( this, listener, useCapture );
            jQuery.data( this, "tapHandler", th );
        }
        this.__addEventListener( type, listener, useCapture );
    }

    HTMLElement.prototype.removeEventListener = function (type, listener, useCapture) {
        this.__removeEventListener( type, listener, useCapture );
        if ( type == "click") {
            var th = jQuery.data( this, "tapHandler" );
            if (th){
                th.destroy();
            }
            delete th;
            jQuery.removeData( this, "tapHandler" );
        }
    }


}



/*

window.lastTouchTime = 0;
window.TouchHandler = function (target, listener, useCapture){
    var self = this;
    this.target = target;
    this.useCapture = useCapture;
    this.MAX_TAP_FLOAT = 8;
    this.MAX_TAP_TIME = 400;
    this.MIN_ELAPSED_TIME = 350;


    var touch = ('ontouchstart' in window);
    this.START_EVENT = touch ? "touchstart" : "mousedown";
    this.MOVE_EVENT  = touch ? "touchmove" : "mousemove";
    this.END_EVENT  = touch ? "touchend" : "mouseup";

    this.destroy = function() {
        self.target.removeEventListener( self.START_EVENT, self.touchStart );
        self.target.removeEventListener( self.MOVE_EVENT, self.touchMove );
        self.target.removeEventListener( self.END_EVENT, self.touchEnd );
        self.target = undefined;
    }

    this.touchStart = function( event ) {
        var element = $(event.target);
        element.addClass("active");
        var id = element.attr("id");
        self.startTime = new Date().getTime();

        //console.log("touchstart " + id + " " + self.startTime.toString())

        var touchItem = (event.targetTouches == undefined) ? event : event.targetTouches[0];
        self.startX = touchItem.pageX;
        self.startY = touchItem.pageY;
        self.endX = touchItem.pageX;
        self.endY = touchItem.pageY;

        if ( event.targetTouches == undefined || event.targetTouches.length == 1 ) {
            self.target.removeEventListener( self.START_EVENT, self.touchStart );
            self.target.addEventListener( self.MOVE_EVENT, self.touchMove, false );
            self.target.addEventListener( self.END_EVENT, self.touchEnd, false );
        }

        //return self.killEvent(event);
    }

    this.touchMove = function( event ) {
        var element = $(event.target);
        var id = element.attr("id");

        var touchItem = (event.targetTouches == undefined) ? event : event.targetTouches[0];
        self.endX = touchItem.pageX;
        self.endY = touchItem.pageY;
    }

    this.touchEnd = function( event ) {
        var element = $(event.target);
        element.removeClass("active");
        var id = element.attr("id");
        var now = new Date().getTime();
        var diff = now - self.startTime;


        if ( event.targetTouches == undefined ||event.targetTouches.length <= 0 ) {
            self.target.addEventListener( self.START_EVENT, self.touchStart, false );
            self.target.removeEventListener( self.MOVE_EVENT, self.touchMove );
            self.target.removeEventListener( self.END_EVENT, self.touchEnd );
        }

        if ( diff < self.MAX_TAP_TIME ) {

            if ( event.targetTouches == undefined || event.targetTouches.length > 0 ) {

                var touchItem = (event.targetTouches == undefined) ? event : event.targetTouches[0];
                self.endX = touchItem.pageX;
                self.endY = touchItem.pageY;
            }

            var diffX = Math.abs( self.startX - self.endX );
            var diffY = Math.abs( self.startY - self.endY );

            //alert(diffX + ", " +diffY)
            if ( diffX <= self.MAX_TAP_FLOAT && diffY <= self.MAX_TAP_FLOAT ) {

                if (window.lastTouchTime - now < self.MIN_ELAPSED_TIME) {
                    window.lastTouchTime = now;

                    clearTimeout(self.triggerTimeout);
                    self.triggerTimeout = setTimeout(function(){
                        //console.log("touchend " + id + " " + self.startTime.toString())
                        element.trigger("tap");
                    }, 10);
                }

                return killEvent(event);
            }
        }
        //return self.killEvent(event);
    }

    target.addEventListener( self.START_EVENT, self.touchStart, false );
    //return;//self.killEvent(event);
}




if ( true ) {//'ontouchstart' in window) {

    HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
    HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;

    HTMLElement.prototype.addEventListener = function (type, listener, useCapture) {

        //console.log("addEventListener:" + type)
        if ( type == "tap") {
            var th = new TouchHandler( this, listener, useCapture );
            jQuery.data( this, "tapHandler", th );
        }
        this.__addEventListener( type, listener, useCapture );
    }

    HTMLElement.prototype.removeEventListener = function (type, listener, useCapture) {
        this.__removeEventListener( type, listener, useCapture );
        if ( type == "tap") {
            var th = jQuery.data( this, "tapHandler" );
            if (th){
                th.destroy();
            }
            delete th;
            jQuery.removeData( this, "tapHandler" );
        }
    }


}      */


//prevent default webview events
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
window.addEventListener('click', function (e) {
    if (e.forwardedTouchEvent != true) {
        console.log("click stopped");
        killEvent(e);
    }
}, true);