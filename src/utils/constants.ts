export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const colors = ['#100100', '#d58141', '#d7c44c', '#4fa9cc', '#3f8d27'];

export const CANVAS_KEY = 'canvas';

export const CUSTOM_COLOR_EVENT = 'color';
export const CUSTOM_STROKE_EVENT = 'strokeWidthChange';

export enum TOOLS {
    PEN = 'pen',
    ERASER = 'eraser',
    HAND = 'hand',
    CROSS_OUT = 'cross-out',
}

export const toolCursors = {
    [TOOLS.ERASER]: 'cursor-eraser',
    [TOOLS.PEN]: 'cursor-pen',
    [TOOLS.HAND]: 'cursor-hand',
    [TOOLS.CROSS_OUT]: 'cursor-cross-out',
};
