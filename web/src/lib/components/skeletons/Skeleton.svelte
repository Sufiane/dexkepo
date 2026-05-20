<script lang="ts">
  // Primitive skeleton block. Pulsing slate rectangle, dark-mode aware.
  // Compose at call sites for page-specific shapes.
  type Props = {
    class?: string;
  };

  let { class: klass = '' }: Props = $props();
</script>

<div class="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 {klass}"></div>
