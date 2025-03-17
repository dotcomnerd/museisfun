import { MultiSelect } from "@/components/multi-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { useAudioStore } from "@/stores/audioStore";
import {
  GlobeIcon,
  HeartIcon,
  LockIcon,
  LogOut,
  Music,
  Settings, Trash2,
  User,
  UsersIcon
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";
import { useUserStore } from '@/stores/userStore';

type PrivacySettings = {
  profileVisibility: "private" | "friends" | "public";
  playlistVisibility: "private" | "friends" | "public";
  isRecommendationsEnabled: boolean;
};

type UserPreferences = {
  selectedGenres: string[];
  selectedArtists: string[];
};

interface SettingsState extends PrivacySettings, UserPreferences {
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetSettings: () => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profileVisibility: "friends",
      playlistVisibility: "friends",
      isRecommendationsEnabled: true,
      selectedGenres: [],
      selectedArtists: [],

      updatePrivacySettings: (settings) =>
        set((state) => ({ ...state, ...settings })),

      updatePreferences: (preferences) =>
        set((state) => ({ ...state, ...preferences })),

      resetSettings: () =>
        set({
          profileVisibility: "friends",
          playlistVisibility: "friends",
          isRecommendationsEnabled: true,
          selectedGenres: [],
          selectedArtists: [],
        }),
    }),
    {
      name: "user-settings-storage",
    }
  )
);

const GENRES = [
  { id: "rock", name: "Rock" },
  { id: "pop", name: "Pop" },
  { id: "hip-hop", name: "Hip Hop" },
  { id: "electronic", name: "Electronic" },
  { id: "classical", name: "Classical" },
  { id: "jazz", name: "Jazz" },
  { id: "country", name: "Country" },
  { id: "indie", name: "Indie" },
];

const ARTISTS = [
  { id: "queen", name: "Queen" },
  { id: "metallica", name: "Metallica" },
  { id: "taylorSwift", name: "Taylor Swift" },
  { id: "radiohead", name: "Radiohead" },
  { id: "kendrickLamar", name: "Kendrick Lamar" },
  { id: "beethoven", name: "Beethoven" },
];

export function SettingsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useSettingsStore();
  const audioStore = useAudioStore();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleLogout = () => {
    useUserStore.getState().clearUser();
    localStorage.removeItem("authToken");
    settings.resetSettings();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      settings.resetSettings();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        console.error("Failed to delete account:", error);
      } else {
        toast.error("Server error. Please try again later.");
        console.error(error);
      }
    }
  };

  const handlePrivacyChange = (
    type: keyof Pick<
      PrivacySettings,
      "profileVisibility" | "playlistVisibility"
    >,
    value: "private" | "friends" | "public"
  ) => {
    settings.updatePrivacySettings({ [type]: value });
  };

  const visibilityOptions = [
    { value: "private", icon: LockIcon, label: "Private" },
    { value: "friends", icon: UsersIcon, label: "Friends" },
    { value: "public", icon: GlobeIcon, label: "Public" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="mr-3" /> Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex gap-4">
          {['privacy', 'preferences', 'playback', 'account'].map(section => (
            <Button
              key={section}
              variant="ghost"
              onClick={() => {
                navigate(`/dashboard/settings#${section}`);
              }}
              className="capitalize"
            >
              {section}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-16">
        <section id="privacy" className="space-y-8">
          <h2 className="text-2xl font-semibold mb-8 border-b pb-2">Privacy Settings</h2>
          <div className="space-y-12">
            {/* Privacy content */}
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <User className="mr-2" /> Profile Visibility
              </h3>
              <div className="flex items-center space-x-4">
                {visibilityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      settings.profileVisibility === option.value
                        ? "default"
                        : "outline"
                    }
                    className="flex items-center"
                    onClick={() =>
                      handlePrivacyChange(
                        "profileVisibility",
                        option.value as "private" | "friends" | "public"
                      )
                    }
                  >
                    <option.icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Music className="mr-2" /> Playlist Visibility
              </h3>
              <div className="flex items-center space-x-4">
                {visibilityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      settings.playlistVisibility === option.value
                        ? "default"
                        : "outline"
                    }
                    className="flex items-center"
                    onClick={() =>
                      handlePrivacyChange(
                        "playlistVisibility",
                        option.value as "private" | "friends" | "public"
                      )
                    }
                  >
                    <option.icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Switch
                id="recommendations"
                checked={settings.isRecommendationsEnabled}
                onCheckedChange={(checked) =>
                  settings.updatePrivacySettings({
                    isRecommendationsEnabled: checked,
                  })
                }
              />
              <Label htmlFor="recommendations">
                Enable Personalized Recommendations
              </Label>
            </div>
          </div>
        </section>

        <section id="preferences" className="space-y-8">
          <h2 className="text-2xl font-semibold mb-8 border-b pb-2">Preferences</h2>
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Music className="mr-2" /> Favorite Genres
              </h3>
              <MultiSelect
                options={GENRES.map((genre) => ({
                  label: genre.name,
                  value: genre.id,
                }))}
                onValueChange={(values) =>
                  settings.updatePreferences({ selectedGenres: values })
                }
                defaultValue={settings.selectedGenres}
                placeholder="Select genres"
                variant="inverted"
                animation={2}
                maxCount={3}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <HeartIcon className="mr-2" /> Favorite Artists
              </h3>
              <MultiSelect
                options={ARTISTS.map((artist) => ({
                  label: artist.name,
                  value: artist.id,
                }))}
                onValueChange={(values) =>
                  settings.updatePreferences({ selectedArtists: values })
                }
                defaultValue={settings.selectedArtists}
                placeholder="Select artists"
                variant="inverted"
                animation={2}
                maxCount={3}
              />
            </div>
          </div>
        </section>

        <section id="playback" className="space-y-8">
          <h2 className="text-2xl font-semibold mb-8 border-b pb-2">Playback Settings</h2>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Autoplay on End</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically play the next song when current song ends
                </p>
              </div>
              <Toggle
                pressed={audioStore.autoPlayOnEnd}
                onPressedChange={(pressed) => {
                  audioStore.toggleAutoPlayOnEnd();
                  toast.success(
                    `Autoplay ${pressed ? "enabled" : "disabled"}`,
                    {
                      description: pressed
                        ? "Songs will play automatically"
                        : "Songs will pause at the end",
                    }
                  );
                }}
              >
                {audioStore.autoPlayOnEnd ? "On" : "Off"}
              </Toggle>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Shuffle Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Randomly shuffle songs in your queue
                </p>
              </div>
              <Toggle
                pressed={audioStore.isShuffled}
                onPressedChange={(pressed) => {
                  audioStore.toggleShuffle();
                  toast.success(
                    `Shuffle mode ${pressed ? "enabled" : "disabled"}`,
                    {
                      description: pressed
                        ? "Your queue will be shuffled"
                        : "Your queue will play in order",
                    }
                  );
                }}
              >
                {audioStore.isShuffled ? "On" : "Off"}
              </Toggle>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Repeat Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Repeat current song or playlist
                </p>
              </div>
              <Toggle
                pressed={audioStore.isRepeating}
                onPressedChange={(pressed) => {
                  audioStore.toggleRepeat();
                  toast.success(
                    `Repeat mode ${pressed ? "enabled" : "disabled"}`,
                    {
                      description: pressed
                        ? "Songs will repeat"
                        : "Songs will play once",
                    }
                  );
                }}
              >
                {audioStore.isRepeating ? "On" : "Off"}
              </Toggle>
            </div>
          </div>
        </section>

        <section id="account" className="space-y-8">
          <h2 className="text-2xl font-semibold mb-8 border-b pb-2">Account Settings</h2>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Logout</h3>
                <p className="text-sm text-muted-foreground">
                  End your current session
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-black/10 hover:bg-black/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2" /> Logout
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-destructive">
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Permanently remove your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-500/20 hover:bg-red-500/30"
                  >
                    <Trash2 className="mr-2" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently
                      delete your account and remove all your data from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
