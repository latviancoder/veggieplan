import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from 'react-query';

export const useAccessToken = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data } = useQuery(['token'], {
    queryFn: async () => await getAccessTokenSilently(),
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  return data;
};
