import { getUserProfile } from '@/api/requests';
import { Navbar } from '@/features/landing/nav';
import { ProfileViewNested } from '@/features/profile/nested';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation, useParams } from 'react-router';
import { toast } from 'sonner';

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { state } = useLocation();
  const previousPath = state?.previous;

  const { data: user, isLoading } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: () => getUserProfile(username as string)
  });

  if (!username) {
    toast.error("Username is required");
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>;
  }

  if (!user) {
    toast.error("User not found");
    return <Navigate to="/" />;
  }

  return (
    <>
      <Navbar />
      <div className="mt-16 flex flex-col h-full max-w-6xl mx-auto px-4 py-8">
        <ProfileViewNested userData={user} isLoading={isLoading} previousPath={previousPath} />
      </div>
    </>
  );
}
