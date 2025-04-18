import TrackPlayer, { Event } from "react-native-track-player";

module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log("Remote play received");
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log("Remote pause received");
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log("Remote next received");
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log("Remote previous received");
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log("Remote stop received");
    TrackPlayer.reset();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    console.log("Remote seek received", event);
    TrackPlayer.seekTo(event.position);
  });

  // Return null to indicate we're good to go
  return Promise.resolve();
};
