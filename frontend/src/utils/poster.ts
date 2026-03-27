export const getPosterUrl = (poster: string | null | undefined): string => {
  if (!poster || poster === "N/A" || poster.trim() === "") {
    return "";
  }
  return poster;
};

export const getHighQualityPosterUrl = (
  poster: string | null | undefined,
): string => {
  const url = getPosterUrl(poster);

  if (!url) {
    return "";
  }

  return url.replace(/(\._V1_).*(\.(?:jpg|jpeg|png))/i, "$1QL75_UX1400_$2");
};
