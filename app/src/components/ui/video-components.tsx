interface VideoThumbnailProps {
  video: {
    thumbnail: string;
    title: string;
  };
}

export function VideoThumbnail({ video }: VideoThumbnailProps) {
  return (
    <img
      src={video.thumbnail}
      alt={video.title}
      className="h-10 w-16 rounded object-cover"
    />
  );
}

interface VideoTitleProps {
  title: string;
}

export function VideoTitle({ title }: VideoTitleProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export function LoadingSpinner({ isLoading }: LoadingSpinnerProps) {
  if (!isLoading) return <div>No results found.</div>;

  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}