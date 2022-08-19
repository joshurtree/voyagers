export type MapFunc<T, U> = (value: T, key: number, all: T[]) => U;
export type FilterFunc<T>  = (value: T) => boolean;
export type SortFunc<T> = (value: T) => number;
export type ReduceFunc<T, U> = (agg: U, value: T) => U;
export type GroupFunc<Key, Value> = (value: Value) => Key;

export interface OODBQuery<T> {
    count() : number;
    filter(filterFunc: FilterFunc<T>): OODBQuery<T>;
    first(): T;
    group<Key>(groupFunc: GroupFunc<Key, T>) : OODBQuery<[Key, OODBQuery<T>]>;
    last(): T;
    limit(count: number) : OODBQuery<T>;
    map<Out>(mapFunc: MapFunc<T, Out>): OODBQuery<Out>;
    reduce<Product>(reduceFunc: ReduceFunc<T, Product>, initialValue: Product) : Product;
    skip(count: number) : OODBQuery<T>
    sort(sortFunc: SortFunc<T>, asc: boolean) : OODBQuery<T>;
    toArray() : T[]
};

const sum = arr => arr.reduce((total, value) => total + value, 0);
const sorter = <T>(compareVal: SortFunc<T>, mul: number) => (value1: T, value2: T) => mul*(compareVal(value2) - compareVal(value1));

export class ArrayQuery<T> implements OODBQuery<T> {
    baseArray: Array<T>

    constructor(arr: Array<T>) {
        this.baseArray = arr;
    }

    count() : number {
        return this.baseArray.length;
    }
    
    filter(filterFunc: FilterFunc<T>) : OODBQuery<T> {
        return new ArrayQuery(this.baseArray.filter(filterFunc));    
    }

    first(): T {
        return this.baseArray[0];
    }

    group<Key>(groupFunc: GroupFunc<Key, T>): OODBQuery<[Key, OODBQuery<T>]> {
        const map = new Map<Key, T[]>;
        this.baseArray.forEach(item => {
           const group = groupFunc(item);
           if (!map.get(group)) 
              map.set(group, []);
     
           map.get(group).push(item);
        });
     
        return new ArrayQuery<[Key, OODBQuery<T>]>(Array.from(map.entries()).map(([key, values]) => [key, new ArrayQuery(values)]));
    }

    last(): T {
        return this.baseArray[this.baseArray.length - 1];
    }

    limit(count: number) : OODBQuery<T> {
        return new ArrayQuery(this.baseArray.slice(0, count));
    }

    map<Out>(mapFunc: MapFunc<T, Out>) : OODBQuery<Out> {
        return new ArrayQuery(this.baseArray.map(mapFunc));
    }

    reduce<Product>(reduceFunc: ReduceFunc<T, Product>, initialValue: Product): Product {
        return this.baseArray.reduce(reduceFunc, initialValue);
    }
    
    skip(count: number) : OODBQuery<T> {
        return new ArrayQuery(this.baseArray.slice(count));
    }

    sort(sortFunc: SortFunc<T>, asc: boolean) : OODBQuery<T> {
        return new ArrayQuery<T>([...this.baseArray].sort(sorter(sortFunc, asc ? 1 : -1)));
    }

    toArray(): T[] {
        return [...this.baseArray];
    }
};