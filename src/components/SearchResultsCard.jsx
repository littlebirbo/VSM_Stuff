import React, { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function SearchResultsCard({ index, similarity }) {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={index == 0 ? "vsm-search-card best-match" : "vsm-search-card"}
    >
      <img
        className="vsm-search-card-banner"
        src={similarity.thumbnail}
        alt="Game Banner"
        loading="lazy"
        onError={(event) => {
          event.target.src = "./gallery/app_banner_placeholder.png";
        }}
      />
      <div className="vsm-search-card-name">
        <h3 className="vsm-search-card-title">
          {index + 1}. {similarity.game_title}
        </h3>
        <p className="vsm-search-card-id">ID: {similarity.title}</p>
      </div>
      <div className="vsm-search-tags">
        {similarity.tags[0] && (
          <div className="vsm-search-tag" key={similarity.tags[0]}>
            <p>{similarity.tags[0]}</p>
          </div>
        )}
        {similarity.tags[1] && (
          <div className="vsm-search-tag" key={similarity.tags[1]}>
            <p>{similarity.tags[1]}</p>
          </div>
        )}
        {similarity.tags[2] && (
          <div className="vsm-search-tag" key={"more-tags"}>
            <p>...</p>
          </div>
        )}

        {/* {similarity.tags.map((tag) => {
          return (
            <div className="vsm-search-tag" key={tag}>
              <p>{tag}</p>
            </div>
          );
        })} */}
      </div>
      <p className="vsm-search-description">{similarity.description}</p>
      <div className="vsm-search-card-similarity">
        <p>Match: </p>
        <p className="vsm-search-card-chance">
          {(similarity.chance * 100).toFixed(2)}%
        </p>
      </div>
      <a
        className="vsm-search-card-view"
        href={`https://steamdb.info/app/${similarity.title}/`}
        target="_blank"
      >
        View
      </a>
    </div>
  );
}
