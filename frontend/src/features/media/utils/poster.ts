import React from "react";
import posterPlaceholder from "@/assets/pixel.jpg";

export const getPosterUrl = (poster: string | null | undefined): string => {
  if (!poster || poster === "N/A" || poster.trim() === "") {
    return posterPlaceholder;
  }
  return poster;
};

export const handlePosterError = (
  e: React.SyntheticEvent<HTMLImageElement>,
): void => {
  e.currentTarget.src = posterPlaceholder;
};
