import { useState, useEffect } from "react";
import "./App.css";
import "./css/Buttons.css";
import "./css/LoadDataset.css";
import "./css/LoadDatasetControls.css";
import "./css/PreloadedDataset.css";
import "./css/SearchPage.css";
import "./css/SearchResults.css";
import "./css/SearchStream.css";

import LoadDataset from "./components/LoadDataset";
import SearchDocuments from "./components/SearchDocuments";

function App() {
  const [dataLoaded, setDataLoaded] = useState(false);

  return (
    <div className="App">
      {dataLoaded ? (
        <SearchDocuments setDataLoaded={setDataLoaded} />
      ) : (
        <LoadDataset setDataLoaded={setDataLoaded} />
      )}
    </div>
  );
}

export default App;
