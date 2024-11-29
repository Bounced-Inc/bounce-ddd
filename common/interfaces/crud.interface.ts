export interface CRUD<T> {
    list: (limit: number, page: number) => Promise<T[]>,
    create: (resource: Omit<T, 'id'>) => unknown,
    updateById: (resourceId: string, resource: T) => Promise<string>,
    readById: (resourceId: string) => Promise<T | undefined>,
    deleteById: (resourceId: string) => Promise<string>,
    patchById: (resourceId: string, resource: Partial<T>) => Promise<T | undefined>,
}