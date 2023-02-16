export interface CRUD<T> {
    list: (limit: number, page: number, callingUserId: string) => Promise<T[]>;
    create: (resource: Omit<T, 'id'>) => Promise<T>;
    readById: (resourceId: string, callingUserId: string) => Promise<T>;
    updateById: (resourceId: string, resource: T, callingUserId: string) => Promise<string>;
    patchById: (resourceId: string, resource: Partial<T>, callingUserId: string) => Promise<T>;
    deleteById: (resourceId: string, callingUserId: string) => Promise<string>;
}