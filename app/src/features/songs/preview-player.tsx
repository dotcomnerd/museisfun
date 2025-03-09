/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipForward, SkipBack, Trash2, Plus, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { getYouTubePlayer } from "@/lib/utils"

interface Track {
  id: string
  title: string
  url: string
}

export interface VideoMetadata {
  title?: string
  author?: string
  duration?: number
  thumbnail?: string
  viewCount?: string
  publishDate?: string
}

interface MusicPlayerProps {
  initialUrl?: string
  onMetadataChange?: (metadata: VideoMetadata) => void
  isHiddenPlayer?: boolean
}

export default function MusicPlayer({ initialUrl = "", onMetadataChange, isHiddenPlayer = false }: MusicPlayerProps) {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [volume, setVolume] = useState(70)
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [currentMetadata, setCurrentMetadata] = useState<VideoMetadata>({})

  // Load playlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined" && !isHiddenPlayer) {
      const savedPlaylist = localStorage.getItem("musicPlaylist")
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist))
      }
    }
  }, [isHiddenPlayer])

  // If initialUrl is provided, add it to the playlist
  useEffect(() => {
    if (initialUrl && initialUrl.trim() !== "") {
      const videoId = extractVideoId(initialUrl)
      if (videoId) {
        // For hidden player, fetch metadata immediately
        fetchVideoMetadata(videoId)

        // Check if the url is already in the playlist
        if (!playlist.some(track => track.url === initialUrl)) {
          const newTrack: Track = {
            id: videoId,
            title: `YouTube (${videoId.substring(0, 6)}...)`,
            url: initialUrl,
          }
          setPlaylist([newTrack])
          setCurrentTrackIndex(0)
        }
      }
    }
  }, [initialUrl])

  // Save playlist to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && !isHiddenPlayer) {
      localStorage.setItem("musicPlaylist", JSON.stringify(playlist))
    }
  }, [playlist, isHiddenPlayer])

  // Initialize YouTube API
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Define the onYouTubeIframeAPIReady function
    window.onYouTubeIframeAPIReady = () => {
      // Create a div element for the player
      const playerDiv = document.createElement("div")
      playerDiv.id = isHiddenPlayer ? "youtube-hidden-player" : "youtube-player"
      playerDiv.style.display = "none"

      // Append it to the container
      if (playerContainerRef.current) {
        // Clear any existing player
        while (playerContainerRef.current.firstChild) {
          playerContainerRef.current.removeChild(playerContainerRef.current.firstChild)
        }

        playerContainerRef.current.appendChild(playerDiv)

        // Initialize the player
        playerRef.current = getYouTubePlayer(playerDiv.id, {
          height: "0",
          width: "0",
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              if (currentTrackIndex >= 0 && playlist[currentTrackIndex]) {
                const videoId = extractVideoId(playlist[currentTrackIndex].url)
                if (videoId) {
                  event.target.cueVideoById(videoId)
                  event.target.setVolume(volume)
                }
              }

              // For hidden player, cue the video immediately
              if (isHiddenPlayer && initialUrl) {
                const initialVideoId = extractVideoId(initialUrl)
                if (initialVideoId) {
                  event.target.cueVideoById(initialVideoId)
                  event.target.setVolume(volume)
                }
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                if (!isHiddenPlayer) {
                  playNextTrack()
                }
              } else if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)

                // Get metadata when video starts playing
                const currentVideoId = extractVideoId(playerRef.current?.getVideoUrl() || "")
                if (currentVideoId) {
                  fetchVideoMetadata(currentVideoId)
                }
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              }
            },
            onError: (event: any) => {
              console.error("YouTube player error:", event.data)
              if (!isHiddenPlayer) {
                playNextTrack()
              }
            },
          },
        })
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [isHiddenPlayer, initialUrl])

  // Handle autoplay on hover for hidden player mode
  useEffect(() => {
    if (isHiddenPlayer) {
      const hiddenPlayerEl = document.getElementById('hiddenPlayer')

      const checkPlayState = () => {
        if (hiddenPlayerEl && playerRef.current) {
          const shouldPlay = hiddenPlayerEl.getAttribute('data-play') === 'true'

          if (shouldPlay && !isPlaying) {
            playerRef.current.playVideo()
          } else if (!shouldPlay && isPlaying) {
            playerRef.current.pauseVideo()
          }

          // Check for volume changes from parent component
          const volumeAttr = hiddenPlayerEl.getAttribute('data-volume')
          if (volumeAttr) {
            const newVolume = parseInt(volumeAttr, 10)
            if (!isNaN(newVolume) && newVolume !== volume) {
              setVolume(newVolume)
              playerRef.current.setVolume(newVolume)
            }
          }
        }
      }

      // Check every 200ms if the play state has changed via data attribute
      const interval = setInterval(checkPlayState, 200)

      return () => clearInterval(interval)
    }
  }, [isHiddenPlayer, isPlaying, volume])

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Fetch video metadata from YouTube
  const fetchVideoMetadata = async (videoId: string) => {
    try {
      // Use oEmbed endpoint (0 quota cost)
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

      const response = await fetch(oEmbedUrl)
      const data = await response.json()

      const metadata: VideoMetadata = {
        title: data.title || undefined,
        author: data.author_name || undefined,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      }

      // Try to get duration from player if available
      if (playerRef.current) {
        try {
          const duration = playerRef.current.getDuration()
          if (duration > 0) {
            metadata.duration = duration
          }
        } catch {
          // Ignore errors when getting duration
        }
      }

      setCurrentMetadata(metadata)

      if (onMetadataChange) {
        onMetadataChange(metadata)
      }
    } catch (error) {
      console.error("Error fetching video metadata:", error)
    }
  }

  // Add a new track to the playlist
  const addTrack = async () => {
    if (!newTrackUrl.trim()) return

    const trackId = extractVideoId(newTrackUrl)

    if (!trackId) {
      alert("Invalid YouTube URL")
      return
    }

    const newTrack: Track = {
      id: trackId,
      title: `YouTube (${trackId.substring(0, 6)}...)`,
      url: newTrackUrl,
    }

    setPlaylist([...playlist, newTrack])
    setNewTrackUrl("")

    // If this is the first track, start playing it
    if (playlist.length === 0) {
      setCurrentTrackIndex(0)
    }

    // Fetch metadata for the new track
    fetchVideoMetadata(trackId)
  }

  // Remove a track from the playlist
  const removeTrack = (index: number) => {
    const newPlaylist = [...playlist]
    newPlaylist.splice(index, 1)
    setPlaylist(newPlaylist)

    // Adjust currentTrackIndex if necessary
    if (index === currentTrackIndex) {
      if (isPlaying && playerRef.current) {
        playerRef.current.stopVideo()
        setIsPlaying(false)
      }
      if (newPlaylist.length > 0) {
        setCurrentTrackIndex(0)
      } else {
        setCurrentTrackIndex(-1)
      }
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }

  // Play/pause the current track
  const togglePlay = () => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0)
      loadAndPlayTrack(0)
      return
    }

    if (!playlist[currentTrackIndex] || !playerRef.current) return

    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }

    setIsPlaying(!isPlaying)
  }

  // Load and play a specific track
  const loadAndPlayTrack = (index: number) => {
    if (!playlist[index] || !playerRef.current) return

    const track = playlist[index]
    const videoId = extractVideoId(track.url)

    if (videoId) {
      playerRef.current.loadVideoById(videoId)
      playerRef.current.setVolume(volume)
      setIsPlaying(true)

      // Fetch metadata for the track
      fetchVideoMetadata(videoId)
    }
  }

  // Play the previous track
  const playPreviousTrack = () => {
    if (playlist.length === 0) return

    const newIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }

  // Play the next track
  const playNextTrack = () => {
    if (playlist.length === 0) return

    const newIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }

  // Update volume
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume)
    }
  }, [volume])

  // Load and play track when currentTrackIndex changes
  useEffect(() => {
    if (currentTrackIndex >= 0) {
      loadAndPlayTrack(currentTrackIndex)
    }
  }, [currentTrackIndex, playlist])

  // For hidden players, just return the container div
  if (isHiddenPlayer) {
    return <div ref={playerContainerRef}></div>
  }

  // Simplified UI when used as a preview in the dialog
  if (initialUrl) {
    return (
      <div className="flex flex-col space-y-3 bg-background/30 rounded-lg w-full mx-auto">
        {/* Hidden player container */}
        <div ref={playerContainerRef} className="hidden"></div>

        {/* Current track info */}
        <div className="text-center py-1">
          <p className="text-sm text-primary/80 truncate">
            {currentMetadata.title || (currentTrackIndex >= 0 && playlist[currentTrackIndex]
              ? playlist[currentTrackIndex].title
              : "Loading preview...")}
          </p>
          {currentMetadata.author && (
            <p className="text-xs text-primary/60 truncate mt-0.5">
              by {currentMetadata.author}
            </p>
          )}
        </div>

        {/* Volume slider */}
        <div className="space-y-1">
          <Slider
            value={[volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0])}
            className="h-1.5"
          />
          <p className="text-xs text-primary/50 text-right">Vol: {volume}%</p>
        </div>

        {/* Playback controls */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={togglePlay}
            variant="outline"
            size="icon"
            className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-3 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <h2 className="text-lg font-medium text-primary/80 text-center">(music)</h2>

      {/* Hidden player container */}
      <div ref={playerContainerRef} className="hidden"></div>

      <div className="flex space-x-2">
        <Input
          value={newTrackUrl}
          onChange={(e) => setNewTrackUrl(e.target.value)}
          placeholder="Paste YouTube URL"
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-8 text-sm"
        />
        <Button
          onClick={addTrack}
          className="bg-primary/10 text-primary/70 hover:bg-primary/20 border-none h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Current track info */}
      <div className="text-center py-1">
        <p className="text-sm text-primary/80 truncate">
          {currentMetadata.title || (currentTrackIndex >= 0 && playlist[currentTrackIndex]
            ? playlist[currentTrackIndex].title
            : "No track selected")}
        </p>
        {currentMetadata.author && currentTrackIndex >= 0 && (
          <p className="text-xs text-primary/60 truncate mt-0.5">
            by {currentMetadata.author}
          </p>
        )}
      </div>

      {/* Volume slider */}
      <div className="space-y-1">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="h-1.5"
        />
        <p className="text-xs text-primary/50 text-right">Vol: {volume}%</p>
      </div>

      {/* Playback controls */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={playPreviousTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          <SkipBack className="h-3 w-3" />
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button
          onClick={playNextTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          <SkipForward className="h-3 w-3" />
        </Button>
      </div>

      {/* Playlist */}
      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
        {playlist.length === 0 ? (
          <p className="text-primary/30 text-xs italic text-center">No tracks added</p>
        ) : (
          playlist.map((track, index) => (
            <div
              key={track.id}
              className={`flex justify-between items-center p-1.5 rounded group ${
                index === currentTrackIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="flex-1 truncate cursor-pointer text-primary/70 hover:text-primary/90 flex items-center gap-1 text-xs"
                onClick={() => {
                  setCurrentTrackIndex(index)
                  loadAndPlayTrack(index)
                }}
              >
                <Music className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{currentMetadata.title || track.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrack(index)}
                className="opacity-0 group-hover:opacity-100 text-primary/40 hover:text-primary/60 hover:bg-transparent h-6 w-6"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


