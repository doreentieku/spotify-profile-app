"use client";

import { createContext, useContext, useState } from "react";

interface GenreFilterContextType {
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
}

const GenreFilterContext = createContext<GenreFilterContextType | undefined>(undefined);

export function GenreFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedGenre, setSelectedGenre] = useState("");

  return (
    <GenreFilterContext.Provider value={{ selectedGenre, setSelectedGenre }}>
      {children}
    </GenreFilterContext.Provider>
  );
}

export function useGenreFilter() {
  const context = useContext(GenreFilterContext);
  if (!context) throw new Error("useGenreFilter must be used inside GenreFilterProvider");
  return context;
}
