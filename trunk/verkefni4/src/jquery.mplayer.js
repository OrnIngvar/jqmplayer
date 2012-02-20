;( function ( $ ) {
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

        //Play/Pause controls of the player
        var playpause;
        var seekBar;
        var volumeDown;
        var volumeUp;
        var prevSong;
        var nextSong;
        var timer;
        var currentTimeContainer;
        var currentTime;
        var duration;
        var durationContainer;
        var muteButton;
        var volume=0.5; //0 to 1
        var counter = 0;
        var playlistLength = 0;

        plugin.settings = {};

        var init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.playlist = playlist;
            playlistLength = playlist.length;

            // Generate html
            plugin.html('<audio id="audioPlayer"></audio><div id="controls"></div>');

            audioElem = document.getElementById( "audioPlayer" );
            controls = document.getElementById( "controls" );

            var controlStyle = "position: relative;border: 2px solid #4c4c4c;background-color: #666666;width: 464px;height: 30px;line-height: 30px;";
            controls.setAttribute('style', controlStyle);

            var playPauseStyle = "top: 0px; left: 0px; width: 34px; height: 30px; "+
                "background-color: transparent; background-image: url('images/audio_play.gif');"+
                "color: transparent; border-right-color: #848484;";
            playpause = document.createElement('input');
            playpause.setAttribute('type','button');
            playpause.setAttribute('id','playpause');
            playpause.setAttribute('value','');
            playpause.setAttribute('title','Play');
            playpause.setAttribute('style',playPauseStyle);
            playpause.setAttribute('accesskey','P');
            controls.appendChild(playpause);

            seekBar = document.createElement('input');
            seekBar.setAttribute('type','range');
            seekBar.setAttribute('id','seekBar');
            seekBar.setAttribute('value','0');
            seekBar.setAttribute('step','any');
            controls.appendChild(seekBar);

            //TODO : add image
            prevSong = document.createElement('input');
            prevSong.setAttribute('type','button');
            prevSong.setAttribute('id','prevSong');
            prevSong.setAttribute('value','');
            prevSong.setAttribute('title','Previous');
            prevSong.setAttribute('accesskey','R');
            controls.appendChild(prevSong);

            //TODO : add image
            nextSong = document.createElement('input');
            nextSong.setAttribute('type','button');
            nextSong.setAttribute('id','nextSong');
            nextSong.setAttribute('value','');
            nextSong.setAttribute('title','Next');
            nextSong.setAttribute('accesskey','F');
            controls.appendChild(nextSong);

            timer = document.createElement('span');
            timer.setAttribute('id','timer');
            currentTimeContainer = document.createElement('span');
            currentTimeContainer.setAttribute('id','currentTime');
            var startTime = document.createTextNode('0:00');
            currentTimeContainer.appendChild(startTime);

            durationContainer = document.createElement('span');
            durationContainer.setAttribute('id','duration');
            timer.appendChild(currentTimeContainer);
            timer.appendChild(durationContainer);
            controls.appendChild(timer);

            var muteButtonsStyle = "left: 360px; top: 0px;width: 34px;height: 30px;background-color: transparent;background-image: url('images/audio_volume.gif');color: transparent;border-left-color: #848484; ";
            muteButton = document.createElement('input');
            muteButton.setAttribute('type','button');
            muteButton.setAttribute('id','muteButton');
            muteButton.setAttribute('value','');
            muteButton.setAttribute('title','Mute');
            muteButton.setAttribute('style', muteButtonsStyle);
            muteButton.setAttribute('accesskey','M');
            controls.appendChild(muteButton);

            var volumeUpStyle = "top: 0px;left: 395px;width: 34px;height: 30px;background-color: transparent;background-image: url('images/audio_volumeUp.gif');color: transparent;";
            volumeUp = document.createElement('input');
            volumeUp.setAttribute('type','button');
            volumeUp.setAttribute('id','volumeUp');
            volumeUp.setAttribute('value','');
            volumeUp.setAttribute('title','Volume Up');
            volumeUp.setAttribute('style', volumeUpStyle);
            volumeUp.setAttribute('accesskey','U');
            controls.appendChild(volumeUp);

            var volumeDownStyle = "top: 0px;left: 430px;width: 34px;height: 30px;background-color: transparent;background-image: url('images/audio_volumeDown.gif');color: transparent;";
            volumeDown = document.createElement('input');
            volumeDown.setAttribute('type','button');
            volumeDown.setAttribute('id','volumeDown');
            volumeDown.setAttribute('value','');
            volumeDown.setAttribute('title','Volume Down');
            volumeDown.setAttribute('style', volumeDownStyle);
            volumeDown.setAttribute('accesskey','D');
            controls.appendChild(volumeDown);

            audioElem.volume = volume;

            duration = Math.floor(audioElem.duration);
            //Chrome and Safari return NaN for duration until audio.loadedmetadata is true.
            //Other browsers are able to get duration with 100% reliability in my tests,
            //AND (interestingly) only Chrome and Safari support audio.loadedmetadata
            //So, have to assign duration both inside and outside of the following event listener
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
            $( audioElem ).bind( 'timeupdate', function(){
                seekBar.value = audioElem.currentTime;
                showTime(audioElem.currentTime,currentTimeContainer);
            });

            $( playpause ).bind( 'click', function(){
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
                    showTime(targetTime, currentTimeContainer);
                }
            });

            $( nextSong ).bind( 'click', function(){
                console.log(counter);
                console.log('pllengt' + playlistLength);
                if( counter == playlistLength - 1){
                    //Skip to start of playlist since counter is at the end
                    counter = 0;
                    audioElem.src = playlist[counter];
                    audioElem.play();
                }else if( counter < playlistLength - 1){
                    counter = counter + 1;
                    console.log(counter);
                    audioElem.src = playlist[counter];
                    audioElem.play();
                }
            });

            $( prevSong ).bind( 'click', function(){
                if( counter == playlistLength - 1){
                    counter = counter - 1;
                    audioElem.src = playlist[counter];
                    audioElem.play();
                }else if(counter < playlistLength -1 && counter != 0){
                    counter = counter - 1;
                    audioElem.src = playlist[counter];
                    audioElem.play();
                }
                else if( counter == 0){
                    //TODO: Disable previous song button
                }
            });
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

})(jQuery);