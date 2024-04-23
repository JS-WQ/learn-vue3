export function isObj(data:any){
    return typeof data === 'object' && data !== null
}
export function hasOwn(obj: any,key: any){
    return Object.prototype.hasOwnProperty.call(obj,key)
}