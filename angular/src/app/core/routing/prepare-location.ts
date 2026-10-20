import { legacyRoute } from './legacy-route';
export async function prepareLocation(): Promise<void> {
  const hashParams = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const callback =
    hashParams.has('access_token') || hashParams.has('error_description') || query.has('code');
  let route = legacyRoute(location.pathname, location.hash, location.search);
  if (callback) {
    const type = hashParams.get('type');
    const callbackError = hashParams.get('error_description');
    if (callbackError) route = '/forum?authError=' + encodeURIComponent(callbackError);
    else {
      // Let Supabase consume the original hash before the router owns it.
      const { supabase } = await import('../auth/supabase-client');
      const { data, error } = await supabase.auth.getSession();
      route =
        error || !data.session
          ? '/forum?authError=' +
            encodeURIComponent(error?.message || 'Посилання недійсне або прострочене.')
          : '/forum?auth=' + (type === 'recovery' ? 'recovery' : 'confirmed');
    }
  }
  if (callback || location.pathname !== '/' || location.hash !== '#' + route)
    history.replaceState(null, '', '/#' + route);
}
