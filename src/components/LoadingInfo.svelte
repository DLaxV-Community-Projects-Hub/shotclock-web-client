<script lang="ts">
	import Fa from 'svelte-fa';
	import pkg from '@fortawesome/free-solid-svg-icons';
	const { faSpinner } = pkg;
</script>

<div class="h-full flex justify-center">
	<div class="flex flex-col justify-center">
		<Fa icon={faSpinner} size="5x" spin />
	</div>
</div>
