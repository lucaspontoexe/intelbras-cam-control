<script lang="ts">
    import { Camera } from "./lib/Camera";

    const cam = new Camera("http://localhost:8000", "ademir", "senha");
    cam.init();
</script>
