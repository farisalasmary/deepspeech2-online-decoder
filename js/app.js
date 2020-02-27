//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

var X_seconds = 3;
var schedualed_function_id;
//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);


// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------

var ws;

var ws_ip = '0.0.0.0'
var ws_port = '8888'

function init() {

  // Connect to Web Socket
  ws = new WebSocket("ws://" + ws_ip + ":" + ws_port + "/");

  // Set event handlers.
  ws.onopen = function() {
    output("onopen");
  };

  ws.onmessage = function(e) {
    // e.data contains received string.
    output("onmessage: " + e.data);
  };

  ws.onclose = function() {
    output("onclose");
  };

  ws.onerror = function(e) {
    output("onerror");
    console.log(e);
  };

}

function onSubmit() {
  var input = document.getElementById("input");
  // You can send message to the Web Socket using ws.send.
  ws.send(input.value);
  output("send: " + input.value);
  input.value = "";
  input.focus();
}

function onCloseClick() {
  ws.close();
}

function output(str) {
  var log = document.getElementById("log");
  var escaped = str.replace(/&/, "&amp;").replace(/</, "&lt;").
    replace(/>/, "&gt;").replace(/"/, "&quot;"); // "
  log.innerHTML = escaped + "<br>" + log.innerHTML;
}

// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------


function startRecording() {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();
        
		//update the format 
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
    
    schedualed_function_id = window.setInterval(function(){
        rec.getBuffer(send_ws_data)
    }, X_seconds*1000);
}

function convertFloat32ToInt16(buffer) {
    l = buffer.length;
    buf = new Int16Array(l);
    while (l--) {
        buf[l] = Math.min(1, buffer[l]) * 0x7fff;
    }
    return buf
}

function send_ws_data(buffer){
    buffer = convertFloat32ToInt16(buffer[0]);
    var signal_string = buffer.join(); // convert signal to string
    var compressed_signal = LZString.compressToUTF16(signal_string); // compress the signal
    ws.send(compressed_signal); // send to server 
    rec.clear(); // clear the buffer
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";

	}
    
}

function stopRecording() {
    console.log('Stop schedualed function!!');
    clearInterval(schedualed_function_id);
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	// rec.exportWAV(createDownloadLink);
}
/*
function createDownloadLink(blob) {
    //name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();
    var xhr = new XMLHttpRequest();
    xhr.onload = function(e) {
              if(this.readyState === 4) {
                  console.log("Server returned: ", e.target.responseText);
              }
          };
    var fd = new FormData();
    fd.append("audio_data", blob, filename);
    xhr.open("POST","upload/", true);
    xhr.send(fd); 

}
*/
