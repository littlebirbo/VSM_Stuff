import React from "react";

export default function SearchBarSection({ query, setQuery, search }) {
  return (
    <div className="vsm-search-head">
      <h1>
        Describe a game and you will be presented with 50 games matching your
        description.
      </h1>
      <div className="vsm-search-textarea">
        <textarea
          className="vsm-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button className="vsm-search-run-button primary-button" onClick={search}>
        SEARCH
      </button>
    </div>
  );
}
