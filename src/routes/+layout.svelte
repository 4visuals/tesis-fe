<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="/css/bootstrap.css" />
	<link rel="stylesheet" href="/css/bootstrap-mod.css" />
	<link rel="stylesheet" href="/css/common.css" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
	<script src="https://kit.fontawesome.com/ee2ae3520a.js"></script>
	<script src="/js/jquery-3.6.0.min.js" defer></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js" defer></script>
	<script src="/js/bootstrap.js" defer></script>
</svelte:head>

<slot />
