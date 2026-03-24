export const getPosterUrl = (poster: string | null | undefined): string => {
  if (!poster || poster === "N/A" || poster.trim() === "") {
    return "";
  }
  return poster;
};

/**
 * Return a higher quality poster URL when source provider supports size tokens.
 * Falls back to the original poster URL when no transform can be applied.
 */
export const getHighQualityPosterUrl = (
  poster: string | null | undefined,
): string => {
  const url = getPosterUrl(poster);

  if (!url) {
    return "";
  }

  // IMDb/Amazon posters often expose a size segment between "._V1_" and extension.
  // Replacing it with a larger target width improves hero sharpness on big screens.
  return url.replace(/(\._V1_).*(\.(?:jpg|jpeg|png))/i, "$1QL75_UX1400_$2");
};
