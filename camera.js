//Selector for your <video> element
const video = document.querySelector("video");
const options = {
  video: true,
};

navigator.mediaDevices
  .getUserMedia(options)
  .then((stream) => {
    video.srcObject = stream;
    console.log("video is running...!");
  })
  .catch((e) => {
    console.log(e);
  });

console.log("CAMERA IS WORKING");
