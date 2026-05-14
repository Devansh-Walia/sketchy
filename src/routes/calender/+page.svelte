<script lang="ts">
    import { onMount } from 'svelte';

    import Canvas from '../../components/canvas.svelte';
    import {
        CANVAS_KEY,
        colors,
        dayNames,
        monthNames,
        NOTES_KEY,
        TOOLS,
    } from '../../utils/constants';
    import type { CanvasData, Day, NoteData } from '../../utils/types';
    import { getLocalStorage, setLocalStorage } from '../../utils/helpers';

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    let canvasState: CanvasData = {};
    let noteState: NoteData = {};
    let isLoaded = false;

    let toolType = TOOLS.PEN;
    let days: Day[] = [];
    let background = 'none';
    let paletteColor = colors[0];
    let strokeWidth = 4;
    let selectedDayId = '';
    let editorCanvas:
        | {
              undo: () => void;
              redo: () => void;
              clearCanvas: () => void;
          }
        | undefined;

    $: selectedDay = days.find((day) => day.id === selectedDayId);
    $: selectedNote = selectedDayId ? noteState[selectedDayId] ?? '' : '';
    $: plannedDays = days.filter(
        (day) =>
            day.enabled &&
            (dayHasDrawing(canvasState[day.id]) || noteState[day.id]),
    ).length;
    $: selectedNavLabel = formatNavDate(selectedDay);

    const changeTool = (tool: TOOLS) => {
        toolType = tool;
    };

    function initMonth() {
        const daysLocal: Day[] = [];

        const daysInThisMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        for (let index = 0; index < firstDay; index++) {
            daysLocal.push({
                name: '',
                enabled: false,
                date: new Date(year, month, 0),
                id: `empty-${index}`,
                state: '',
                isToday: false,
            });
        }

        for (let index = 0; index < daysInThisMonth; index++) {
            const thisDate = new Date(year, month, index + 1);
            const id = getDayId(thisDate);
            const isToday =
                thisDate.getDate() === now.getDate() &&
                thisDate.getMonth() === now.getMonth() &&
                thisDate.getFullYear() === now.getFullYear();

            daysLocal.push({
                name: `${index + 1}`,
                enabled: true,
                date: thisDate,
                id,
                state: canvasState[id] ?? '',
                isToday,
            });
        }

        days = daysLocal;
        if (!daysLocal.some((day) => day.id === selectedDayId && day.enabled)) {
            const today = daysLocal.find((day) => day.isToday);
            const firstEnabled = daysLocal.find((day) => day.enabled);
            selectedDayId = (today ?? firstEnabled)?.id ?? '';
        }
    }

    const decreaseMonth = () => {
        if (month === 0) {
            month = 11;
            year -= 1;
        } else {
            month = (month - 1 + 12) % 12;
        }
        updateCalendar();
    };

    const increaseMonth = () => {
        if (month === 11) {
            month = 0;
            year += 1;
        } else {
            month = (month + 1) % 12;
        }
        updateCalendar();
    };

    function handleCanvasChange(canvasId: string, state: string) {
        canvasState[canvasId] = state;
        days = days.map((day) =>
            day.id === canvasId ? { ...day, state } : day,
        );

        setLocalStorage(CANVAS_KEY, canvasState);
    }

    function dayHasDrawing(state: string | undefined) {
        if (!state) return false;

        try {
            const data = JSON.parse(state);
            return Array.isArray(data?.elements) && data.elements.length > 0;
        } catch {
            return false;
        }
    }

    function handleNoteChange(event: Event) {
        if (!selectedDayId) return;

        const target = event.target as HTMLTextAreaElement;
        noteState[selectedDayId] = target.value;
        setLocalStorage(NOTES_KEY, noteState);
    }

    function goToToday() {
        year = now.getFullYear();
        month = now.getMonth();
        selectedDayId = getDayId(now);
        updateCalendar();
    }

    function getDayId(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    function formatSelectedDate(day: Day | undefined) {
        if (!day) return '';

        return day.date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }

    function formatNavDate(day: Day | undefined) {
        if (!day) return 'Select a day';

        const isToday =
            day.date.getDate() === now.getDate() &&
            day.date.getMonth() === now.getMonth() &&
            day.date.getFullYear() === now.getFullYear();
        const label = day.date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });

        return isToday ? `Today, ${label}` : label;
    }

    function updateCalendar() {
        initMonth();
    }

    onMount(async () => {
        canvasState = await getLocalStorage(CANVAS_KEY);
        noteState = await getLocalStorage(NOTES_KEY);
        isLoaded = true;
        updateCalendar();
    });
</script>

<svelte:head>
    <title>Calendar - Calendraw</title>
    <meta
        name="description"
        content="Create and customize your digital calendar with our intuitive drawing tools"
    />
    <meta property="og:title" content="Calendar - Calendraw" />
    <meta
        property="og:description"
        content="Create and customize your digital calendar with our intuitive drawing tools"
    />
    <meta
        property="og:url"
        content="https://calendar.devanshwalia.com/calender"
    />
</svelte:head>

{#if isLoaded}
    <section class="calendar-shell">
        <div class="calendar-header">
            <div>
                <p class="eyebrow">Calendraw</p>
                <h1>{monthNames[month]} {year}</h1>
            </div>
            <div class="month-actions" aria-label="Calendar navigation">
                <button on:click={decreaseMonth} aria-label="Previous month">
                    <span aria-hidden="true">&lt;</span>
                    Previous month
                </button>
                <button class="today-button" on:click={goToToday}>
                    {selectedNavLabel}
                </button>
                <button on:click={increaseMonth} aria-label="Next month">
                    Next month
                    <span aria-hidden="true">&gt;</span>
                </button>
            </div>
        </div>

        <div class="workspace">
            <div class="month-board crooked">
                <div class="weekdays" aria-hidden="true">
                    {#each dayNames as dayName}
                        <span>{dayName}</span>
                    {/each}
                </div>

                <div class="calendar-grid">
                    {#each days as day (day.id)}
                        {@const { id, enabled, name, state, isToday } = day}
                        {@const hasNote = Boolean(noteState[id]?.trim())}
                        {@const hasDrawing = dayHasDrawing(canvasState[id])}

                        <button
                            class="day {enabled ? 'enabled' : 'empty'} {isToday
                                ? 'is-active'
                                : ''} {selectedDayId === id
                                ? 'is-selected'
                                : ''}"
                            disabled={!enabled}
                            on:click={() => (selectedDayId = id)}
                            aria-label={enabled
                                ? `Open ${monthNames[month]} ${name}, ${year}`
                                : 'Empty calendar cell'}
                        >
                            <span class="caption">{name}</span>
                            {#if enabled}
                                <span class="day-preview">
                                    <Canvas
                                        toolType={TOOLS.HAND}
                                        {paletteColor}
                                        {background}
                                        {strokeWidth}
                                        {id}
                                        {state}
                                        {handleCanvasChange}
                                        interactive={false}
                                    />
                                </span>
                                <span class="markers">
                                    {#if hasDrawing}
                                        <span title="Drawing saved"></span>
                                    {/if}
                                    {#if hasNote}
                                        <span title="Note saved"></span>
                                    {/if}
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <aside class="day-panel crooked">
                <div class="day-panel-header">
                    <div>
                        <p class="eyebrow">Selected day</p>
                        <h2>{formatSelectedDate(selectedDay)}</h2>
                    </div>
                    <p class="month-count">{plannedDays} planned</p>
                </div>

                {#if selectedDay}
                    <div class="toolbar" aria-label="Drawing tools">
                        <button
                            class:active={toolType === TOOLS.PEN}
                            on:click={() => changeTool(TOOLS.PEN)}
                            aria-label="Pen"
                        >
                            <img src="/pen.svg" alt="" />
                        </button>
                        <button
                            class:active={toolType === TOOLS.ERASER}
                            on:click={() => changeTool(TOOLS.ERASER)}
                            aria-label="Eraser"
                        >
                            <img src="/eraser.svg" alt="" />
                        </button>
                        <button
                            class:active={toolType === TOOLS.HAND}
                            on:click={() => changeTool(TOOLS.HAND)}
                            aria-label="Move"
                        >
                            H
                        </button>
                        <button
                            class:active={toolType === TOOLS.CROSS_OUT}
                            on:click={() => changeTool(TOOLS.CROSS_OUT)}
                            aria-label="Cross out"
                        >
                            X
                        </button>
                        <button on:click={() => editorCanvas?.undo()} aria-label="Undo">
                            Undo
                        </button>
                        <button on:click={() => editorCanvas?.redo()} aria-label="Redo">
                            Redo
                        </button>
                        <button
                            on:click={() => editorCanvas?.clearCanvas()}
                            aria-label="Clear drawing"
                        >
                            Clear
                        </button>

                        <label class="stroke-control">
                            <span>Stroke</span>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                bind:value={strokeWidth}
                            />
                        </label>
                    </div>

                    <div class="color-strip" aria-label="Pen colors">
                        {#each colors as color}
                            <button
                                class:active={paletteColor === color}
                                style:background={color}
                                on:click={() => {
                                    paletteColor = color;
                                    changeTool(TOOLS.PEN);
                                }}
                                aria-label={`Use ${color}`}
                            ></button>
                        {/each}
                        <input
                            type="color"
                            bind:value={paletteColor}
                            on:input={() => changeTool(TOOLS.PEN)}
                            aria-label="Custom color"
                        />
                    </div>

                    <div class="editor-canvas">
                        {#key selectedDay.id}
                            <Canvas
                                bind:this={editorCanvas}
                                {toolType}
                                {paletteColor}
                                {background}
                                {strokeWidth}
                                id={selectedDay.id}
                                state={selectedDay.state}
                                {handleCanvasChange}
                                size={360}
                            />
                        {/key}
                    </div>

                    <textarea
                        value={selectedNote}
                        on:input={handleNoteChange}
                        placeholder="Add plans, reminders, tiny victories..."
                        aria-label="Day notes"
                    ></textarea>
                {/if}
            </aside>
        </div>
    </section>
{:else}
    <div class="loading-container">
        <div class="loading" />
    </div>
{/if}

<style>
    .calendar-shell {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .calendar-header,
    .workspace,
    .day-panel-header,
    .toolbar,
    .color-strip,
    .month-actions {
        display: flex;
        align-items: center;
    }

    .calendar-header {
        justify-content: space-between;
        gap: 1rem;
    }

    .eyebrow {
        margin: 0;
        font-family: var(--font-body);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    h1,
    h2 {
        margin: 0;
        text-align: left;
    }

    h2 {
        font-size: 1.6rem;
    }

    .month-actions {
        gap: 0.4rem;
        padding: 0.35rem;
        border: 1px solid #1d1d1d;
        background: rgba(255, 255, 255, 0.72);
        border-radius: 0.5rem;
    }

    button {
        font: inherit;
    }

    .month-actions button,
    .toolbar button {
        min-width: 2.4rem;
        height: 2.4rem;
        padding: 0 0.55rem;
        border: 1px solid #1d1d1d;
        background: #fffdf8;
        border-radius: 0.35rem;
        cursor: pointer;
        white-space: nowrap;
    }

    .today-button {
        padding: 0 0.75rem;
    }

    .workspace {
        align-items: stretch;
        gap: 1rem;
    }

    .month-board,
    .day-panel {
        border: 1px solid black;
        background: rgba(255, 253, 248, 0.82);
        box-shadow: 0 10px 28px rgba(46, 56, 67, 0.12);
    }

    .month-board {
        flex: 1;
        min-width: 0;
        padding: 1rem;
    }

    .weekdays,
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    .weekdays {
        gap: 0.35rem;
        margin-bottom: 0.45rem;
        font-family: var(--font-body);
        font-size: 0.72rem;
        font-weight: 700;
        text-align: center;
        text-transform: uppercase;
    }

    .calendar-grid {
        gap: 0.35rem;
    }

    .day {
        aspect-ratio: 1;
        min-width: 0;
        padding: 0.35rem;
        position: relative;
        border: 1px solid rgba(29, 29, 29, 0.55);
        background: rgba(255, 255, 255, 0.7);
        color: var(--color-text);
        cursor: pointer;
        overflow: hidden;
    }

    .day.empty {
        border-color: rgba(29, 29, 29, 0.12);
        background: rgba(255, 255, 255, 0.2);
        cursor: default;
    }

    .day.enabled:hover,
    .day.is-selected {
        background: #fff;
        border-color: #111;
        transform: translateY(-1px);
    }

    .day.is-selected {
        box-shadow: inset 0 0 0 2px #111;
    }

    .day.is-active {
        border-color: #0077c8;
        box-shadow: inset 0 0 0 2px #0077c8;
    }

    .caption {
        position: absolute;
        top: 0.25rem;
        left: 0.35rem;
        z-index: 2;
        width: auto;
        font-family: var(--font-body);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1;
        pointer-events: none;
        user-select: none;
    }

    .day-preview {
        display: block;
        width: 100%;
        height: 100%;
        padding-top: 0.5rem;
        box-sizing: border-box;
    }

    .markers {
        position: absolute;
        right: 0.3rem;
        bottom: 0.3rem;
        display: flex;
        gap: 0.2rem;
    }

    .markers span {
        width: 0.38rem;
        height: 0.38rem;
        border-radius: 50%;
        background: #111;
    }

    .markers span + span {
        background: #d58141;
    }

    .day-panel {
        width: min(24rem, 38vw);
        padding: 1rem;
        box-sizing: border-box;
    }

    .day-panel-header {
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        margin-bottom: 0.9rem;
    }

    .month-count {
        flex-shrink: 0;
        margin: 0;
        padding: 0.2rem 0.55rem;
        border: 1px solid #111;
        border-radius: 999px;
        background: #fff;
        font-family: var(--font-body);
        font-size: 0.75rem;
        font-weight: 700;
    }

    .toolbar {
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-bottom: 0.6rem;
    }

    .toolbar button.active,
    .color-strip button.active {
        border-color: #0077c8;
        box-shadow: inset 0 0 0 2px #0077c8;
    }

    .toolbar img {
        width: 1.1rem;
        height: 1.1rem;
    }

    .stroke-control {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 2.4rem;
        padding: 0 0.55rem;
        border: 1px solid #111;
        border-radius: 0.35rem;
        background: #fffdf8;
        font-family: var(--font-body);
        font-size: 0.75rem;
        font-weight: 700;
    }

    .stroke-control input {
        width: 5rem;
    }

    .color-strip {
        gap: 0.45rem;
        margin-bottom: 0.75rem;
    }

    .color-strip button,
    .color-strip input {
        width: 1.85rem;
        height: 1.85rem;
        border: 1px solid #111;
        border-radius: 50%;
        cursor: pointer;
    }

    .color-strip input {
        padding: 0;
        overflow: hidden;
        background: none;
    }

    .editor-canvas {
        aspect-ratio: 1;
        width: 100%;
        margin-bottom: 0.75rem;
        border: 1px solid #111;
        background:
            linear-gradient(rgba(20, 20, 20, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 20, 20, 0.04) 1px, transparent 1px),
            #fffefb;
        background-size: 24px 24px;
    }

    textarea {
        width: 100%;
        min-height: 7rem;
        padding: 0.75rem;
        border: 1px solid #111;
        border-radius: 0.35rem;
        box-sizing: border-box;
        resize: vertical;
        background: #fffefb;
        color: var(--color-text);
        font: 1rem/1.35 var(--font-body);
    }

    textarea::placeholder {
        color: rgba(0, 0, 0, 0.38);
    }

    .crooked {
        border-top-left-radius: 255px 15px;
        border-top-right-radius: 15px 225px;
        border-bottom-right-radius: 225px 15px;
        border-bottom-left-radius: 15px 255px;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    @media (max-width: 860px) {
        .calendar-header,
        .workspace {
            flex-direction: column;
        }

        .calendar-header {
            align-items: stretch;
        }

        .month-actions {
            justify-content: space-between;
        }

        .day-panel {
            width: 100%;
            order: 1;
        }

        .month-board {
            order: 2;
        }
    }

    @media (max-width: 560px) {
        .month-board {
            padding: 0.6rem;
        }

        .weekdays {
            font-size: 0.62rem;
        }

        .calendar-grid {
            gap: 0.2rem;
        }

        .day {
            padding: 0.2rem;
        }

        .caption {
            font-size: 0.68rem;
        }

        h1 {
            font-size: 2rem;
        }

        h2 {
            font-size: 1.35rem;
        }
    }
</style>
