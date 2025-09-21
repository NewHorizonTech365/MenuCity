
// Simple redirect page
// Lorsque la route `/map` est visitée, on redirige vers `/restaurants`.
// Utile si vous voulez un alias de route ou rediriger les utilisateurs.
import { Redirect } from 'expo-router';

export default function MapRedirect() {
  return <Redirect href="/restaurants" />;
}
