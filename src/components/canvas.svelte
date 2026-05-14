<script lang="ts">
    import { onDestroy, onMount } from 'svelte';

    import { toolCursors, TOOLS } from '../utils/constants';
    import type { Element, Point } from '../utils/types';

    export let id: string;
    export let state: string | undefined;
    export let handleCanvasChange: (id: string, data: string) => void;

    export let paletteColor: string;
    export let background = 'none';
    export let toolType: TOOLS;
    export let interactive = true;
    export let size = 100;

    export let strokeWidth = 2;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    let elements: Element[] = [];
    let undoStack: Element[] = [];
    let redoStack: Element[] = [];
    let currentElement: Element | null = null;
    let drawing = false;
    let dragging = false;
    let scale = 1;
    let dragStart: Point | null = null;
    let lastLoadedState: string | undefined;

    function getMousePosition(event: MouseEvent | TouchEvent): {
        x: number;
        y: number;
    } {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (event instanceof TouchEvent) {
            const touch = event.touches[0];
            return {
                x: ((touch.clientX - rect.left) * scaleX) / scale,
                y: ((touch.clientY - rect.top) * scaleY) / scale,
            };
        }

        return {
            x: ((event.clientX - rect.left) * scaleX) / scale,
            y: ((event.clientY - rect.top) * scaleY) / scale,
        };
    }

    const isPointInElement = (
        x: number,
        y: number,
        element: Element,
    ): boolean => {
        let tolerance = 5;

        for (let i = 1; i < element.points.length; i++) {
            const p1 = {
                x: element.points[i - 1].x + element.position.x,
                y: element.points[i - 1].y + element.position.y,
            };
            const p2 = {
                x: element.points[i].x + element.position.x,
                y: element.points[i].y + element.position.y,
            };

            if (
                distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y) <= tolerance
            ) {
                return true;
            }
        }

        return false;
    };

    const distanceToLineSegment = (
        x: number,
        y: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
    ): number => {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) {
            param = dot / len_sq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    function smoothFreehand(): void {
        if (!currentElement) return;

        const points = currentElement.points;
        if (points.length < 3) return;

        const lastIndex = points.length - 1;
        const prevIndex = lastIndex - 1;
        const p1 = points[prevIndex];
        const p2 = points[lastIndex];

        const midPointX = (p1.x + p2.x) / 2;
        const midPointY = (p1.y + p2.y) / 2;

        points[prevIndex] = { x: midPointX, y: midPointY };
    }

    const startInteraction = (e: MouseEvent | TouchEvent) => {
        const { x, y } = getMousePosition(e);

        if (toolType === TOOLS.HAND) {
            const clickedElement = elements.find((element) =>
                isPointInElement(x, y, element),
            );

            if (clickedElement) {
                if (!e.shiftKey) {
                    elements.forEach((el) => (el.selected = false));
                }
                clickedElement.selected = !clickedElement.selected;
                dragging = true;
                dragStart = { x, y };
            } else if (!e.shiftKey) {
                elements.forEach((el) => (el.selected = false));
            }
        } else if (toolType === TOOLS.CROSS_OUT) {
            const crossElement: Element = {
                id: elements.length,
                type: TOOLS.CROSS_OUT,
                points: [
                    { x: 0, y: 0 },
                    { x: size, y: size },
                    { x: 0, y: size },
                    { x: size, y: 0 },
                ],
                strokeColor: 'red',
                strokeWidth: 3,
                position: { x: 0, y: 0 },
                selected: false,
                crossedOut: false,
            };
            elements = [...elements, crossElement];
            undoStack = [...undoStack, crossElement];
            redraw();
        } else if (toolType === TOOLS.ERASER) {
            drawing = true;
            eraseAtPoint(x, y);
        } else {
            drawing = true;

            currentElement = {
                id: elements.length,
                type: toolType,
                points: [{ x, y }],
                strokeColor: paletteColor,
                strokeWidth,
                position: { x: 0, y: 0 },
                selected: false,
                crossedOut: false,
            };

            elements = [...elements, currentElement];
            redoStack = [];
        }

        redraw();
    };

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
        const { x, y } = getMousePosition(e);

        if ((toolType === TOOLS.PEN || toolType === TOOLS.ERASER) && drawing) {
            if (toolType === TOOLS.PEN && currentElement) {
                currentElement.points = [...currentElement.points, { x, y }];
                smoothFreehand();
            } else if (toolType === TOOLS.ERASER) {
                eraseAtPoint(x, y);
            }
            redraw();
        } else if (toolType === TOOLS.HAND && dragging && dragStart) {
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;

            elements.forEach((el) => {
                if (el.selected) {
                    el.position.x += dx;
                    el.position.y += dy;
                }
            });

            dragStart = { x, y };
            redraw();
        }
    };

    const stopInteraction = (e: MouseEvent | TouchEvent) => {
        if (drawing && currentElement) {
            undoStack = [...undoStack, currentElement];
        }

        drawing = false;
        dragging = false;
        currentElement = null;
        dragStart = null;
        redraw();
    };

    export function undo(): void {
        if (undoStack.length > 0) {
            const lastElement = undoStack.pop();
            if (lastElement) {
                redoStack = [...redoStack, lastElement];
                elements = elements.filter((el) => el.id !== lastElement.id);
                redraw();
            }
        }
    }

    export function redo(): void {
        if (redoStack.length > 0) {
            const redoElement = redoStack.pop();
            if (redoElement) {
                undoStack = [...undoStack, redoElement];
                elements = [...elements, redoElement];
                redraw();
            }
        }
    }

    export function clearCanvas(): void {
        elements = [];
        undoStack = [];
        redoStack = [];
        redraw();
    }

    function handleZoom(event: WheelEvent): void {
        event.preventDefault();
        const zoomAmount = event.deltaY * -0.001;
        const newScale = Math.max(0.1, Math.min(scale + zoomAmount, 3));
        scale = newScale;
        redraw();
    }

    const drawCross = (element: Element) => {
        if (!context) return;

        context.beginPath();
        context.moveTo(element.points[0].x, element.points[0].y);
        context.lineTo(element.points[1].x, element.points[1].y);
        context.moveTo(element.points[2].x, element.points[2].y);
        context.lineTo(element.points[3].x, element.points[3].y);
        context.strokeStyle = element.strokeColor;
        context.lineWidth = element.strokeWidth;
        context.stroke();
    };

    const eraseAtPoint = (x: number, y: number) => {
        const eraserSize = 20 / scale;
        elements = elements.filter((element) => {
            if (element.type === TOOLS.PEN) {
                element.points = element.points.filter((point) => {
                    const dx = point.x + element.position.x - x;
                    const dy = point.y + element.position.y - y;
                    return Math.sqrt(dx * dx + dy * dy) > eraserSize / 2;
                });
                return element.points.length > 1;
            } else if (element.type === TOOLS.CROSS_OUT) {
                // Check if the eraser intersects with the cross
                const crossLeft = element.position.x;
                const crossRight = element.position.x + size;
                const crossTop = element.position.y;
                const crossBottom = element.position.y + size;

                if (
                    x >= crossLeft - eraserSize / 2 &&
                    x <= crossRight + eraserSize / 2 &&
                    y >= crossTop - eraserSize / 2 &&
                    y <= crossBottom + eraserSize / 2
                ) {
                    // If the eraser intersects with the cross, remove it entirely
                    return false;
                }
            }
            return true;
        });
    };

    const redraw = () => {
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.scale(scale, scale);

        elements.forEach((element) => {
            if (element.type === TOOLS.PEN) {
                context.strokeStyle = element.strokeColor;
                context.lineWidth = element.strokeWidth / scale;
                context.lineCap = 'round';

                context.beginPath();

                element.points.forEach((point, index) => {
                    const x = point.x + element.position.x;
                    const y = point.y + element.position.y;
                    if (index === 0) {
                        context.moveTo(x, y);
                    } else {
                        context.lineTo(x, y);
                    }
                });

                context.stroke();

                if (element.selected) {
                    context.strokeStyle = 'blue';
                    context.lineWidth = 2 / scale;
                    context.setLineDash([5 / scale, 5 / scale]);
                    context.beginPath();

                    context.strokeRect(
                        element.position.x +
                            Math.min(...element.points.map((p) => p.x)) -
                            5 / scale,
                        element.position.y +
                            Math.min(...element.points.map((p) => p.y)) -
                            5 / scale,
                        Math.max(...element.points.map((p) => p.x)) -
                            Math.min(...element.points.map((p) => p.x)) +
                            10 / scale,
                        Math.max(...element.points.map((p) => p.y)) -
                            Math.min(...element.points.map((p) => p.y)) +
                            10 / scale,
                    );

                    context.stroke();
                    context.setLineDash([]);
                }
            } else if (element.type === TOOLS.CROSS_OUT) {
                drawCross(element);
            }
        });

        if (interactive) {
            handleCanvasChange(id, JSON.stringify({ elements }));
        }
        context.restore();
    };

    function loadStateFromProp() {
        if (!state) {
            elements = [];
            lastLoadedState = state;
            redraw();
            return;
        }

        try {
            const data = JSON.parse(state);
            elements = Array.isArray(data?.elements) ? data.elements : [];
        } catch {
            elements = [];
        }
        lastLoadedState = state;
        redraw();
    }

    $: if (!interactive && context && state !== lastLoadedState) {
        loadStateFromProp();
    }

    onMount(() => {
        canvas.width = size;
        canvas.height = size;
        context = canvas.getContext('2d') as CanvasRenderingContext2D;

        loadStateFromProp();
    });

    onDestroy(() => {
        if (interactive) {
            handleCanvasChange(id, JSON.stringify({ elements }));
        }
    });
</script>

<canvas
    class={`${toolCursors[toolType]} ${interactive ? '' : 'is-preview'}`}
    style={`background: ${background}; color: ${paletteColor}; width: 100%; height: 100%;`}
    bind:this={canvas}
    on:mousedown={(e) => interactive && startInteraction(e)}
    on:mouseup={(e) => interactive && stopInteraction(e)}
    on:mousemove={(e) => interactive && handleInteraction(e)}
    on:contextmenu={(e) => e.preventDefault()}
    on:touchstart={(e) => interactive && startInteraction(e)}
    on:touchend={(e) => interactive && stopInteraction(e)}
    on:touchmove={(e) => interactive && handleInteraction(e)}
    on:touchcancel={(e) => interactive && stopInteraction(e)}
    on:wheel={(e) => interactive && handleZoom(e)}
></canvas>

<style>
    canvas {
        display: block;
        touch-action: none;
    }

    .is-preview {
        pointer-events: none;
    }

    .cursor-eraser {
        cursor: url('/eraser.svg'), pointer;
    }
    .cursor-pen {
        cursor:
            url('/pen.svg') 2 10,
            pointer;
    }
    .cursor-hand {
        cursor: grab;
    }
    .cursor-cross-out {
        cursor: crosshair;
    }
</style>
