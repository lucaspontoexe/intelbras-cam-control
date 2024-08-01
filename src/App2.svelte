<script lang="ts">
    import { onMount } from "svelte";
    import { Camera } from "./lib/Camera";

    const cam = new Camera("http://localhost:8000", "ademir", "senha");
    onMount(async () => {
        cam.init(); // await?
    })
</script>
