
export const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
    id: string;
    snippet: {
        title: string;
        description: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
            high: { url: string };
            medium: { url: string };
        };
        tags?: string[];
        categoryId: string;
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
}

export interface YouTubeChannel {
    id: string;
    snippet: {
        title: string;
        description: string;
        customUrl?: string;
        thumbnails: {
            medium: { url: string };
            high: { url: string };
        };
    };
    statistics: {
        viewCount: string;
        subscriberCount: string;
        hiddenSubscriberCount: boolean;
        videoCount: string;
    };
}

export class YouTubeClient {
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.YOUTUBE_API_KEY || '';
    }

    private async fetch(endpoint: string, params: Record<string, string>) {
        if (!this.apiKey) {
            console.error("YOUTUBE_API_KEY is missing");
            // Return mock/error or handle gracefully
            throw new Error("Clé API YouTube manquante. Veuillez configurer YOUTUBE_API_KEY.");
        }

        const queryParams = new URLSearchParams({
            key: this.apiKey,
            ...params
        });

        const res = await fetch(`${YOUTUBE_API_BASE}/${endpoint}?${queryParams.toString()}`);

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || 'Erreur YouTube API');
        }

        return res.json();
    }

    async getMostPopular(regionCode: string = 'FR', videoCategoryId?: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
        const params: Record<string, string> = {
            part: 'snippet,statistics',
            chart: 'mostPopular',
            regionCode,
            maxResults: maxResults.toString(),
        };

        if (videoCategoryId) {
            params.videoCategoryId = videoCategoryId;
        }

        const data = await this.fetch('videos', params);
        return data.items || [];
    }

    async searchVideos(query: string, maxResults: number = 10, order: 'date' | 'relevance' | 'viewCount' = 'relevance'): Promise<YouTubeVideo[]> {
        // Search endpoint returns snippet but NOT statistics directly. Need a second call.
        const searchParams = {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: maxResults.toString(),
            order
        };

        const searchData = await this.fetch('search', searchParams);
        const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',');

        if (!videoIds) return [];

        // Fetch details for these videos to get stats
        const videoParams = {
            part: 'snippet,statistics',
            id: videoIds
        };

        const videoData = await this.fetch('videos', videoParams);
        return videoData.items || [];
    }

    async getChannelStats(channelId: string): Promise<YouTubeChannel | null> {
        const params = {
            part: 'snippet,statistics',
            id: channelId
        };

        const data = await this.fetch('channels', params);
        return data.items && data.items.length > 0 ? data.items[0] : null;
    }
}
