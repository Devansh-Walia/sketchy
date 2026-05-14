import type { TOOLS } from './constants';

export interface Day {
    name: string;
    enabled: boolean;
    date: Date;
    id: string;
    isToday: boolean;
    state?: string;
}

export interface CanvasData {
    [key: string]: string;
}

export interface NoteData {
    [key: string]: string;
}

export type Point = {
    x: number;
    y: number;
};

export type Element = {
    id: number;
    type: TOOLS;
    points: Point[];
    strokeColor: string;
    strokeWidth: number;
    position: Point;
    selected: boolean;
    crossedOut: boolean;
    text?: string;
    fontSize?: number;
};
