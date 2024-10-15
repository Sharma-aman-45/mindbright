import React, { useState, useEffect, useRef } from 'react';
import './Translate.css';

// Import images
import please from '../images/pleasesign.png';
import howareyou from '../images/howareyousign.png';
import no from '../images/NOsign.png';
import hello from '../images/hellosign.jpeg';
import thankYou from '../images/thankyousign.jpg';
import yes from '../images/yes.png';

function Translate() {
  const [showModal, setShowModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [finalResult, setFinalResult] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState(null);
  const [animationFrameId, setAnimationFrameId] = useState(null);

  const webcamRef = useRef(null);
  const modelRef = useRef(null);
  const webcamInstanceRef = useRef(null);
  const labelContainerRef = useRef(null);
  const predictionOutputRef = useRef(null);
  const finalResultRef = useRef(null);

  const signLibrary = [
    { image: hello, name: 'Hello' },
    { image: howareyou, name: 'How are you' },
    { image: no, name: 'No' },
    { image: please, name: 'Please' },
    { image: thankYou, name: 'Thank you' },
    { image: yes, name: 'Yes' },
  ];

  useEffect(() => {
    if (showModal) {
      loadScripts();
    }
  }, [showModal]);

  const loadScripts = async () => {
    setIsLoading(true);
    setLoadingStatus('Loading TensorFlow.js...');
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
      setLoadingStatus('Loading Teachable Machine...');
      await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js');
      setLoadingStatus('Scripts loaded. Ready to start.');
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading scripts:", error);
      setLoadingStatus('Error loading scripts. Please try again.');
      setError('Failed to load required scripts. Please refresh the page and try again.');
      setIsLoading(false);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const URL = "https://teachablemachine.withgoogle.com/models/Elr-I70JN/";
  let maxPredictions;

  async function init() {
    setIsLoading(true);
    setLoadingStatus('Loading model...');
    setError(null);
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
      modelRef.current = await window.tmImage.load(modelURL, metadataURL);
      maxPredictions = modelRef.current.getTotalClasses();

      setLoadingStatus('Setting up webcam...');
      const flip = true;
      webcamInstanceRef.current = new window.tmImage.Webcam(300, 300, flip);

      await webcamInstanceRef.current.setup();
      setLoadingStatus('Starting webcam...');
      await webcamInstanceRef.current.play();
      
      if (webcamRef.current) {
        webcamRef.current.innerHTML = '';
        webcamRef.current.appendChild(webcamInstanceRef.current.canvas);
      } else {
        throw new Error('Webcam container not found');
      }

      if (labelContainerRef.current) {
        labelContainerRef.current.innerHTML = '';
        for (let i = 0; i < maxPredictions; i++) {
          labelContainerRef.current.appendChild(document.createElement("div"));
        }
      } else {
        throw new Error('Label container not found');
      }

      setIsRunning(true);
      setIsLoading(false);
      setLoadingStatus('Camera started. Ready to predict.');
      loop();
    } catch (error) {
      console.error("Error initializing model or webcam:", error);
      setIsLoading(false);
      setLoadingStatus('Error: ' + error.message);
      setError('Failed to initialize the model or webcam. Please try again.');
    }
  }

  async function loop() {
    if (isRunning) {
      webcamInstanceRef.current.update();
      await predict();
      const newAnimationFrameId = window.requestAnimationFrame(loop);
      setAnimationFrameId(newAnimationFrameId);
    }
  }

  async function predict() {
    if (!modelRef.current || !webcamInstanceRef.current) {
      console.error("Model or webcam not initialized");
      setLoadingStatus('Error: Model or webcam not initialized');
      return;
    }

    try {
      const prediction = await modelRef.current.predict(webcamInstanceRef.current.canvas);
      const maxProbability = Math.max(...prediction.map(p => p.probability));
      const predictedClass = prediction.find(p => p.probability === maxProbability);
      
      if (predictionOutputRef.current) {
        predictionOutputRef.current.innerHTML = ` Predicted class: ${predictedClass.className} (Probability: ${predictedClass.probability.toFixed(2)})`;
      }
      
      setFinalResult(predictedClass.className);
    } catch (error) {
      console.error("Prediction error:", error);
      setLoadingStatus('Error during prediction: ' + error.message);
    }
  }

  function displayFinalResult() {
    finalResultRef.current.innerHTML = `Final Result: ${finalResult}`;
    setTranslatedText(`Translated: ${finalResult}`);
  }

  function stop() {
    setIsRunning(false);
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
    if (webcamInstanceRef.current) {
      webcamInstanceRef.current.stop();
    }
    if (predictionOutputRef.current) {
      predictionOutputRef.current.innerHTML = '';
    }
    if (finalResultRef.current) {
      finalResultRef.current.innerHTML = '';
    }
    setTranslatedText('');
  }

  function restart() {
    stop();
    init();
  }

  const [showAtoZModal, setShowAtoZModal] = useState(false);
  const [showNumberModal, setShowNumberModal] = useState(false);

  const loadAtoZScript = () => {
    const AtoZModelURL = "https://teachablemachine.withgoogle.com/models/C35_UTABU/";
    
    let model, webcam, labelContainer, maxPredictions;
    let isRunning = false;
    let animationFrameId = null;
    let finalResult = "";

    async function loadRequiredScripts() {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js');
    }

    async function init() {
      await loadRequiredScripts();
      
      const modelURL = AtoZModelURL + "model.json";
      const metadataURL = AtoZModelURL + "metadata.json";

      // Now we can use window.tmImage
      model = await window.tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      const flip = true;
      webcam = new window.tmImage.Webcam(200, 200, flip);
      await webcam.setup();
      await webcam.play();
      document.getElementById("webcam-container").appendChild(webcam.canvas);
      labelContainer = document.getElementById("label-container");
      labelContainer.innerHTML = ""; // Clear previous labels
      for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
      }

      isRunning = true;
      animationFrameId = window.requestAnimationFrame(loop);
      updateButtonStates(true);
    }

    async function loop() {
      if (isRunning) {
        webcam.update();
        await predict();
        animationFrameId = window.requestAnimationFrame(loop);
      }
    }

    async function predict() {
      const prediction = await model.predict(webcam.canvas);
      const maxProbability = Math.max(...prediction.map(p => p.probability));
      const predictedClass = prediction.find(p => p.probability === maxProbability);
      document.getElementById("prediction-output").innerHTML = `Predicted class: ${predictedClass.className} (Probability: ${predictedClass.probability.toFixed(2)})`;
      finalResult = predictedClass.className;
    }

    function displayFinalResult() {
      document.getElementById("final-result").innerHTML = `Final Result: ${finalResult}`;
    }

    function stop() {
      isRunning = false;
      window.cancelAnimationFrame(animationFrameId);
      webcam.stop();
      updateButtonStates(false);
    }

    function restart() {
      stop();
      document.getElementById("webcam-container").innerHTML = ""; // Clear webcam container
      document.getElementById("prediction-output").innerHTML = ""; 
      document.getElementById("final-result").innerHTML = ""; 
      init();
    }

    function updateButtonStates(isRunning) {
      document.getElementById("start-button").disabled = isRunning;
      document.getElementById("stop-button").disabled = !isRunning;
      document.getElementById("predict-button").disabled = !isRunning;
      document.getElementById("restart-button").disabled = !isRunning;
    }

    // Expose functions to window object
    window.AtoZFunctions = {
      init,
      stop,
      displayFinalResult,
      restart
    };
  };

  const loadNumberScript = () => {
    const NumberModelURL = "https://teachablemachine.withgoogle.com/models/-zDf2FdEU/";
    
    let model, webcam, labelContainer, maxPredictions;
    let isRunning = false;
    let animationFrameId = null;
    let finalResult = "";

    async function loadRequiredScripts() {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js');
    }

    async function init() {
      await loadRequiredScripts();
      
      const modelURL = NumberModelURL + "model.json";
      const metadataURL = NumberModelURL + "metadata.json";

      model = await window.tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      const flip = true;
      webcam = new window.tmImage.Webcam(200, 200, flip);
      await webcam.setup();
      await webcam.play();
      document.getElementById("number-webcam-container").appendChild(webcam.canvas);
      labelContainer = document.getElementById("number-label-container");
      labelContainer.innerHTML = "";
      for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
      }

      isRunning = true;
      animationFrameId = window.requestAnimationFrame(loop);
      updateButtonStates(true);
    }

    async function loop() {
      if (isRunning) {
        webcam.update();
        await predict();
        animationFrameId = window.requestAnimationFrame(loop);
      }
    }

    async function predict() {
      const prediction = await model.predict(webcam.canvas);
      const maxProbability = Math.max(...prediction.map(p => p.probability));
      const predictedClass = prediction.find(p => p.probability === maxProbability);
      document.getElementById("number-prediction-output").innerHTML = `Predicted number: ${predictedClass.className} (Probability: ${predictedClass.probability.toFixed(2)})`;
      finalResult = predictedClass.className;
    }

    function displayFinalResult() {
      document.getElementById("number-final-result").innerHTML = `Final Result: ${finalResult}`;
    }

    function stop() {
      isRunning = false;
      window.cancelAnimationFrame(animationFrameId);
      webcam.stop();
      updateButtonStates(false);
    }

    function restart() {
      stop();
      document.getElementById("number-webcam-container").innerHTML = "";
      document.getElementById("number-prediction-output").innerHTML = "";
      document.getElementById("number-final-result").innerHTML = "";
      init();
    }

    function updateButtonStates(isRunning) {
      document.getElementById("number-start-button").disabled = isRunning;
      document.getElementById("number-stop-button").disabled = !isRunning;
      document.getElementById("number-predict-button").disabled = !isRunning;
      document.getElementById("number-restart-button").disabled = !isRunning;
    }

    // Expose functions to window object
    window.NumberFunctions = {
      init,
      stop,
      displayFinalResult,
      restart
    };
  };

  return (
    <div className="translate">
      <h1 className="page-title">Sign Language Translator</h1>
      <div className="translator-container">
        <div className="sign-input-container">
          <h2>Sign Language Input</h2>
          <div className="sign-input-area">
            <p>Sign language input area</p>
            <div className="button-container">
              <button onClick={() => {
                setShowAtoZModal(true);
                loadAtoZScript();
              }}>A to Z</button>
              <button onClick={() => {
                setShowNumberModal(true);
                loadNumberScript();
              }}>Numbers 1-10</button>
            </div>
          </div>
        </div>
        <div className="text-output-container">
          <h2>Translated Text</h2>
          <div className="text-output-area">
            <p>{translatedText}</p>
          </div>
        </div>
      </div>
      <div className="sign-library">
        <h2 className="library-title">Sign Library</h2>
        <div className="sign-cards">
          {signLibrary.map((sign, index) => (
            <div key={index} className="sign-card">
              <img src={sign.image} alt={sign.name} />
              <p>{sign.name}</p>
            </div>
          ))}
        </div>
      </div>
      {showAtoZModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>A to Z Sign Language Recognition</h2>
            <div>Model</div>
            <button type="button" id="start-button" onClick={() => window.AtoZFunctions.init()}>Start Prediction</button>
            <button type="button" id="stop-button" onClick={() => window.AtoZFunctions.stop()} disabled>Stop</button>
            <button type="button" id="predict-button" onClick={() => window.AtoZFunctions.displayFinalResult()} disabled>Predict</button>
            <button type="button" id="restart-button" onClick={() => window.AtoZFunctions.restart()} disabled>Restart</button>
            <div id="webcam-container"></div>
            <div id="label-container"></div>
            <div id="prediction-output"></div>
            <div id="final-result"></div>
            <button onClick={() => setShowAtoZModal(false)}>Close</button>
          </div>
        </div>
      )}
      {showNumberModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Numbers 1-10 Sign Language Recognition</h2>
            <div>Model</div>
            <button type="button" id="number-start-button" onClick={() => window.NumberFunctions.init()}>Start Prediction</button>
            <button type="button" id="number-stop-button" onClick={() => window.NumberFunctions.stop()} disabled>Stop</button>
            <button type="button" id="number-predict-button" onClick={() => window.NumberFunctions.displayFinalResult()} disabled>Predict</button>
            <button type="button" id="number-restart-button" onClick={() => window.NumberFunctions.restart()} disabled>Restart</button>
            <div id="number-webcam-container"></div>
            <div id="number-label-container"></div>
            <div id="number-prediction-output"></div>
            <div id="number-final-result"></div>
            <button onClick={() => setShowNumberModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Translate;