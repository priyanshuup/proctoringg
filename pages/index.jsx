import Head from "next/head";
import Image from "next/image";
import InitWebCam from "../components/InitWebCam";
import styles from "../styles/elements.module.css";
import RunHuman from "../components/RunHuman";

const imageLoader = ({ src = "" }) =>
  `https://vladmandic.github.io/human-next/public${src}`;

const Index = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Human</title>
        <meta
          name="description"
          content="Human: Demo with TypeScript/ReactJS/NextJS"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <canvas id="canvas" className={styles.output} />{" "}
      <video id="video" className={styles.webcam} autoPlay muted />{" "}
      <div id="status" className={styles.status}></div>
      <div id="log" className={styles.log}></div>
      <div id="performance" className={styles.performance}></div>
      <InitWebCam elementId="video" />
      <RunHuman inputId="video" outputId="canvas" />{" "}
    </div>
  );
};

export default Index;
