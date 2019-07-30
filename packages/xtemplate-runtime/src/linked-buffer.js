/**
 * LinkedBuffer of generate content from xtemplate
 */
import util from './util';

function Buffer(list, next, tpl) {
  this.list = list;
  this.init();
  this.next = next;
  this.ready = false;
  // tpl belongs
  this.tpl = tpl;
}

Buffer.prototype = {
  constructor: Buffer,

  isBuffer: 1,

  init() {
    this.data = '';
  },

  append(data) {
    this.data += data;
    return this;
  },

  write(data) {
    // ignore null or undefined
    if (data !== null && data !== undefined) {
      if (data.isBuffer) {
        return data;
      }
      this.data += data;
    }
    return this;
  },

  writeEscaped(data) {
    // ignore null or undefined
    if (data !== null && data !== undefined) {
      if (data.isBuffer) {
        return data;
      }
      this.data += util.escapeHtml(data);
    }
    return this;
  },

  insert() {
    const self = this;
    const list = self.list;
    const tpl = self.tpl;
    const nextFragment = new Buffer(list, self.next, tpl);
    const asyncFragment = new Buffer(list, nextFragment, tpl);
    self.next = asyncFragment;
    self.ready = true;
    return asyncFragment;
  },

  async(fn) {
    const asyncFragment = this.insert();
    const nextFragment = asyncFragment.next;
    fn(asyncFragment);
    return nextFragment;
  },

  error(e_) {
    const callback = this.list.callback;
    let e = e_;
    if (callback) {
      const tpl = this.tpl;
      if (tpl) {
        if (!(e instanceof Error)) {
          e = new Error(e);
        }
        const name = tpl.name;
        const line = tpl.pos.line;
        const errorStr = `XTemplate error in file: ${name} at line ${line}: `;
        try {
          // phantomjs
          e.stack = errorStr + e.stack;
          e.message = errorStr + e.message;
        } catch (e2) {
          // empty
        }
        e.xtpl = {
          pos: {
            line,
          },
          name,
        };
      }
      this.list.callback = null;
      callback(e, undefined);
    }
  },

  end() {
    const self = this;
    if (self.list.callback) {
      self.ready = true;
      self.list.flush();
    }
    return self;
  },
};

function LinkedBuffer(callback, config) {
  const self = this;
  self.config = config;
  self.head = new Buffer(self, undefined);
  self.callback = callback;
  this.init();
}

LinkedBuffer.prototype = {
  constructor: LinkedBuffer,

  init() {
    this.data = '';
  },

  append(data) {
    this.data += data;
  },

  end() {
    this.callback(null, this.data);
    this.callback = null;
  },

  flush() {
    const self = this;
    let fragment = self.head;
    while (fragment) {
      if (fragment.ready) {
        this.data += fragment.data;
      } else {
        self.head = fragment;
        return;
      }
      fragment = fragment.next;
    }
    self.end();
  },
};

LinkedBuffer.Buffer = Buffer;

export default LinkedBuffer;

/**
 * 2014-06-19 yiminghe@gmail.com
 * string concat is faster than array join: 85ms<-> 131ms
 */
