<script lang="ts">
  // Order matters: load Tailwind base first, then Leaflet CSS so Leaflet's
  // positioning rules aren't clobbered by Tailwind's img preflight reset.
  import '../app.css';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.markercluster/dist/MarkerCluster.css';
  import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import Header from '$lib/components/Header.svelte';

  const client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, refetchOnWindowFocus: false }
    }
  });

  let { children } = $props();
</script>

<QueryClientProvider client={client}>
  <div class="flex h-dvh w-screen flex-col overflow-hidden">
    <Header />
    <main class="relative min-h-0 flex-1 overflow-hidden">
      {@render children?.()}
    </main>
  </div>
</QueryClientProvider>
