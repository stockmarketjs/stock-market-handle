import * as uuid from 'uuid/v4';
import * as _ from 'lodash';

export class $ {

    public static getUuid() {
        return uuid();
    }

    public static tail<T>(source: T[]) {
        return _.takeRight(source, 1)[0];
    }

    public static cloneDeep(object: any){
        return JSON.parse(JSON.stringify(object));
    }

}