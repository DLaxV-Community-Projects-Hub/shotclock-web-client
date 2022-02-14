<script lang="ts">
	import Fa from 'svelte-fa';
	import { faSpinner } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="h-full flex justify-center">
	<div class="flex flex-col justify-center">
		<!-- Bugged: https://github.com/FortAwesome/Font-Awesome/issues/18677 -->
		<!-- <Fa icon={faSpinner} size="5x" spin /> -->
		Loading...
	</div>
</div>
