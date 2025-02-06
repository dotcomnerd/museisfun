import { Types } from "mongoose";

type SupportedPlatforms = "youtube" | "soundcloud" | "applemusic" | "spotify" | "lastfm";

interface PlatformValidator {
    validate(url: string): boolean;
}

class YouTubeValidator implements PlatformValidator {
    validate(url: string): boolean {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    }
}

class SoundCloudValidator implements PlatformValidator {
    validate(url: string): boolean {
        const soundcloudRegex = /^(https?:\/\/)?(www\.)?(soundcloud\.com)\/.+$/;
        return soundcloudRegex.test(url);
    }
}

class AppleMusicValidator implements PlatformValidator {
    validate(url: string): boolean {
        const appleMusicRegex = /^(https?:\/\/)?(www\.)?(music\.apple\.com)\/.+$/;
        return appleMusicRegex.test(url);
    }
}

class SpotifyValidator implements PlatformValidator {
    validate(url: string): boolean {
        const spotifyRegex = /^(https?:\/\/)?(www\.)?(spotify\.com)\/.+$/;
        return spotifyRegex.test(url);
    }
}

class LastFmValidator implements PlatformValidator {
    validate(url: string): boolean {
        const lastFmRegex = /^(https?:\/\/)?(www\.)?(last\.fm\/music)\/.+$/;
        return lastFmRegex.test(url);
    }
}

export class UrlValidator {
    private platformValidators: Map<SupportedPlatforms, PlatformValidator> =
        new Map();

    constructor() {
        this.registerValidator("youtube", new YouTubeValidator());
        this.registerValidator("soundcloud", new SoundCloudValidator());
        this.registerValidator("applemusic", new AppleMusicValidator());
        this.registerValidator("spotify", new SpotifyValidator());
        this.registerValidator("lastfm", new LastFmValidator());
    }

    registerValidator(
        platform: SupportedPlatforms,
        validator: PlatformValidator
    ): void {
        this.platformValidators.set(platform, validator);
    }

    validate(url: string): boolean {
        for (const validator of this.platformValidators.values()) {
            if (validator.validate(url)) {
                return true;
            }
        }
        return false;
    }
}

export function convertToObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
}
