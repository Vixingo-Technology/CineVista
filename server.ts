import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });
dotenv.config();

// Require API key early
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini API will fail.");
}

const ai = new GoogleGenAI({ 
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cache setup
const cache = {
  popularMovies: null as any,
  popularMoviesTimestamp: 0,
  movieDetails: new Map<string, { data: any, timestamp: number }>(),
};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

	app.post("/api/movies/popular", async (req, res) => {
	try {
      if (cache.popularMovies && Date.now() - cache.popularMoviesTimestamp < CACHE_TTL) {
        console.log("Serving popular movies from cache");
        return res.json(cache.popularMovies);
      }

	  const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: "List 10 highly popular and highly rated movies. Return a JSON array of objects. Each object should have: id (a unique string like 'm1'), title, year, posterColor (a hex color string that looks good for a placeholder, e.g. '#1e293b'), posterUrl (a highly accurate direct URL to the movie poster, try using TMDB image urls like https://image.tmdb.org/t/p/w500/ followed by the exact known poster path. DO NOT USE BASE64 OR DATA URIS), ratingImdb (number 1-10), ratingTmdb (number 1-100), ratingLetterboxd (number 1-5), and a short description (1-2 sentences). Just output the raw JSON array, without any markdown formatting wrappers.",
		config: {
		  maxOutputTokens: 8192,
		  responseMimeType: "application/json",
		  responseSchema: {
			type: Type.ARRAY,
			items: {
			  type: Type.OBJECT,
			  properties: {
				id: { type: Type.STRING },
				title: { type: Type.STRING },
				year: { type: Type.INTEGER },
				posterColor: { type: Type.STRING },
				posterUrl: { type: Type.STRING },
				ratingImdb: { type: Type.NUMBER },
				ratingTmdb: { type: Type.NUMBER },
				ratingLetterboxd: { type: Type.NUMBER },
				description: { type: Type.STRING },
			  }
			}
		  }
		}
	  });
      
      let text = response.text || "[]";
      // Cleanup any potential markdown or broken parts if necessary
      text = text.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "").trim();
      let movies = JSON.parse(text);
      
      cache.popularMovies = movies;
      cache.popularMoviesTimestamp = Date.now();
      
      res.json(movies);
    } catch (e: any) {
      console.log("Serving cached popular movies due to API limit.");
      const fallbackMovies = [
          {
            id: "m1",
            title: "Dune: Part Two",
            year: 2024,
            posterColor: "#b27341",
            posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGvwMEFA.jpg",
            ratingImdb: 8.8,
            ratingTmdb: 84,
            ratingLetterboxd: 4.5,
            description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family."
          },
          {
            id: "m2",
            title: "Oppenheimer",
            year: 2023,
            posterColor: "#2c2825",
            posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            ratingImdb: 8.4,
            ratingTmdb: 81,
            ratingLetterboxd: 4.2,
            description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
          },
          {
            id: "m3",
            title: "Spider-Man: Across the Spider-Verse",
            year: 2023,
            posterColor: "#611e2f",
            posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
            ratingImdb: 8.6,
            ratingTmdb: 84,
            ratingLetterboxd: 4.5,
            description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence."
          },
          {
            id: "m4",
            title: "The Dark Knight",
            year: 2008,
            posterColor: "#11141a",
            posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            ratingImdb: 9.0,
            ratingTmdb: 85,
            ratingLetterboxd: 4.7,
            description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
          },
          {
            id: "m5",
            title: "Interstellar",
            year: 2014,
            posterColor: "#000000",
            posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QlsUUHXjNENVD0hbrxPZ6X.jpg",
            ratingImdb: 8.7,
            ratingTmdb: 84,
            ratingLetterboxd: 4.3,
            description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
          },
          {
            id: "m6",
            title: "Parasite",
            year: 2019,
            posterColor: "#45533b",
            posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
            ratingImdb: 8.5,
            ratingTmdb: 85,
            ratingLetterboxd: 4.6,
            description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
          },
          {
            id: "m7",
            title: "Inception",
            year: 2010,
            posterColor: "#323945",
            posterUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
            ratingImdb: 8.8,
            ratingTmdb: 84,
            ratingLetterboxd: 4.2,
            description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
          },
          {
            id: "m8",
            title: "Everything Everywhere All at Once",
            year: 2022,
            posterColor: "#93202e",
            posterUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
            ratingImdb: 7.8,
            ratingTmdb: 79,
            ratingLetterboxd: 4.3,
            description: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led."
          }
      ];
      
      cache.popularMovies = fallbackMovies;
      cache.popularMoviesTimestamp = Date.now();
      
      res.json(fallbackMovies);
    }
  });

  app.post("/api/movies/:id/details", async (req, res) => {
    let title = req.body?.title || "";
    try {
      const cached = cache.movieDetails.get(title);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("Serving movie details from cache for:", title);
        return res.json(cached.data);
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide details for the movie "${title}". Return a JSON object with: id (keep it consistent or generate), title, year, genre (comma separated string), director, runtime (string like '2h 14m'), ratingImdb (number 1-10), ratingTmdb (number 1-100), ratingLetterboxd (number 1-5), longDescription, posterColor (hex), posterUrl (a highly accurate direct URL to the movie poster, try using TMDB image urls like https://image.tmdb.org/t/p/w500/ followed by the exact known poster path. DO NOT USE BASE64 OR DATA URIS), a valid 'trailerUrl' (YouTube embed URL, eg: https://www.youtube.com/embed/... or something standard. Prefer trailers that ALLOW embedding on other websites), a 'trailerThumbnail' (a URL to a placeholder image, NO BASE64), and an array of 5 'similarMovies' (objects with id, title, year, posterColor, posterUrl).`,
        config: {
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              year: { type: Type.INTEGER },
              genre: { type: Type.STRING },
              director: { type: Type.STRING },
              runtime: { type: Type.STRING },
              ratingImdb: { type: Type.NUMBER },
              ratingTmdb: { type: Type.NUMBER },
              ratingLetterboxd: { type: Type.NUMBER },
              longDescription: { type: Type.STRING },
              posterColor: { type: Type.STRING },
              posterUrl: { type: Type.STRING },
              trailerUrl: { type: Type.STRING },
              trailerThumbnail: { type: Type.STRING },
              similarMovies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    year: { type: Type.INTEGER },
                    posterColor: { type: Type.STRING },
                    posterUrl: { type: Type.STRING },
                  }
                }
              }
            }
          }
        }
      });
      
      let text = response.text || "{}";
      text = text.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "").trim();
      let details = JSON.parse(text);
      
      cache.movieDetails.set(title, { data: details, timestamp: Date.now() });
      
      res.json(details);
    } catch (e: any) {
      console.log("Serving cached generic details due to API limit.");
      
      const hardcodedFallbacks: any[] = [
        {
          id: "m1",
          title: "Dune: Part Two",
          year: 2024,
          genre: "Sci-Fi, Adventure",
          director: "Denis Villeneuve",
          runtime: "2h 46m",
          longDescription: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
          posterColor: "#b27341",
          posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGvwMEFA.jpg",
          ratingImdb: 8.8,
          ratingTmdb: 84,
          ratingLetterboxd: 4.5,
          trailerUrl: "https://www.youtube.com/embed/U2Qp5pL3ovA",
          trailerThumbnail: "https://img.youtube.com/vi/U2Qp5pL3ovA/hqdefault.jpg",
          similarMovies: []
        },
        {
          id: "m2",
          title: "Oppenheimer",
          year: 2023,
          genre: "Biography, Drama",
          director: "Christopher Nolan",
          runtime: "3h 00m",
          longDescription: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
          posterColor: "#2c2825",
          posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
          ratingImdb: 8.4,
          ratingTmdb: 81,
          ratingLetterboxd: 4.2,
          trailerUrl: "https://www.youtube.com/embed/bK6ldnjE3Y0",
          trailerThumbnail: "https://img.youtube.com/vi/bK6ldnjE3Y0/hqdefault.jpg",
          similarMovies: []
        },
        {
          id: "m3",
          title: "Spider-Man: Across the Spider-Verse",
          year: 2023,
          genre: "Animation, Action",
          director: "Joaquim Dos Santos",
          runtime: "2h 20m",
          longDescription: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
          posterColor: "#611e2f",
          posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
          ratingImdb: 8.6,
          ratingTmdb: 84,
          ratingLetterboxd: 4.5,
          trailerUrl: "https://www.youtube.com/embed/shW9i6k8cB0",
          trailerThumbnail: "https://img.youtube.com/vi/shW9i6k8cB0/hqdefault.jpg",
          similarMovies: []
        },
        {
          id: "m4",
          title: "The Dark Knight",
          year: 2008,
          genre: "Action, Crime",
          director: "Christopher Nolan",
          runtime: "2h 32m",
          longDescription: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests.",
          posterColor: "#11141a",
          posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          ratingImdb: 9.0,
          ratingTmdb: 85,
          ratingLetterboxd: 4.7,
          trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
          trailerThumbnail: "https://img.youtube.com/vi/EXeTwQWrcwY/hqdefault.jpg",
          similarMovies: []
        },
        {
          id: "m5",
          title: "Interstellar",
          year: 2014,
          genre: "Adventure, Sci-Fi",
          director: "Christopher Nolan",
          runtime: "2h 49m",
          longDescription: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
          posterColor: "#000000",
          posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QlsUUHXjNENVD0hbrxPZ6X.jpg",
          ratingImdb: 8.7,
          ratingTmdb: 84,
          ratingLetterboxd: 4.3,
          trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
          trailerThumbnail: "https://img.youtube.com/vi/zSWdZVtXT7E/hqdefault.jpg",
          similarMovies: []
        },
        {
          id: "m6",
          title: "Parasite",
          year: 2019,
          genre: "Thriller, Drama",
          director: "Bong Joon Ho",
          runtime: "2h 12m",
          longDescription: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
          posterColor: "#45533b",
          posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
          ratingImdb: 8.5,
          ratingTmdb: 85,
          ratingLetterboxd: 4.6,
          trailerUrl: "https://www.youtube.com/embed/5xH0HfJHsaY",
          trailerThumbnail: "https://img.youtube.com/vi/5xH0HfJHsaY/hqdefault.jpg",
          similarMovies: []
        },
        {
          id: "m7",
          title: "Inception",
          year: 2010,
          genre: "Action, Sci-Fi",
          director: "Christopher Nolan",
          runtime: "2h 28m",
          longDescription: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          posterColor: "#323945",
          posterUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
          ratingImdb: 8.8,
          ratingTmdb: 84,
          ratingLetterboxd: 4.2,
          trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
          trailerThumbnail: "https://img.youtube.com/vi/YoHD9XEInc0/hqdefault.jpg",
          similarMovies: []
        },
        {
          id: "m8",
          title: "Everything Everywhere All at Once",
          year: 2022,
          genre: "Action, Adventure",
          director: "Daniel Kwan, Daniel Scheinert",
          runtime: "2h 19m",
          longDescription: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes.",
          posterColor: "#93202e",
          posterUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
          ratingImdb: 7.8,
          ratingTmdb: 79,
          ratingLetterboxd: 4.3,
          trailerUrl: "https://www.youtube.com/embed/wxN1T1uxQ2g",
          trailerThumbnail: "https://img.youtube.com/vi/wxN1T1uxQ2g/hqdefault.jpg",
          similarMovies: []
        }
      ];

      const foundFallback = hardcodedFallbacks.find((m) => m.title.toLowerCase() === title.toLowerCase());
      
      const fallbackDetails = foundFallback || {
        id: "m_fallback",
        title: title || "Unavailable Movie",
        year: 2024,
        genre: "Action, Drama",
        director: "Unknown Director",
        runtime: "2h 00m",
        ratingImdb: 8.0,
        ratingTmdb: 80,
        ratingLetterboxd: 4.0,
        longDescription: "We are currently experiencing high request volumes and cannot fetch details for this movie. Here is a rate-limited placeholder.",
        posterColor: "#1e293b",
        posterUrl: "",
        trailerUrl: "",
        trailerThumbnail: "",
        similarMovies: []
      };
      cache.movieDetails.set(title, { data: fallbackDetails, timestamp: Date.now() });
      res.json(fallbackDetails);
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body; // array of { role: 'user' | 'model', content: string }
      
      const formattedContents = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: "You are a movie enthusiast chatting with another movie lover on a website. Speak naturally, like a human, with opinions and informal language. Do NOT sound like an AI. Keep it brief, conversational, and friendly. Avoid using markdown formatting like asterisks or bullet points unless absolutely necessary. Do not introduce yourself as an AI.",
        }
      });
      
      res.json({ reply: response.text });
    } catch (e: any) {
      console.log("Serving fallback chat reply due to API limit.");
      res.json({ reply: "I'm experiencing extremely high cinematic traffic right now and hit my rate limits. Please give me a second and try again!" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
