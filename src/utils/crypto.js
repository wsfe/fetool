import crypto from 'crypto';

export default {
  md5(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }
}