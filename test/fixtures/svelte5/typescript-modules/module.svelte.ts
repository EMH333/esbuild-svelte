export class ClassCounter {
    count: number = $state(0);
}

export const counter: { count: number } = $state({
    count: 0,
});
