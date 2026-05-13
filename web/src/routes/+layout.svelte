<script lang="ts">
  import '../app.css';
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
  <div class="flex h-screen w-screen flex-col">
    <Header />
    <main class="min-h-0 flex-1">
      {@render children?.()}
    </main>
  </div>
</QueryClientProvider>
