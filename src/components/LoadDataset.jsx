import React, { useState, useEffect } from "react";
import { LinearProgress, Slider, CircularProgress } from "@mui/material";
import IndexedDB from "../db/index.js";
import Lottie from "lottie-react";
import documentsLoadingAnimation from "../lotties/scan-document.json";
let worker = new Worker("./src/worker/worker.js");

export default function LoadDataset({ setDataLoaded }) {
  const [maxDocuments, setMaxDocuments] = useState(500);
  const [maxDocumentsAllowed, setMaxDocumentsAllowed] = useState(46068);
  const [isAlreadyLoaded, setIsAlreadyLoaded] = useState("checking");
  const [numberOfPreloadedDocuments, setNumberOfPreloadedDocuments] =
    useState(0);
  const [warningTextColor, setWarningTextColor] =
    useState("var(--white-color)");
  const [loading, setLoading] = useState({
    state: false,
    progress: 0,
    message: "",
  });
  const file = "games_full.json";

  const load = async () => {
    if (loading.state) return;
    if (isAlreadyLoaded == "checking") return;

    setLoading({
      state: true,
      progress: 0,
      message: "Initiatializing the loading process",
    });
    worker.postMessage({ action: "load", file, maxDocuments, forced: true });

    worker.onmessage = async (e) => {
      const { action } = e.data;

      switch (action) {
        case "loaded": {
          setLoading({
            state: false,
            progress: 100,
            message: "All documents loaded",
          });

          // Add the data to IndexedDB(name of table myDatabase) and set the dataLoaded state to true
          setDataLoaded(true);

          // Open the database
          const db = await IndexedDB.openDB();

          // Empty the database
          await IndexedDB.clearDB(db);

          // Add the data to the database
          await IndexedDB.addDocuments(db, e.data.documents.documentInfo);
          await IndexedDB.addIndexes(db, e.data.documents.index);
          await IndexedDB.addAverageDocLen(db, e.data.documents.averageDocLen);
          await IndexedDB.addStopWords(db, e.data.documents.stopWords);

          // Close the database
          IndexedDB.closeDB(db);

          break;
        }
        case "progress": {
          setLoading({
            state: true,
            progress: e.data.progress,
            message: e.data.message,
          });
          break;
        }
        default: {
          console.log(
            "[Load Dataset Webworker] Unknown action. Message is not handled."
          );
          break;
        }
      }
    };

    worker.onerror = (e) => {
      console.log(e);
    };
  };

  const preload = async () => {
    setLoading({
      state: false,
      progress: 100,
      message: "Preloaded data",
    });
    setDataLoaded(true);
  };

  const checkIfLoaded = async () => {
    // Open the database
    const db = await IndexedDB.openDB();

    // Get the documents from the database
    const d = await IndexedDB.getDocuments(db);
    if (!d) {
      setIsAlreadyLoaded("not-loaded");
      return;
    }
    const { documents } = d;

    // Get the indexes from the database
    const { index } = await IndexedDB.getIndexes(db);

    // Get the average document length from the database
    const { averageDocLen } = await IndexedDB.getAverageDocLen(db);

    // Get the stop words from the database
    const { stopWords } = await IndexedDB.getStopWords(db);

    // Close the database
    IndexedDB.closeDB(db);

    if (
      Object.keys(documents).length > 0 &&
      Object.keys(index).length > 0 &&
      averageDocLen > 0 &&
      stopWords.length > 0
    ) {
      setIsAlreadyLoaded("loaded");
      setNumberOfPreloadedDocuments(Object.keys(documents).length);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setMaxDocuments(newValue);
  };

  useEffect(() => {
    // Read the file with the data
    fetch(`./${file}`)
      .then((response) => response.json())
      .then((data) => {
        // Set the max documents to the length of the data
        setMaxDocumentsAllowed(data.apps.length);
      });

    // Check if the data is loaded
    checkIfLoaded();
  }, []);

  useEffect(() => {
    if (maxDocuments < 5000) {
      setWarningTextColor("var(--white-color)");
    } else if (maxDocuments < 8000) {
      setWarningTextColor("var(--warning-color)");
    } else if (maxDocuments < 20000) {
      setWarningTextColor("var(--error-color)");
    } else {
      setWarningTextColor("var(--fatal-error-color)");
    }
  }, [maxDocuments]);

  return (
    <>
      {loading.state && (
        <div className="vsm-loading">
          <h2>The documents are being loaded</h2>
          <p>Refresh the page if you want to cancel</p>
          <Lottie
            className="lottie"
            animationData={documentsLoadingAnimation}
            loop={true}
          />
          <p>{loading.message}</p>
          <LinearProgress
            className="vsm-loading-progress-bar"
            variant="determinate"
            value={loading.progress}
          />
        </div>
      )}
      <div
        style={loading.state ? { filter: "blur(6px)" } : {}}
        className="vsm-load-dataset-container"
      >
        <div className="vsm-load-dataset-head">
          <h1>
            The{" "}
            <a
              href="https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam?select=games_metadata.json"
              target="_blank"
            >
              Dataset
            </a>{" "}
            is not loaded.
          </h1>
          <p>
            The dataset contains information about Steam games, such as their
            title, description, tags, and more. You can write a query and the
            system will return the most similar games.
          </p>
        </div>
        <div className="vsm-load-controls">
          {isAlreadyLoaded == "checking" && (
            <div className="vsm-load-check-preload">
              <h2>Checking if documents are already loaded</h2>
              <CircularProgress />
            </div>
          )}
          {isAlreadyLoaded == "not-loaded" && (
            <div className="vsm-load-check-preload">
              <h2>Documents are not preloaded</h2>
            </div>
          )}
          {isAlreadyLoaded == "loaded" && (
            <div className="vsm-load-preload">
              <h2>
                There are {numberOfPreloadedDocuments} documents loaded already.
              </h2>
              <p>
                If you want to load different amount of documents, you can
                select use the range slider and click "Load Dataset" again.
              </p>
              <p>
                If you want to use the data that is already loaded, click
                "Continue".
              </p>

              <button
                className="primary-button vsm-load-preload-button"
                onClick={preload}
              >
                <span>CONTINUE</span>
              </button>
            </div>
          )}

          <h2>Max number of loaded documents</h2>
          <p className="vsm-load-warning" style={{ color: warningTextColor }}>
            Recommended under 8000 unless you are a loading spinner enjoyer. The
            data processing is handled in a separate thread, so the UI will not
            freeze, but you will have to wait a bit for the system to function
            properly.
          </p>
          <Slider
            defaultValue={500}
            max={maxDocumentsAllowed}
            min={10}
            onChange={handleSliderChange}
            aria-label="Default"
            valueLabelDisplay="auto"
            sx={{
              color: warningTextColor,
              "& .MuiSlider-thumb": {
                borderRadius: "50%",
              },
              maxWidth: "80%",
              transition: "color 0.5s",
            }}
          />
          <button
            className={
              isAlreadyLoaded == "checking"
                ? "vsm-load-dataset-button disabled"
                : "vsm-load-dataset-button"
            }
            onClick={load}
          >
            <span>LOAD DATASET</span>
          </button>
        </div>
      </div>
    </>
  );
}
