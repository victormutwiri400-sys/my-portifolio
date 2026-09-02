import "../styles/AssetPreview.css";

export const isPdf = (url) => /\.pdf(?:$|[?#])/i.test(url || "");

const AssetPreview = ({ src, alt, className, pdfLabel = "Open PDF" }) => {
  if (isPdf(src)) {
    return (
      <a
        className="pdf-preview"
        href={src}
        target="_blank"
        rel="noreferrer"
        aria-label={`${alt}: ${pdfLabel}`}
      >
        <span aria-hidden="true">PDF</span>
        <span>{pdfLabel}</span>
      </a>
    );
  }

  return <img src={src} alt={alt} className={className} />;
};

export default AssetPreview;
