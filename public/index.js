/*<script>
   
</script>

*/

$(document).ready(function(){
    $('select').formSelect();
    $('.sidenav').sidenav(); 
    window.onresize = function(event) { 
        $('.sidenav').sidenav(); 
    }
    $('.tabs').tabs();
    $('.modal').modal();
    $('input#input_text, textarea#textarea2').characterCounter();
});

$(function () {

    $("#btn_fetch").click(function () {

        var url = $("#txt_url").val();

        var oThis = $(this);
        oThis.attr('disabled', true);

        $.get('video_info.php', {url: url}, function (data) {

            console.log(data);

            oThis.attr('disabled', false);

            var links = data['links'];
            var error = data['error'];

            if (error) {
                alert('Error: ' + error);
                return;
            }

            // first link with video
            var first = links.find(function (link) {
                return link['format'].indexOf('video') !== -1;
            });

            if (typeof first === 'undefined') {
                alert('No video found!');
                return;
            }

            var stream_url = 'stream.php?url=' + encodeURIComponent(first['url']);

            $("#displayV").attr('src', stream_url);
            $("#bufferV").attr('src', stream_url);
            //$("#displayV").trigger('play');
        });

    });

});

var video = document.getElementById('displayV');
var video_buffer = document.getElementById('bufferV');

video_buffer.muted = true;
var intervalRewind;

var lastBufferCheck = Date.now();
var buffers = {
    display:[],
    bu: []
};
//var startSystemTime;
//var startVideoTime;
$(video).on("loadeddata", function() {
    let loader = document.getElementById('loader');
    loader.style.display = "none";
});

$(video).on("loadstart", function() {
    let loader = document.getElementById('loader');
    if(video.src != '') {
        loader.style.display = "block";
    }
});

$(video).on('play',function(){
    video.playbackRate = 1.0;
    clearInterval(intervalRewind);
});

$(video).on('ended',function(){
    // this only happens when t=duration (not t==0)
    video.playbackRate = 1.0;
    video.currentTime = 0.0;
    clearInterval(intervalRewind);
});

$(video).on('pause',function(){
    video.playbackRate = 1.0;
    clearInterval(intervalRewind);
});

$(video).on('progress',function(){
    updateBuffer(true);
    //reverseBuffer();
});

$(video).on('timeupdate',function(){
    //updateBuffer(true);
    //console.log(buffers);
});

$(video_buffer).on('play',function(){
    video_buffer.playbackRate = 10.0;
});

$(video_buffer).on('progress',function(){
    updateBuffer(false);
});

$(video_buffer).on('timeupdate',function(){
    //updateBuffer(false);
});

$(video_buffer).on('loadeddata',function(){
    video.play();
});


function rewind(rewindSpeed) {    
   clearInterval(intervalRewind);
   var startSystemTime = new Date().getTime();
   var startVideoTime = video.currentTime;
   
   intervalRewind = setInterval(function(){
       video.playbackRate = 1.0;
       if(video.currentTime == 0){
           clearInterval(intervalRewind);
           video.pause();
       } else {
           var elapsed = new Date().getTime()-startSystemTime;
           video.currentTime = Math.max(startVideoTime - elapsed*rewindSpeed/1000.0, 0);
       }
   }, 30);
}

function updateBuffer(isDisplay) {
    let bufferr = document.getElementById(isDisplay ? 'displayV' : 'bufferV').buffered;
    let updateB = [];
    for (i = 0; i < bufferr.length; i++) {
        updateB.push([bufferr.start(i),  bufferr.end(i)]);
    }

    if(isDisplay) {
        buffers.display = updateB;
    } else {
        buffers.bu = updateB;
    }
}

function startBuffer(sec) {
    if(sec< 0) {
        sec = 0;
    }
    let bV = document.getElementById('bufferV');

    bV.currentTime = sec;
    bV.play();
}

function reverseBuffer() {
    if(Math.abs(lastBufferCheck - Date.now()) > 4000) {
        let current = document.getElementById('displayV').currentTime;
        if(!isInBuffer([current-4, current]) ) {
            startBuffer(current-4);
        }

        lastBufferCheck = Date.now();
    }
}

function isInBuffer(time) {
    for(let bu in buffers.display) {
        if(time[1] <= bu[1] && time[0] >= bu[0]) {
            return true;
        }
    }

    for(let bu in buffers.bu) {
        if(time[1] <= bu[1] && time[0] >= bu[0]) {
            return true;
        }
    }

    return false;
}

/**speed functions */
$("#speed0").click(function() {
    clearInterval(intervalRewind);
    video.playbackRate = 1.0;
    video.pause();
});
$("#speedpoint5").click(function() {
    clearInterval(intervalRewind);
    if (video.paused) video.play();
    setTimeout(function() {
      // Not sure why, but setting the playback to
      // less than 1.0 only works when out of band
      // or the video is already playing.
      video.playbackRate = 0.25;
      console.log('delayed');
    }, 0);
});
$("#speed1").click(function() {
    clearInterval(intervalRewind);
    video.playbackRate = 1.0;
    if (video.paused) video.play();
});
$("#speed2").click(function() {
    clearInterval(intervalRewind);
    video.playbackRate = 2.0;
    if (video.paused) video.play();
});
$("#speed3").click(function() {
    clearInterval(intervalRewind);
    video.playbackRate = 3.0;
    if (video.paused) video.play();
});
$("#speed-point5").click(function() {
   rewind(0.5);
});
$("#speed-1").click(function() {
    console.log('aa');
    rewind(1.0);
});
$("#speed-2").click(function() {
   rewind(2.0);
});
$("#speed-3").click(function() {
   rewind(3.0);
});