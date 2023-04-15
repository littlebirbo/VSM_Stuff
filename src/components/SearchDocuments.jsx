import React, { useEffect, useState } from "react";
import SearchResults from "./SearchResults";
import SearchResultsCard from "./SearchResultsCard";
import SearchStreamCard from "./SearchStreamCard";
import SearchBarSection from "./SearchBarSection";
import { LinearProgress } from "@mui/material";
import IndexedDB from "../db/index.js";
import Lottie from "lottie-react";
import welcomeAnimation from "../lotties/godot-funny.json";
import searchDocuments from "../lotties/scan-similarities.json";
let worker = new Worker("./src/worker/worker.js");

export default function SearchDocuments({ setDataLoaded }) {
  const [query, setQuery] = useState(
`Example Query:
Title: Escape Dead Island

Description: Escape Dead Island is a Survival-Mystery adventure that lets players delve into the Dead Island universe and unravel the origins of the zombie outbreak.

Tags: "Zombies", "Adventure", "Survival", "Action", "Third Person", "Open World", "Gore", "Horror", "Singleplayer", "Multiplayer", "Cartoony", "Hack and Slash", "Stealth", "Co-op", "Atmospheric", "Survival Horror", "Third-Person Shooter", "Anime"
`
  );
  const [similarities, setSimilarities] = useState([]);
  const [searchProgress, setSearchProgress] = useState({
    state: false,
    progress: 0,
    message: "",
    relevantItems: [],
  });

  const search = async () => {
    if (searchProgress.state) return;

    // Set the search progress
    setSearchProgress({
      state: true,
      progress: 0,
      message: "Initializing the search process",
    });

    // Open the database
    const db = await IndexedDB.openDB();

    // Get the data from the database
    const indexDB = await IndexedDB.getIndexes(db);
    const documentInfoDB = await IndexedDB.getDocuments(db);
    const averageDocLenDB = await IndexedDB.getAverageDocLen(db);
    const stopWordsDB = await IndexedDB.getStopWords(db);

    const index = indexDB.index;
    const documentInfo = documentInfoDB.documents;
    const averageDocLen = averageDocLenDB.averageDocLen;
    const stopWords = stopWordsDB.stopWords;

    setSimilarities([]);

    worker.postMessage({
      action: "search",
      query,
      index,
      documentInfo,
      averageDocLen,
      stopWords,
    });

    worker.onmessage = (e) => {
      const { action } = e.data;

      switch (action) {
        case "completed": {
          const similarities = e.data.similarities
            .filter((item) => item.docId.toLowerCase() !== "query")
            .slice(0, 50);

          setSimilarities(similarities);

          setSearchProgress({
            state: false,
            progress: 100,
            message: "Search completed",
          });
          break;
        }
        case "progress": {
          const progress = parseInt(e.data.progress);
          const message = e.data.message;
          const relevantItems = e.data.relevantItems;

          setSearchProgress({
            state: true,
            progress,
            message,
            relevantItems,
          });

          break;
        }
        default: {
          console.log(
            "[Search Documents Webworker] Unknown action. Message is not handled."
          );
          break;
        }
      }
    };

    worker.onerror = (e) => {
      console.log(e);
    };
  };

  const back = () => {
    setDataLoaded(false);
  };

  return (
    <div className="vsm-search-container">
      <button className="vsm-search-back-button primary-button" onClick={back}>
        Back
      </button>
      <SearchBarSection query={query} setQuery={setQuery} search={search} />
      {searchProgress.state ? (
        <div className="vsm-search-loading-container">
          <Lottie
            className="vsm-search-progress-lottie"
            animationData={searchDocuments}
            loop={true}
          />
          <p className="vsm-search-progress-message">
            {searchProgress.message}
          </p>
          <div className="vsm-search-progress-bar-container">
            <LinearProgress
              className="vsm-search-progress-bar"
              variant="determinate"
              value={searchProgress.progress}
            />
            <p>{searchProgress.progress}%</p>
          </div>

          <h2>Most similar games so far</h2>
          {searchProgress.relevantItems ? (
            <div className="vsm-search-relevant-items">
              {searchProgress.relevantItems.map((item, index) => {
                return (
                  <SearchStreamCard
                    key={index}
                    index={index}
                    similarity={item}
                  />
                );
              })}
            </div>
          ) : (
            <p className="vsm-search-please-wait">Please wait...</p>
          )}
        </div>
      ) : (
        <>
          {!!similarities.length ? (
            <SearchResults>
              {similarities.map((sim, index) => {
                return (
                  <SearchResultsCard
                    key={index}
                    index={index}
                    similarity={sim}
                  />
                );
              })}
            </SearchResults>
          ) : (
            <div className="vsm-search-welcome">
              No results found. Try searching for something else.
              <Lottie animationData={welcomeAnimation} loop={true} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
