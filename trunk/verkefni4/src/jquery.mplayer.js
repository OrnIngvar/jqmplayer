;(function( $ ) {
    $.fn.musicPlayer = function( playlist, options ) {

        var defaults = {
            autoplay : false,
            errorMsg : "Song cannot be played"
        };

        var plugin = this;

        //The audio element we work with
        var audioElem;

        //The custom made controls for the player
        var controls;

        //The playlist element
        var player;
        var error;

        var playpause,seekBar,volumeDown,volumeUp,prevSong,nextSong,timer,currentTimeContainer,currentTime,duration,
            durationContainer,muteButton;
        var volume=0.5; //0 to 1
        var counter = 0;
        var playlistLength = 0;

        plugin.settings = {};

        var init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.playlist = playlist;
            playlistLength = playlist.length;

            var pluginStyle = ("input { "+
                "border: 2px solid #662a1b; /* masked against background until input has focus*/"+
                "position: absolute;"+
                "background-position: center center;"+
                "background-repeat: no-repeat;"+
                "};");

            // Generate html
            plugin.html( '<style type="text/css">'+pluginStyle+'</style>'+
                '<div id="playlist"></div>'+
                '<audio id="audioPlayer"></audio>'+
                '<div id="controls"></div>');

            player = document.getElementById( "playlist" );
            audioElem = document.getElementById( "audioPlayer" );
            controls = document.getElementById( "controls" );

            // Fallback if audioPlayer can't play media type
            if (! audioElem.canPlayType("audio/mpeg")){
                error = document.createElement('p');
                var errorText = document.createTextNode(defaults.errorMsg);
                error.appendChild(errorText);
                audioElem.appendChild(error);
                return;
           }

            var controlStyle = "position: relative;border: 2px solid #4c4c4c;"+
                "background-color: #662a1b;width: 504px;height: 30px;" +
                "line-height: 30px;";

            controls.setAttribute('style', controlStyle);

            var playlistUL, playListLI, playListLink, linkText;
            playlistUL = document.createElement('ul');

            playlistUL.setAttribute('id','playlist_ul');

            for( var i=0; i<playlistLength; i++){

                playListLI = document.createElement('li');
                playListLI.setAttribute('id','track'+i);
                playlistUL.appendChild(playListLI);

                playListLink = document.createElement('a');
                //TODO : Actually play the selected song
                playListLink.setAttribute('href', '#');

                //TODO : Strip out URL to just display name of file
                linkText=document.createTextNode( playlist[i] );

                playListLink.appendChild(linkText);
                playListLI.appendChild(playListLink);
            }

            player.appendChild(playlistUL);

            ////////////////////////////////////
            // Controls
            ////////////////////////////////////
            var prevSongStyle = "top: 0px; left: 40px; width: 34px; height: 30px; "+
                "background-color: transparent; background-image: url('images/audio_rewind.gif');"+
                "color: transparent; border-right-color: #662a1b;";
            prevSong = document.createElement('input');
            prevSong.setAttribute('type','button');
            prevSong.setAttribute('id','prevSong');
            prevSong.setAttribute('value','');
            prevSong.setAttribute('title','Previous');
            prevSong.setAttribute('style', prevSongStyle);
            prevSong.setAttribute('accesskey','R');
            controls.appendChild(prevSong);

            var playPauseStyle = "top: 0px; left: 0px; width: 34px; height: 30px; "+
                "background-color: transparent; background-image: url('images/audio_play.gif');"+
                "color: transparent; border-right-color: #662a1b;";
            playpause = document.createElement('input');
            playpause.setAttribute('type','button');
            playpause.setAttribute('id','playpause');
            playpause.setAttribute('value','');
            playpause.setAttribute('title','Play');
            playpause.setAttribute('style',playPauseStyle);
            playpause.setAttribute('accesskey','P');
            controls.appendChild(playpause);

            var nextSongStyle = "top: 0px; left: 80px; width: 34px; height: 30px; "+
                "background-color: transparent; background-image: url('images/audio_forward.gif');"+
                "color: transparent; border-right-color: #662a1b;";
            nextSong = document.createElement('input');
            nextSong.setAttribute('type','button');
            nextSong.setAttribute('id','nextSong');
            nextSong.setAttribute('value','');
            nextSong.setAttribute('title','Next');
            nextSong.setAttribute('accesskey','F');
            nextSong.setAttribute('style', nextSongStyle);
            controls.appendChild(nextSong);

            var seekBarStyle = "top: 0px; left: 120px; width: 180px; height: 30px; "+
                "background-color: transparent; "+
                "color: transparent; border-right-color: #662a1b;";
            seekBar = document.createElement('input');
            seekBar.setAttribute('type','range');
            seekBar.setAttribute('id','seekBar');
            seekBar.setAttribute('value','0');
            seekBar.setAttribute('step','any');
            seekBar.setAttribute('style', seekBarStyle);
            controls.appendChild(seekBar);

            var timerStyle = "position:absolute; left: 320px; width: 68px; height: 18px; "+
                "border-right-color: #662a1b;";
            timer = document.createElement('span');
            timer.setAttribute('id','timer');
            timer.setAttribute('style', timerStyle);

            var currentTimeStyle = "left: 100px; color:#FFFFFF";
            currentTimeContainer = document.createElement('span');
            currentTimeContainer.setAttribute('id','currentTime');
            currentTimeContainer.setAttribute('style', currentTimeStyle);
            var startTime = document.createTextNode('0:00');
            currentTimeContainer.appendChild(startTime);

            var durationStyle = "left: 260px; color:#FFFFFF";
            durationContainer = document.createElement('span');
            durationContainer.setAttribute('id','duration');
            durationContainer.setAttribute('style', durationStyle);
            timer.appendChild(currentTimeContainer);
            timer.appendChild(durationContainer);
            controls.appendChild(timer);

            var muteButtonsStyle = "left: 400px; top: 0px;width: 34px;height: 30px;background-color: transparent;background-image: url('images/audio_volume.gif');color: transparent;border-left-color: #848484; ";
            muteButton = document.createElement('input');
            muteButton.setAttribute('type','button');
            muteButton.setAttribute('id','muteButton');
            muteButton.setAttribute('value','');
            muteButton.setAttribute('title','Mute');
            muteButton.setAttribute('style', muteButtonsStyle);
            muteButton.setAttribute('accesskey','M');
            controls.appendChild(muteButton);

            var volumeUpStyle = "top: 0px;left: 435px;width: 34px;height: 30px;background-color: transparent;background-image: url('images/audio_volumeUp.gif');color: transparent;";
            volumeUp = document.createElement('input');
            volumeUp.setAttribute('type','button');
            volumeUp.setAttribute('id','volumeUp');
            volumeUp.setAttribute('value','');
            volumeUp.setAttribute('title','Volume Up');
            volumeUp.setAttribute('style', volumeUpStyle);
            volumeUp.setAttribute('accesskey','U');
            controls.appendChild(volumeUp);

            var volumeDownStyle = "top: 0px;left: 470px;width: 34px;height: 30px;background-color: transparent;background-image: url('images/audio_volumeDown.gif');color: transparent;";
            volumeDown = document.createElement('input');
            volumeDown.setAttribute('type','button');
            volumeDown.setAttribute('id','volumeDown');
            volumeDown.setAttribute('value','');
            volumeDown.setAttribute('title','Volume Down');
            volumeDown.setAttribute('style', volumeDownStyle);
            volumeDown.setAttribute('accesskey','D');
            controls.appendChild(volumeDown);

            audioElem.volume = volume;

            //Duration from Audio gives too much detail, floor it
            duration = Math.floor(audioElem.duration);
            //Chrome and Safari return NaN for duration until audio.loadedmetadata is true
            if (isNaN(duration)) {
                audioElem.addEventListener('loadedmetadata',function () {
                    duration = audioElem.duration;
                    showTime(duration,durationContainer);
                    seekBar.setAttribute('min',0);
                    seekBar.setAttribute('max',duration);
                },false);
            }
            else {
                showTime(duration,durationContainer);
                seekBar.setAttribute('min',0);
                seekBar.setAttribute('max',duration);
            }

            //TODO : Make this selectable by user. As is it always plays the first song
            audioElem.src = playlist[counter];

            // Bind events
            //TODO : get this to work
            $( playListLink ).bind( 'onclick', function(){
                play();
            });

            $( audioElem ).bind( 'timeupdate', function(){
                seekBar.value = audioElem.currentTime;
                showTime(audioElem.currentTime,currentTimeContainer);
            });

            $( prevSong ).bind( 'click', function(){
                previous();
            });

            $( playpause ).bind( 'click', function(){
                play();
            });

            $( nextSong ).bind( 'click', function(){
                next();
            });

            $( volumeUp ).bind( 'click' , function(){
                if (volume < 0.9) volume = (volume + 0.1);
                else volume = 1;
                audioElem.volume = volume;
            });

            $( volumeDown ).bind( 'click', function(){
                if (volume > 0.1) volume = (volume - 0.1);
                else volume = 0;
                audioElem.volume = volume;
            });

            $( muteButton ).bind( 'click', function(){
                if (audioElem.muted) {
                    audioElem.muted = false; //unmute the volume
                    muteButton.setAttribute('title','Mute');
                    audioElem.volume = volume;
                    muteButton.style.backgroundImage="url('images/audio_volume.gif')";
                }
                else {
                    audioElem.muted = true; //mute the volume
                    muteButton.setAttribute('title','UnMute');
                    muteButton.style.backgroundImage="url('images/audio_mute.gif')";
                }
            });

            $( seekBar ).bind( 'durationchange', function(){
                seekBar.max = audioElem.duration;
            });

            $( seekBar ).bind( 'change' , function(){
                var targetTime = seekBar.value;
                if (targetTime < duration) {
                    audioElem.currentTime = targetTime;
                    plugin.showTime(targetTime, currentTimeContainer);
                }
            });
        };

        var previous = function(){
            if( counter === playlistLength - 1){
                counter = counter - 1;
                audioElem.src = playlist[counter];
                play();
            }else if(counter < playlistLength -1 && counter !== 0){
                counter = counter - 1;
                audioElem.src = playlist[counter];
                play();
            }
            else if( counter === 0){
                //TODO: Disable previous song button
            }
        };

        var play = function(){
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
        };

        var next = function(){
            if( counter === playlistLength - 1){
                //Skip to start of playlist since counter is at the end
                counter = 0;
                audioElem.src = playlist[counter];
                play();
            }else if( counter < playlistLength - 1){
                counter = counter + 1;
                audioElem.src = playlist[counter];
                play();
            }
        };

        var showTime = function(time,elem) {
            var minutes = Math.floor(time/60);
            var seconds = Math.floor(time % 60);
            if (seconds < 10) seconds = '0' + seconds;
            var output = minutes + ':' + seconds;
            if (elem == currentTimeContainer) elem.innerHTML = output;
            else elem.innerHTML = ' / ' + output;
        };
        // call the "constructor" method
        init();
    }

}) (jQuery);