/**
 * LinkedBuffer of generate content from xtemplate
 * @author yiminghe@gmail.com
 */

var util = require('./util');

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

  init: function () {
    this.data = '';
  },

  append: function (data) {
    this.data += data;
    return this;
  },

  write: function (data) {
    // ignore null or undefined
    if (data != null) {
      if (data.isBuffer) {
        return data;
      } else {
        this.data += (data);
      }
    }
    return this;
  },

  writeEscaped: function (data) {
    // ignore null or undefined
    if (data != null) {
      if (data.isBuffer) {
        return data;
      } else {
        this.data += (util.escapeHtml(data));
      }
    }
    return this;
  },

  insert: function () {
    var self = this;
    var list = self.list;
    var tpl = self.tpl;
    var nextFragment = new Buffer(list, self.next, tpl);
    var asyncFragment = new Buffer(list, nextFragment, tpl);
    self.next = asyncFragment;
    self.ready = true;
    return asyncFragment;
  },

  async: function (fn) {
    var asyncFragment = this.insert();
    var nextFragment = asyncFragment.next;
    fn(asyncFragment);
    return nextFragment;
  },

  error: function (e) {
    var callback = this.list.callback;
    if (callback) {
      var tpl = this.tpl;
      if (tpl) {
        if (e instanceof Error) {
        } else {
          e = new Error(e);
        }
        var name = tpl.name;
        var line = tpl.pos.line;
        var errorStr = 'XTemplate error in file: ' + name + ' at line ' + line + ': ';
        e.stack = errorStr + e.stack;
        e.message = errorStr + e.message;
        e.xtpl = {pos: {line: line}, name: name};
      }
      this.list.callback = null;
      callback(e, undefined);
    }
  },

  end: function () {
    var self = this;
    if (self.list.callback) {
      self.ready = true;
      self.list.flush();
    }
    return self;
  }
};

function LinkedBuffer(callback, config) {
  var self = this;
  self.config = config;
  self.head = new Buffer(self, undefined);
  self.callback = callback;
  this.init();
}

LinkedBuffer.prototype = {
  constructor: LinkedBuffer,

  init: function () {
    this.data = '';
  },

  append: function (data) {
    this.data += data;
  },

  end: function () {
    this.callback(null, this.data);
    this.callback = null;
  },

  flush: function () {
    var self = this;
    var fragment = self.head;
    while (fragment) {
      if (fragment.ready) {
        this.data += (fragment.data);
      } else {
        self.head = fragment;
        return;
      }
      fragment = fragment.next;
    }
    self.end();
  }
};

LinkedBuffer.Buffer = Buffer;

module.exports = LinkedBuffer;

/**
 * 2014-06-19 yiminghe@gmail.com
 * string concat is faster than array join: 85ms<-> 131ms
 */
