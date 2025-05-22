
// This file is now just a re-export of the refactored context
// This maintains backward compatibility with existing imports
import { PodcastProvider, usePodcast } from "./podcast";

export { PodcastProvider, usePodcast };
export * from "./podcast/types";
