






/**
 * 
 * @param {MediaStream} stream 
 * @param {Function} ondata 
 * @returns {MediaRecorder}
 */
function startRecording(stream, ondata) {
  let mediaRecorder = new MediaRecorder(stream);
  console.log(mediaRecorder, stream)
  mediaRecorder.ondataavailable = (event) => {
   
    if (event.data.size > 0) {
     
      ondata(event.data);
    }
  };

  return mediaRecorder
}



/*
* @param {HTMLVideoElement} - el
* @param {*} - config
* @param {Function} -  onPlaying
*/
function getDisplay(el,config, onPlaying){
  const hasGetDisplayMedia = () => !!navigator.mediaDevices?.getDisplayMedia;
  
  if(hasGetDisplayMedia){
    navigator.mediaDevices.getDisplayMedia(config)
      .then((stream)=> {
        if(!el)
           return
        el.srcObject = stream;
        el.play();
        onPlaying()
      }).catch((err)=> {
         console.log(err)
      })
  }
}


/*
* @param {HTMLVideoElement} - el
* @param {*} - config
* @param {Function} -  onPlaying
*/
function WebcamVideo(el,config, onPlaying){

    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

    if(hasGetUserMedia()){
        // only run once, the video becomes responsible for fetching from src
        //{ video: true, audio: false } - constraints
        navigator.mediaDevices.getUserMedia(config)
        .then(function(stream) {
        
           if(!el)
               return
           el.srcObject = stream;
           el.play();
           onPlaying()
        })
        .catch(function(err) {
           console.log("An error occurred! " + err);
        });
    }else{
        console.log("Need a web cam")
    }

}

/*
* @param {HTMLVideoElement} - videoElement
* @param {HTMLImageElement} - imageElement
* 
*/
function captureFrame(videoElement, imageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const capturedImage = new Image();
  capturedImage.src = canvas.toDataURL('image/jpeg');
  imageElement.src = capturedImage.src;
}


function saveStream(streamChunnks){
  console.log(streamChunnks)
  const blob = new Blob(streamChunnks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);

  // Create a link element to download the video
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recorded-video.webm';
  a.click();

}

let streaming = false
let globalVideoRef;
/**
 * @type {MediaRecorder}
 */
let mediaRecorder;
document.addEventListener("DOMContentLoaded", ()=> {
       /**
        * @type {HTMLDivElement}
        */
       const snap = document.querySelector(".media_snap")
        
       /**
         * @type {[HTMLImageElement, HTMLButtonElement]}
         */
        let [img, snapBtn] = snap.children
   
          snapBtn.onclick = () => {
            captureFrame(globalVideoRef, img)
          }
        /**
        * @type {HTMLDivElement}
        */
        
        const camcoder = document.querySelector(".media_webcam")
        /**
         * @type {[HTMLVideoElement, HTMLButtonElement]}
         */
        let [vid, cambtn] = camcoder.children
        
          cambtn.onclick = () => {
              WebcamVideo(vid, { video: true, audio: false }, () => {
                 streaming = true;
                 globalVideoRef = vid;
                 console.log("webcam")
              })
          }
        
          
          onkeydown = (e) => {
              
            if(e.key == " "){
              getDisplay(vid,{ video: true, audio: true }, ()=> {
                globalVideoRef = vid;
              })
            }else if(e.key == "r"){
              const stream = []
              mediaRecorder =  startRecording(vid.srcObject, (streamChunks)=> {
           
                   stream.push(streamChunks)
               })
               

               mediaRecorder.onstop = () => {
                  console.log("recording ended")
                  saveStream(stream)
               }

               mediaRecorder.onstart = () => {
                console.log("recording started")
               }
               
               mediaRecorder.start()

            }else if(e.key == "s"){
               mediaRecorder.stop()
            }else if(e.key == "c"){
                vid.srcObject.getTracks().forEach(track => track.stop());
             
               if(mediaRecorder && mediaRecorder.state == "recording"){
                       mediaRecorder.stop()
                  }
                    vid.src = ""
                   e.preventDefault()
              
            }


          }
})
