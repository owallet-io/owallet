export default class Validator {
    constructor(tronWeb?: boolean);
    tronWeb: true;
    invalid(param: any): any;
    notPositive(param: any): string;
    notEqual(param: any): any;
    notValid(params?: any[], callback?: Function): boolean;
}
