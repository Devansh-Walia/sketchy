<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import {
        colors,
        CUSTOM_COLOR_EVENT,
        CUSTOM_STROKE_EVENT,
        TOOLS,
    } from '../utils/constants';
    import Tooltip from './tooltip.svelte';

    export let paletteColor = colors[0];
    export let background = 'none';
    export let changeTool: (tool: TOOLS) => void;
    export let toolType: TOOLS;
    export let strokeWidth = 2;

    let isColorsPanelOpen = false;

    const dispatch = createEventDispatcher();

    const toggleColorsPanel = () => {
        if (toolType !== TOOLS.PEN) {
            changeTool(TOOLS.PEN);
        } else {
            isColorsPanelOpen = !isColorsPanelOpen;
        }
    };

    const handleColorClick = (color: string) => {
        dispatch(CUSTOM_COLOR_EVENT, { color });
        paletteColor = color;

        toggleColorsPanel();
    };

    const handleEraserClick = () => {
        dispatch(CUSTOM_COLOR_EVENT, { color: background });
        paletteColor = background;

        changeTool(TOOLS.ERASER);
    };

    const handleStrokeWidthChange = (event: Event) => {
        const target = event.target as HTMLInputElement;

        strokeWidth = parseInt(target.value, 10);

        dispatch(CUSTOM_STROKE_EVENT, { strokeWidth });
    };

    const handleCrossOutClick = () => {
        changeTool(TOOLS.CROSS_OUT);
    };
</script>

<section>
    <Tooltip text="rearrage" delay={300}>
        <button
            on:click={() => changeTool(TOOLS.HAND)}
            class={toolType === TOOLS.HAND ? 'active' : 'inactive'}
            style:background
        >
            H
            <span class="visually-hidden">
                Select the hand tool to drag on the canvas
            </span>
        </button>
    </Tooltip>
    <Tooltip text="reset your mistakes!!" delay={300}>
        <button
            on:click={handleEraserClick}
            class={toolType === TOOLS.ERASER ? 'active' : 'inactive'}
            style:background
        >
            <img src="/eraser.svg" alt="Eraser" />
            <span class="visually-hidden">
                Select the background color to clear the canvas
            </span>
        </button>
    </Tooltip>
    <Tooltip text="cross out content" delay={300}>
        <button
            on:click={handleCrossOutClick}
            class={toolType === TOOLS.CROSS_OUT ? 'active' : 'inactive'}
            style:background
        >
            X
            <span class="visually-hidden">
                Select the cross-out tool to strike through content on the
                canvas
            </span>
        </button>
    </Tooltip>

    <Tooltip
        text="Choose a color to make the mistake... or click the dropper to select a color of your own"
        delay={300}
        hidden={isColorsPanelOpen}
    >
        <button
            on:click={toggleColorsPanel}
            class={toolType === TOOLS.PEN ? 'active' : 'inactive'}
        >
            <img src="/pen.svg" alt="Pen" />
        </button>
        {#if isColorsPanelOpen}
            <div class="flex-col color-panel">
                <span class="text-black">Choose the strokeWidth </span>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={strokeWidth}
                    on:input={handleStrokeWidthChange}
                    style:margin-bottom="0.5rem"
                />
                <span class="text-black">Choose a color</span>
                <div class="flex-row">
                    <input
                        type="color"
                        value={paletteColor}
                        on:blur={(e) =>
                            handleColorClick(
                                (e.target as HTMLInputElement).value,
                            )}
                    />

                    {#each colors as color}
                        <button
                            on:click={() => handleColorClick(color)}
                            style:background={color}
                            title={`Select ${color}`}
                        >
                            <span class="visually-hidden">
                                Select the color {color}
                            </span>
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </Tooltip>
</section>

<style>
    section {
        --size: 1.75rem;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: fixed;
        top: 40%;
        left: 1rem;
        z-index: 10;
        background-color: #4a63796b;
        border-radius: 1rem;
    }

    .flex-col {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .text-black {
        color: black;
        text-align: left;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }

    .color-panel {
        position: absolute;
        left: 150%;
        bottom: 20%;
        background-color: #00000016;
        color: white;
        padding: 0.5rem;
        font-size: x-small;
        border-radius: 0.25rem;
    }

    div {
        display: flex;
        gap: 0 0.5rem;
        align-items: center;
        overflow-x: auto;
    }

    .active {
        border: 2px solid dodgerblue;
        background-color: #fff !important;
    }
    .inactive {
        background-color: #00000016 !important;
        opacity: 0.5;
    }

    div button {
        flex-shrink: 0;
    }

    button {
        width: var(--size);
        height: var(--size);
        display: flex;
        justify-content: center;
        cursor: pointer;
        align-items: center;
        border: 2px solid transparent;
        border-radius: 50%;
        margin: 0;
    }

    input[type='range'] {
        width: 100%;
    }
</style>
