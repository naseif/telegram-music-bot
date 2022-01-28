export function onlyUnique(value: string, index: number, self: string | any[]): boolean {
    return self.indexOf(value) === index;
}
