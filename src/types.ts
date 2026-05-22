export interface MovieListType {
  id: string;
  title: string;
  year: number;
  posterColor: string;
  posterUrl?: string;
  ratingImdb: number;
  ratingTmdb: number;
  ratingLetterboxd: number;
  description: string;
}

export interface MovieDetailType extends MovieListType {
  genre: string;
  director: string;
  runtime: string;
  longDescription: string;
  trailerThumbnail?: string;
  trailerUrl?: string;
  similarMovies: {
    id: string;
    title: string;
    year: number;
    posterColor: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
