'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Search, Library, ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Mic2, ListMusic, Laptop2, Volume, Maximize2 } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const tracks = [
  { id: '1', title: 'Track 1', artist: 'Artist 1', album: 'Album 1', duration: '3:45' },
  { id: '2', title: 'Track 2', artist: 'Artist 2', album: 'Album 2', duration: '4:20' },
  { id: '3', title: 'Track 3', artist: 'Artist 3', album: 'Album 3', duration: '3:15' },
  { id: '4', title: 'Track 4', artist: 'Artist 4', album: 'Album 4', duration: '5:10' },
  { id: '5', title: 'Track 5', artist: 'Artist 5', album: 'Album 5', duration: '3:50' },
]

export function SpotifyCloneComponent() {
  const [currentView, setCurrentView] = useState('home')
  const [isPlaying, setIsPlaying] = useState(false)
  const [libraryTracks, setLibraryTracks] = useState(tracks)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [trackProgress, setTrackProgress] = useState({})
  const [navigationHistory, setNavigationHistory] = useState(['home'])
  const audioRef = useRef(new Audio())

  const startViewTransition = useCallback((callback: () => void) => {
    if (document.startViewTransition) {
      document.startViewTransition(callback)
    } else {
      callback()
    }
  }, [])

  const changeView = useCallback((view: string) => {
    startViewTransition(() => {
      setCurrentView(view)
      setNavigationHistory(prev => [...prev, view])
    })
  }, [startViewTransition])

  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      startViewTransition(() => {
        const newHistory = [...navigationHistory]
        newHistory.pop() // Remove current view
        const previousView = newHistory[newHistory.length - 1]
        setCurrentView(previousView)
        setNavigationHistory(newHistory)
      })
    }
  }, [navigationHistory, startViewTransition])

  const togglePlayPause = useCallback(() => {
    startViewTransition(() => {
      setIsPlaying(prev => !prev)
    })
  }, [startViewTransition])

  const onDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(libraryTracks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setLibraryTracks(items)
  }

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  const playTrack = (track) => {
    setCurrentTrack(track)
    audioRef.current.src = `/placeholder.mp3`
    setIsPlaying(true)
    setTrackProgress(prev => ({ ...prev, [track.id]: 0 }))
  }

  useEffect(() => {
    const audio = audioRef.current
    const updateProgress = () => {
      if (currentTrack) {
        setTrackProgress(prev => ({
          ...prev,
          [currentTrack.id]: (audio.currentTime / audio.duration) * 100
        }))
      }
    }
    audio.addEventListener('timeupdate', updateProgress)
    return () => audio.removeEventListener('timeupdate', updateProgress)
  }, [currentTrack])

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 bg-black p-6">
          <div className="flex flex-col gap-y-4">
            <Button 
              variant="ghost" 
              className={`flex items-center justify-start gap-x-3 ${currentView === 'home' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              onClick={() => changeView('home')}
            >
              <Home size={24} />
              Home
            </Button>
            <Button 
              variant="ghost" 
              className={`flex items-center justify-start gap-x-3 ${currentView === 'search' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              onClick={() => changeView('search')}
            >
              <Search size={24} />
              Search
            </Button>
            <Button 
              variant="ghost" 
              className={`flex items-center justify-start gap-x-3 ${currentView === 'library' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              onClick={() => changeView('library')}
            >
              <Library size={24} />
              Your Library
            </Button>
          </div>
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-4">PLAYLISTS</h2>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="flex flex-col gap-y-2">
                {Array.from({length: 50}, (_, i) => (
                  <Button 
                    key={i} 
                    variant="ghost" 
                    className="justify-start text-gray-300 hover:text-white"
                    onClick={() => changeView(`playlist-${i + 1}`)}
                  >
                    My Playlist #{i + 1}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>
        <main className="flex-1 bg-gradient-to-b from-gray-900 to-black p-8 overflow-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="flex gap-x-2">
              <Button size="icon" variant="ghost" onClick={goBack} disabled={navigationHistory.length <= 1}>
                <ChevronLeft size={24} />
              </Button>
            </div>
            <div className="flex items-center gap-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Sign up
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Sign up</DialogTitle>
                    <DialogDescription>
                      Create your account to start listening.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" type="email" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Password
                      </Label>
                      <Input id="password" type="password" className="col-span-3" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Sign up</Button>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-white text-black hover:bg-gray-100">
                    Log in
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Log in</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to access your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="login-email" className="text-right">
                        Email
                      </Label>
                      <Input id="login-email" type="email" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="login-password" className="text-right">
                        Password
                      </Label>
                      <Input id="login-password" type="password" className="col-span-3" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Log in</Button>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          {currentView === 'home' && (
            <>
              <h1 className="text-3xl font-bold mb-6">Good afternoon</h1>
              <div className="grid grid-cols-3 gap-6">
                {Array.from({length: 6}, (_, i) => (
                  <Button 
                    key={i} 
                    variant="secondary" 
                    className="flex items-center gap-x-4 h-20 bg-gray-800/50 hover:bg-gray-800"
                    onClick={() => changeView(`playlist-${i + 1}`)}
                  >
                    <div className="w-16 h-16 bg-gray-500"></div>
                    <span className="font-semibold">Playlist {i + 1}</span>
                  </Button>
                ))}
              </div>
              <h2 className="text-2xl font-bold mt-10 mb-6">Made for You</h2>
              <div className="grid grid-cols-5 gap-6">
                {Array.from({length: 5}, (_, i) => (
                  <div 
                    key={i} 
                    className="bg-gray-800/40 p-4 rounded-lg hover:bg-gray-800/60 transition cursor-pointer"
                    onClick={() => changeView(`daily-mix-${i + 1}`)}
                  >
                    <div className="w-full aspect-square bg-gray-500 mb-4"></div>
                    <h3 className="font-semibold mb-2">Daily Mix {i + 1}</h3>
                    <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {currentView === 'search' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Search</h1>
              <p>Search functionality would go here.</p>
            </div>
          )}
          {currentView === 'library' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Your Library</h1>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tracks">
                  {(provided) => (
                    <table className="w-full" {...provided.droppableProps} ref={provided.innerRef}>
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                          <th className="pb-2">#</th>
                          <th className="pb-2">Title</th>
                          <th className="pb-2">Artist</th>
                          <th className="pb-2">Album</th>
                          <th className="pb-2">Duration</th>
                          <th className="pb-2 w-24">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {libraryTracks.map((track, index) => (
                          <Draggable key={track.id} draggableId={track.id} index={index}>
                            {(provided) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="hover:bg-gray-800/40 cursor-pointer"
                                onClick={() => playTrack(track)}
                              >
                                <td className="py-2">{index + 1}</td>
                                <td className="py-2 flex items-center gap-2">
                                  <div className="flex items-end gap-0.5 h-3">
                                    <div className="w-0.5 h-full bg-green-500 animate-music-bar"></div>
                                    <div className="w-0.5 h-2/3 bg-green-500 animate-music-bar animation-delay-200"></div>
                                    <div className="w-0.5 h-1/3 bg-green-500 animate-music-bar animation-delay-400"></div>
                                  </div>
                                  {track.title}
                                </td>
                                <td className="py-2">{track.artist}</td>
                                <td className="py-2">{track.album}</td>
                                <td className="py-2">{track.duration}</td>
                                <td className="py-2 w-24">
                                  <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-green-500 h-full" 
                                      style={{ width: `${trackProgress[track.id] || 0}%` }}
                                    ></div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    </table>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
          {currentView.startsWith('playlist-') && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Playlist {currentView.split('-')[1]}</h1>
              <p>Playlist content would go here.</p>
            </div>
          )}
          {currentView.startsWith('daily-mix-') && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Daily Mix {currentView.split('-')[2]}</h1>
              <p>Daily Mix content would go here.</p>
            </div>
          )}
        </main>
      </div>
      <footer className="h-20 bg-gray-900 border-t border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="w-14 h-14 bg-gray-500"></div>
          <div>
            <h4 className="font-semibold">{currentTrack?.title || 'No track selected'}</h4>
            <p className="text-sm text-gray-400">{currentTrack?.artist || 'Select a track to play'}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-y-2 flex-1 max-w-xl">
          <div className="flex items-center gap-x-6">
            <Button size="icon" variant="ghost">
              <Shuffle size={20} />
            </Button>
            <Button size="icon" variant="ghost">
              <SkipBack size={20} />
            </Button>
            <Button size="icon" className="bg-white text-black hover:bg-gray-100 rounded-full" onClick={togglePlayPause}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <Button size="icon" variant="ghost">
              <SkipForward size={20} />
            </Button>
            <Button size="icon" variant="ghost">
              <Repeat size={20} />
            </Button>
          </div>
          <div className="flex items-center gap-x-2 w-full">
            <span className="text-xs text-gray-400">1:23</span>
            <Slider 
              value={[trackProgress[currentTrack?.id] || 0]} 
              max={100} 
              step={1} 
              className="w-full" 
              onValueChange={(value) => {
                if (currentTrack) {
                  const newTime = (value[0] / 100) * audioRef.current.duration
                  audioRef.current.currentTime = newTime
                }
              }}
            />
            <span className="text-xs text-gray-400">3:45</span>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Button size="icon" variant="ghost">
            <Mic2 size={20} />
          </Button>
          <Button size="icon" variant="ghost">
            <ListMusic size={20} />
          </Button>
          <Button size="icon" variant="ghost">
            <Laptop2 size={20} />
          </Button>
          <div className="flex items-center gap-x-2">
            <Volume size={20} />
            <Slider defaultValue={[66]} max={100} step={1} className="w-20" />
          </div>
          <Button size="icon" variant="ghost">
            <Maximize2 size={20} />
          </Button>
        </div>
      </footer>
    </div>
  )
}