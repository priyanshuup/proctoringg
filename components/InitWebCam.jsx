import React, { Component } from "react";

class InitWebCam extends Component {
  video;
  stream;
  track;
  settings;
  constraints;
  capabilities;

  constructor(props) {
    super(props);
    this.state = { ready: false };

    if (typeof document === 'undefined' || !navigator?.mediaDevices) return;

    this.video = document.getElementById(props.elementId) || document.createElement('video');
    this.video.style.display = 'none';
    this.video.id = props.elementId;

    this.constraints = { audio: false, video: { facingMode: 'user', width: { ideal: 640 } } };

    this.initCamera();
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      this.track = this.stream.getVideoTracks()[0];
      this.capabilities = this.track.getCapabilities ? this.track.getCapabilities() : undefined;
      this.settings = this.track.getSettings ? this.track.getSettings() : undefined;

      this.video.onloadeddata = () => this.setState({ ready: true });
      this.video.srcObject = this.stream;
      this.video.play();
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }

  render() {
    if (this.state.ready) {
      console.log(
        'video:',
        this.video.videoWidth,
        this.video.videoHeight,
        this.track.label,
        {
          stream: this.stream,
          track: this.track,
          settings: this.settings,
          constraints: this.constraints,
          capabilities: this.capabilities
        }
      );
    }
    return null;
  }
}

export default InitWebCam;
