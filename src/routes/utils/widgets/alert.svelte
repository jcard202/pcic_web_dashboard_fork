<script lang="ts">
    export let message: string;
    export let type: 'success' | 'error' | 'warning' | 'info' = 'info';

    const colors = {
        success: 'bg-green-100 border-green-500 text-green-700',
        error: 'bg-red-100 border-red-500 text-red-700',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
        info: 'bg-blue-100 border-blue-500 text-blue-700'
    };

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
</script>

<div class={`border-l-4 p-4 ${colors[type]}`} role="alert">
    <p class="font-bold">
        <span class="mr-2">{icons[type]}</span>
        {type.charAt(0).toUpperCase() + type.slice(1)}
    </p>
    <p>{message}</p>
</div>