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
        let v = document.getElementById('displayV');
        v.src = '';
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
            loadBuffer(stream_url);
            icon.innerText = 'pause';
        });

    });

});

var video = document.getElementById('displayV');
var ranger = document.getElementById('rangee');
var icon = document.getElementById('pIcon');

var intervalRewind;

var lastBufferCheck = Date.now();
var buffers = {
    display:[],
    bu: []
};


function loadBuffer(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function(oEvent) {

        var blob = new Blob([oEvent.target.response], {type: "video/mp4"});
        
        video.src = URL.createObjectURL(blob);
        
        video.play();
    };
    
    xhr.onprogress = function(oEvent) {
    
        if (oEvent.lengthComputable) {
            var percentComplete = oEvent.loaded/oEvent.total;
            // do something with this
            document.getElementById('percent').style.width = percentComplete * 100 + '%';
        }
    }

    xhr.send();
}

function setRangeData(data) {
    ranger.value = data;
}

$(ranger).on("input", function() {
    var video = document.getElementById('displayV');
    video.pause();
});

$(ranger).bind("mouseup touchend", function() {
    var video = document.getElementById('displayV');
    let r = document.getElementById('rangee');

    video.currentTime = video.duration * (r.value / 100);
    
    ifPlay();
});

$(ranger).bind("mousedown touchstart", function() {
    var video = document.getElementById('displayV');
    video.pause();
    $( video ).off( "timeupdate");

    video.currentTime = video.duration * (ranger.value / 100);
    setTimeout(startRangeUpdate, 100);
});

$(video).on("loadeddata", function() {
    let loader = document.getElementById('loader');
    loader.style.display = "none";
    video.play();
});

$(video).on("loadstart", function() {
    let loader = document.getElementById('loader');
    if(video.src != '') {
        loader.style.display = "block";
    }
    setRangeData(0);
});

$(video).on('play',function(){
    //video.playbackRate = 1.0;
    clearInterval(intervalRewind);
});

$(video).on('ended',function(){
    // this only happens when t=duration (not t==0)
    //video.playbackRate = 1.0;
    video.currentTime = 0.0;
    clearInterval(intervalRewind);
});

$(video).on('pause',function(){
    //video.playbackRate = 1.0;
    clearInterval(intervalRewind);
});

function startRangeUpdate() {
    $(video).on('timeupdate',function(){
        let vi = document.getElementById('displayV');
    
        setRangeData((vi.currentTime / vi.duration) * 100);

        console.log('asdas');
    });    
}

startRangeUpdate();

function rewind(rewindSpeed) {    
   clearInterval(intervalRewind);
   var startSystemTime = new Date().getTime();
   var startVideoTime = video.currentTime;
   
   intervalRewind = setInterval(function(){
       video.playbackRate = 0;
       if(video.currentTime == 0){
           clearInterval(intervalRewind);
           video.pause();
           icon.innerText = 'play_arrow';
       } else {
           var elapsed = new Date().getTime()-startSystemTime;
           video.currentTime = Math.max(startVideoTime - elapsed*rewindSpeed/1000.0, 0);
       }
   }, 30);
}

/**speed functions */
$("#speed0").click(function() {
    clearInterval(intervalRewind);
    video.playbackRate = 1.0;

    if(icon.innerText == 'play_arrow') {
        video.play();
        icon.innerText = 'pause';
    } else {
        icon.innerText = 'play_arrow';
        video.pause();
    }
});

function ifPlay() {
    if(icon.innerText == 'play_arrow') {
        video.pause();
    } else {
        video.play();
    }
}

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
    video.playbackRate = 10.0;
    video.muted = on;
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