import React, { Component } from "react";
import { log, status } from "./logging";

const config = {
  debug: true,
  modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models",
  face: {
    enabled: true,
  },
  body: { enabled: true },
  hand: { enabled: true },
  object: { enabled: true },
};

class RunHuman extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      warningCount: 0,
    };

    this.video = null;
    this.canvas = null;
    this.human = null;

    if (typeof document !== "undefined") {
      this.video =
        document.getElementById(this.props.inputId) ||
        document.createElement("video");
      this.canvas =
        document.getElementById(this.props.outputId) ||
        document.createElement("canvas");

      import("@vladmandic/human").then((H) => {
        this.human = new H.default(config);
        log(
          "human version:",
          this.human.version,
          "| tfjs version:",
          this.human.tf.version["tfjs-core"]
        );
        log(
          "platform:",
          this.human.env.platform,
          "| agent:",
          this.human.env.agent
        );
        status("loading models...");
        this.human.load().then(() => {
          log(
            "backend:",
            this.human.tf.getBackend(),
            "| available:",
            this.human.env.backends
          );
          log(
            "loaded models:" +
              Object.values(this.human.models).filter((model) => model !== null)
                .length
          );
          status("initializing...");
          this.human.warmup().then(() => {
            this.setState({ ready: true });
            status("ready...");
          });
        });
      });
    }
  }

  componentDidMount() {
    if (this.video) {
      this.video.onresize = () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      };
    }
    if (this.canvas) {
      this.canvas.onclick = () => {
        this.video.paused ? this.video.play() : this.video.pause();
      };
    }
  }

  render() {
    if (this.state.ready) {
      setTimeout(async () => {
        await this.detect();
      }, 10);
    }

    if (!this.video || !this.canvas || !this.human || !this.human.result) {
      return null;
    }

    if (!this.video.paused) {
      const interpolated = this.human.next(this.human.result);
      const { gesture: interpolatedGesture, object: interpolatedObject } =
        interpolated;
      console.log("Interpolated Gesture:", interpolatedGesture);
      console.log("Interpolated Object:", interpolatedObject);
      this.human.draw.canvas(this.video, this.canvas);
      // this.human.draw.all(this.canvas, interpolated);

      const checkGesture = (gesture, storageKey, warningThreshold) => {
        if (interpolatedGesture.some((item) => item.gesture === gesture)) {
          console.log(`User is facing ${gesture}!`);
          const storedCount = localStorage.getItem(storageKey) || 0;
          localStorage.setItem(storageKey, parseInt(storedCount) + 1);
          const currentCount = parseInt(storedCount) + 1;
          if (currentCount >= warningThreshold) {
            this.setState((prevState) => ({
              warningCount: prevState.warningCount + 1,
            }));
            // alert(
            //   `Warning: You are ${gesture} too often! (Warning Count: ${
            //     this.state.warningCount + 1
            //   })`
            // );
            console.log(
              `Warning: You are looking ${gesture} too often! (Warning Count: ${
                this.state.warningCount + 1
              })`
            );
            localStorage.setItem(storageKey, 0);
          }
        }
      };

      checkGesture("head down" && "looking down", "headDownCount", 50);
      checkGesture("facing left", "headLeftCount", 100);
      checkGesture("facing right", "headRightCount", 100);
      checkGesture("head up", "headUpCount", 100);

      if (
        interpolatedObject.some(
          (item) => item.label === "person" && item.score > 0.25
        )
      ) {
        const personCount = interpolatedObject.filter(
          (item) => item.label === "person" && item.score > 0.3
        ).length;
        if (personCount >= 2) {
          const storedUpCount =
            localStorage.getItem("otherPersonDetected") || 0;
          localStorage.setItem(
            "otherPersonDetected",
            parseInt(storedUpCount) + 1
          );
          const currentUpCount = parseInt(storedUpCount) + 1;
          const warningThreshold = 10;
          if (currentUpCount >= warningThreshold) {
            this.setState((prevState) => ({
              warningCount: prevState.warningCount + 1,
            }));
            // alert("More than 1 person Detected");
            console.log(
              `Warning: More than 1 Person Detected! (Warning Count: ${
                this.state.warningCount + 1
              })`
            );
            localStorage.setItem("otherPersonDetected", 0);
          }
        }
      } else if (interpolatedObject.length === 0 || interpolatedObject.some((item) => item.label !== "person")) {
        // No person detected or an item with label other than "person"
        console.log("No Person Detected");
        const storedUpCount = localStorage.getItem("noPerson") || 0;
        localStorage.setItem("noPerson", parseInt(storedUpCount) + 1);
        const currentUpCount = parseInt(storedUpCount) + 1;
        const warningThreshold = 10;
        if (currentUpCount >= warningThreshold) {
          this.setState((prevState) => ({
            warningCount: prevState.warningCount + 1,
          }));
          console.log(
            `Warning: No Person Detected! (Warning Count: ${this.state.warningCount + 1})`
          );
          // alert("No person Detected");
          localStorage.setItem("noPerson", 0);
        }
      }
      

      if (
        interpolatedObject.some(
          (item) => item.label === "cell phone" && item.score > 0.1
        )
      ) {
        const storedUpCount = localStorage.getItem("cellPhone") || 0;
        localStorage.setItem("cellPhone", parseInt(storedUpCount) + 1);
        const currentUpCount = parseInt(storedUpCount) + 1;
        const warningThreshold = 50;
        if (currentUpCount >= warningThreshold) {
          this.setState((prevState) => ({
            warningCount: prevState.warningCount + 1,
          }));
          // alert("Cell Phone Detected");
          console.log(
            `Warning: Cell Phone Detected (Warning Count: ${
              this.state.warningCount + 1
            })`
          );
          localStorage.setItem("cellPhone", 0);
        }
      }
    }

    return (
      <div style={{ position: "absolute", top: 10, left: 10, color: "red" }}>
        Alert Count: {this.state.warningCount}
      </div>
    );
  }

  detect = async () => {
    if (!this || !this.human || !this.video || !this.canvas) {
      return;
    }

    try {
      await this.human.detect(this.video);
      this.setState({ ready: true, frame: this.state.frame + 1 });
    } catch (error) {
      console.error("Error during detection:", error);
    }
  };
}

export default RunHuman;
