<script lang="ts">
  type CategoryNode = {
    seq: number
    categoryName: string
    selectable?: boolean
    sub?: CategoryNode[]
  }

  export let cate: CategoryNode
  export let onSelect: (cate: CategoryNode) => void
</script>

<div class="cate-item" data-seq={cate.seq}>
  <a
    href="#"
    class={`cate-name ${cate.selectable ? 'selectable' : 'not-selectable'}`}
    on:click|preventDefault={() => onSelect(cate)}
  >
    <span class="material-icons">check</span>
    <span>{cate.categoryName}</span>
  </a>
  {#if cate.sub && cate.sub.length > 0}
    <div class="holder">
      {#each cate.sub as child}
        <svelte:self cate={child} {onSelect} />
      {/each}
    </div>
  {/if}
</div>
