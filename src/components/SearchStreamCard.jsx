export default function SearchResultsCard({ index, similarity }) {
  return (
    <a href={`https://steamdb.info/app/${similarity.title}/`} target="_blank">
      <div
        className={
          index == 0
            ? "vsm-search-stream-card best-match"
            : "vsm-search-stream-card"
        }
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
        <div className="vsm-search-stream-card-name">
          <h3 className="vsm-search-stream-card-title">
            {index + 1}. {similarity.game_title}
          </h3>
          <p className="vsm-search-stream-card-id">{similarity.title}</p>
        </div>
        <div className="vsm-search-stream-card-similarity">
          <p>Match: </p>
          <p className="vsm-search-stream-card-chance">
            {parseInt(similarity.chance)}%
          </p>
        </div>
      </div>
    </a>
  );
}
