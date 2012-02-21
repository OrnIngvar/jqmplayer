/*
 *  Project:
 *  Description:
 *  Author:
 *  License:
 */


// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variables rather than globals
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'musicPlayer',
        defaults = {
            autoplay: "false",
            errorMsg: "Sorry, the song cannot be played"
        };

    var audioElem;
    var controls;
    var playpause;

    // The actual plugin constructor
    function Plugin( playlist, options ) {
        this.playlist = playlist;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and the options via the instance,
        // e.g., this.element and this.options

        var $this = $(this);

        // Generate html
        $this.html('<audio id="audioPlayer"></audio><div id="controls"></div>');

        audioElem = document.getElementById( "audioPlayer" );
        controls = document.getElementById( "controls" );

        var playPauseStyle = "top: 0px; left: 0px; width: 34px; height: 30px; "+
            "background-color: transparent; background-image: url('images/audio_play.gif');"+
            "color: transparent; border-right-color: #848484;";
        playpause = document.createElement('input');
        playpause.setAttribute('type','button');
        playpause.setAttribute('id','playpause');
        playpause.setAttribute('value','');
        playpause.setAttribute('title','Play');
        playpause.setAttribute('style',playPauseStyle);
        //TODO : Get this to work
        //playpause.setAttribute('onclick','play');
        playpause.setAttribute('accesskey','P');
        controls.appendChild(playpause);

        $('playpause').bind('click', function(e){
            if (audioElem.paused || audioElem.ended) {
                audioElem.play();
                playpause.setAttribute('title','Pause');
                playpause.style.backgroundImage="url('images/audio_pause.gif')";
            }
            else {
                audioElem.pause();
                playpause.setAttribute('title','Play');
                playpause.style.backgroundImage="url('images/audio_play.gif')";
            }
        });
        audioElem.src = this.playlist[0];
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    }

})(jQuery, window, document);
