import React from "react";
import posterPlaceholder from "@/assets/poster-indispo.png";

export const getPosterUrl = (poster: string | undefined): string => {
  if (!poster || poster === "N/A" || poster.trim() === "") {
    return posterPlaceholder;
  }
  return poster;
};

export const handlePosterError = (
  e: React.SyntheticEvent<HTMLImageElement>
): void => {
  e.currentTarget.src = posterPlaceholder;
};
