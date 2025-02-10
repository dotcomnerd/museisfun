import { getUserProfile } from '@/api/requests';
import { Navbar } from '@/features/landing/nav';
import { ProfileViewNested } from '@/features/profile/nested';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation, useParams } from 'react-router';
import { toast } from 'sonner';

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { state } = useLocation();
  const previousPath = state?.previous;

  if (!username) {
    toast.error("Username is required");
    return <Navigate to="/" />;
  }

  const { data: user, isLoading } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: () => getUserProfile(username)
  });

  return (
    <>
      <Navbar />
      <div className="mt-16 flex flex-col h-full max-w-6xl mx-auto px-4 py-8">
        <ProfileViewNested userData={user} isLoading={isLoading} previousPath={previousPath} />
      </div>
    </>
  );
}