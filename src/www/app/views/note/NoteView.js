templates.noteView = "app/views/note/NoteView.html";

window.NoteView = Backbone.View.extend({

    title: "Add Note",
    backLabel:" ",
    dirty: false,
    audioPlayer: undefined,

    initialize: function(options) {

        if ( options.model ) {
            this.model = options.model;
        }

        if ( this.model.LOCATION_DETAIL != undefined && this.model.LOCATION_DETAIL.length > 0 ) {

            try {
                this.model.location_data = JSON.parse( this.model.LOCATION_DETAIL );
            }
            catch (e) {
                console.log(e);
            }
        }

        if ( this.model.location_data == undefined ) {
            this.model.location_data = {
                name:"No Location Added"
            };
        }

        this.render();
        this.view = this.$el;


        var self = this;
        this.showViewCallback = function() {
            this.purgeModel();
            self.render();
        }

        this.hideViewCallback = function() {
            self.onViewHidden();
        }

        this.shouldChangeView = function() {

            return self.onShouldChangeView();
        }
    },

    events:{
        "keyup textarea":"onTextInputChange",
        "change textarea":"onTextInputChange",
        "click #addLocationButton": "onLocationButtonClick",
        "click #addPhotoButton": "onPicButtonClick",
        "click #addAudioButton": "onAudioButtonClick",
        "click img": "onPhotoClick",
        "click #playButton": "onAudioPlayClick"
    },

    render:function (eventName) {

        var template = templates.noteView;
        this.$el.html(template(this.model));

    },

    purgeModel:function() {
        for (var x=0; x< this.model.images.length; x++) {
            var image = this.model.images[x];
            if ( image.ID == undefined && image.REF == undefined ){
                this.model.images = _.without(this.model.images, image);
            }
        }
        for (var x=0; x< this.model.soundclips.length; x++) {
            var clip = this.model.soundclips[x];
            if ( clip.ID == undefined && clip.REF == undefined ){
                this.model.soundclips = _.without(this.model.soundclips, clip);
            }
        }
    },

    onTextInputChange: function(event) {
        this.dirty = true;
    },

    onShouldChangeView: function() {

        this.stopAudio();


        if ( this.dirty ) { //||attachmentsDirty ) {

            var self = this;

            var textarea = this.$el.find("textarea");
            var value = textarea.val();

            var model = this.model;
            model.DETAIL = value;

            //wait until data is saved before popping the view
            window.DatabaseManager.instance.saveNote( model, function(){
                self.dirty = false;
                if ( self.pendingView ){
                    window.viewNavigator.pushView( self.pendingView );
                    self.pendingView = undefined;
                }
                else {
                    window.viewNavigator.popView();
                    self.pendingView = undefined;
                }
            });
        }
        return !this.dirty;
    },

    onViewHidden: function() {

    },



    onPicButtonClick: function(event) {

        var self = this;
        new ImageModalHelper( this.model, function(note) {
            self.mediaCaptureSuccess(note);
        } );

    },

    onAudioButtonClick: function(event) {

        var self = this;
        new AudioModalHelper( this.model, function(note) {
            self.mediaCaptureSuccess(note);
        } );
    },


    mediaCaptureSuccess : function( note ) {

        this.render();
        window.viewNavigator.resetScroller();
    },

    onPhotoClick: function (event) {

        var index = parseInt( $(event.target).attr("index") );
        var model;
        if (! isNaN(index)) {
            model = this.model.images[ index ];
            window.viewNavigator.pushView( new PhotoDetailView({model:model}) );
        }
    },

    onLocationButtonClick: function(event) {

        var view = new LocationView({model:this.model});
        if ( this.dirty ) {
            this.pendingView = view;
        }
        window.viewNavigator.pushView( view );

    },

    stopAudio: function() {
        if (this.audioPlayer != undefined){
            this.audioPlayer.stop();
            this.audioPlayer.release();
        }
        clearInterval(this.audioInterval);
        this.$el.find("#progress").css("width", "0%");
    },

    onAudioPlayClick: function(event) {

        var self = this;
        this.stopAudio();

        var target = $(event.target);

        while ( !target.is("li") ){
            target = target.parent();
        }

        var src = target.attr("src");
        var progress = target.find("#progress");
        this.audioId = target.attr("id");

        this.audioPlayer = new Media(src, function(success){
            console.log(success);
            self.stopAudio();
        }, function(error){
            console.log(error);
            self.stopAudio();
        });
        this.audioPlayer.play();

        this.audioInterval = setInterval( function(){

            console.log( "interval" );


            self.audioPlayer.getCurrentPosition( function(position) {
                var percent = 0;
                if (position > -1) {
                    percent = (position/self.audioPlayer.getDuration())*100;
                }

                percent = 10;

                console.log( percent+"%" );

                progress.width( percent+"%");

            } );

        }, 500);
    }
});