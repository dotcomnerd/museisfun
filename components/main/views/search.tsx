"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search as SearchIcon,
  Clock,
  Mic2,
  Play,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const genres = [
  "Hip-Hop",
  "Rock",
  "Pop",
  "Electronic",
  "R&B",
  "Jazz",
  "Classical",
  "Metal",
  "Folk",
  "Blues",
  "Country",
  "Reggae",
  "Latin",
  "World",
  "Alternative",
];

const recentSearches = [
  { type: "artist", name: "The Weeknd", image: "/api/placeholder/32/32" },
  {
    type: "track",
    name: "Bohemian Rhapsody",
    artist: "Queen",
    image: "/api/placeholder/32/32",
  },
  {
    type: "album",
    name: "Thriller",
    artist: "Michael Jackson",
    image: "/api/placeholder/32/32",
  },
  {
    type: "playlist",
    name: "Workout Mix",
    creator: "Spotify",
    image: "/api/placeholder/32/32",
  },
];

const mockResults = {
  tracks: [
    {
      name: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
      image: "/api/placeholder/48/48",
    },
    {
      name: "Starboy",
      artist: "The Weeknd",
      album: "Starboy",
      duration: "3:50",
      image: "/api/placeholder/48/48",
    },
    {
      name: "Save Your Tears",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:35",
      image: "/api/placeholder/48/48",
    },
  ],
  artists: [
    { name: "The Weeknd", followers: "108M", image: "/api/placeholder/96/96" },
    { name: "Drake", followers: "98M", image: "/api/placeholder/96/96" },
    { name: "Taylor Swift", followers: "92M", image: "/api/placeholder/96/96" },
  ],
  albums: [
    {
      name: "After Hours",
      artist: "The Weeknd",
      year: "2020",
      image: "/api/placeholder/128/128",
    },
    {
      name: "Starboy",
      artist: "The Weeknd",
      year: "2016",
      image: "/api/placeholder/128/128",
    },
    {
      name: "Dawn FM",
      artist: "The Weeknd",
      year: "2022",
      image: "/api/placeholder/128/128",
    },
  ],
  playlists: [
    {
      name: "This Is The Weeknd",
      creator: "Spotify",
      tracks: "50",
      image: "/api/placeholder/128/128",
    },
    {
      name: "The Weeknd Radio",
      creator: "Spotify",
      tracks: "50",
      image: "/api/placeholder/128/128",
    },
    {
      name: "Best of The Weeknd",
      creator: "User123",
      tracks: "25",
      image: "/api/placeholder/128/128",
    },
  ],
};

export function SearchView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const hasResults = searchQuery.length > 0;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 pb-4">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9 bg-white/10 border-none h-12 text-lg"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => setSearchQuery("")}
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {!hasResults ? (
        <>
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Recent searches</h2>
              <div className="flex gap-4">
                {recentSearches.map((item, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="h-auto p-3 hover:bg-white/10"
                    onClick={() => setSearchQuery(item.name)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-400">
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-4">Browse all</h2>
            <div className="grid grid-cols-5 gap-6">
              {genres.map((genre, i) => (
                <Button
                  key={i}
                  variant="secondary"
                  className="h-48 relative overflow-hidden group"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-75"
                    style={{ transform: `rotate(${i * 20}deg)` }}
                  />
                  <span className="relative text-xl font-bold">{genre}</span>
                </Button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-transparent border-b border-gray-800 w-full justify-start h-auto p-0 space-x-6">
            {["all", "songs", "artists", "albums", "playlists"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="border-b-2 border-transparent data-[state=active]:border-white rounded-none px-2 py-4"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-4">Top result</h2>
              <Card className="w-96 bg-gray-900/50 hover:bg-gray-900/75 transition">
                <CardContent className="p-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage
                      src={mockResults.artists[0].image}
                      alt={mockResults.artists[0].name}
                    />
                    <AvatarFallback>TW</AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold mb-1">
                    {mockResults.artists[0].name}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Artist • {mockResults.artists[0].followers} followers
                  </p>
                  <Button className="rounded-full w-12 h-12">
                    <Play className="h-6 w-6" fill="currentColor" />
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Songs</h2>
              <div className="space-y-2">
                {mockResults.tracks.map((track, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 group"
                  >
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-12 h-12"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{track.name}</div>
                      <div className="text-sm text-gray-400">
                        {track.artist}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {track.duration}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="ghost">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Artists</h2>
              <ScrollArea>
                <div className="flex gap-6">
                  {mockResults.artists.map((artist, i) => (
                    <Card
                      key={i}
                      className="w-48 bg-gray-900/50 hover:bg-gray-900/75 transition"
                    >
                      <CardContent className="p-4 text-center">
                        <Avatar className="w-32 h-32 mx-auto mb-4">
                          <AvatarImage src={artist.image} alt={artist.name} />
                          <AvatarFallback>{artist.name[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold mb-1">{artist.name}</h3>
                        <p className="text-sm text-gray-400">Artist</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Albums</h2>
              <ScrollArea>
                <div className="flex gap-6">
                  {mockResults.albums.map((album, i) => (
                    <Card
                      key={i}
                      className="w-48 bg-gray-900/50 hover:bg-gray-900/75 transition"
                    >
                      <CardContent className="p-4">
                        <img
                          src={album.image}
                          alt={album.name}
                          className="w-40 h-40 mb-4"
                        />
                        <h3 className="font-semibold mb-1">{album.name}</h3>
                        <p className="text-sm text-gray-400">
                          {album.year} • {album.artist}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          </TabsContent>

          <TabsContent value="songs">
            <div className="space-y-2">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 group"
                  >
                    <img
                      src="/api/placeholder/48/48"
                      alt=""
                      className="w-12 h-12"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Song Name</div>
                      <div className="text-sm text-gray-400">Artist Name</div>
                    </div>
                    <div className="text-sm text-gray-400">3:30</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="ghost">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* Similarly structured content for artists, albums, and playlists tabs */}
        </Tabs>
      )}
    </div>
  );
}
