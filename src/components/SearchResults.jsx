import React, { Children } from "react";

export default function SearchResults({ children }) {
  return (
    <div className="vsm-search-results">
      {Children.map(children, (child) => {
        return child;
      })}
    </div>
  );
}
