import * as crypto from 'crypto';
import { ConfigServiceStatic } from '../../provider/config/config.service';

export class Encrypt {

    /**
     * 创建不可逆密码
     *
     * @static
     * @param {string[]} sources 顺序要固定的
     * @returns {string}
     * @memberof Encrypt
     */
    static make(sources: string[]): string {
        sources.push('cce492688e30ea1eeaaa637df7e44eed');
        const hash = crypto.createHmac('sha1', ConfigServiceStatic.privateKey);
        hash.update(String(sources.join('_')));
        const res = `V1===${hash.digest('base64')}`;

        return res;
    }

}