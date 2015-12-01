/**
 * LinkedBuffer of generate content from xtemplate
 * @author yiminghe@gmail.com
 */

'use strict';

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

  init: function init() {
    this.data = '';
  },

  append: function append(data) {
    this.data += data;
    return this;
  },

  write: function write(data) {
    // ignore null or undefined
    if (data !== null && data !== undefined) {
      if (data.isBuffer) {
        return data;
      }
      this.data += data;
    }
    return this;
  },

  writeEscaped: function writeEscaped(data) {
    // ignore null or undefined
    if (data !== null && data !== undefined) {
      if (data.isBuffer) {
        return data;
      }
      this.data += util.escapeHtml(data);
    }
    return this;
  },

  insert: function insert() {
    var self = this;
    var list = self.list;
    var tpl = self.tpl;
    var nextFragment = new Buffer(list, self.next, tpl);
    var asyncFragment = new Buffer(list, nextFragment, tpl);
    self.next = asyncFragment;
    self.ready = true;
    return asyncFragment;
  },

  async: function async(fn) {
    var asyncFragment = this.insert();
    var nextFragment = asyncFragment.next;
    fn(asyncFragment);
    return nextFragment;
  },

  error: function error(e_) {
    var callback = this.list.callback;
    var e = e_;
    if (callback) {
      var tpl = this.tpl;
      if (tpl) {
        if (!(e instanceof Error)) {
          e = new Error(e);
        }
        var _name = tpl.name;
        var line = tpl.pos.line;
        var errorStr = 'XTemplate error in file: ' + _name + ' at line ' + line + ': ';
        try {
          // phantomjs
          e.stack = errorStr + e.stack;
          e.message = errorStr + e.message;
        } catch (e2) {
          // empty
        }
        e.xtpl = { pos: { line: line }, name: _name };
      }
      this.list.callback = null;
      callback(e, undefined);
    }
  },

  end: function end() {
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

  init: function init() {
    this.data = '';
  },

  append: function append(data) {
    this.data += data;
  },

  end: function end() {
    this.callback(null, this.data);
    this.callback = null;
  },

  flush: function flush() {
    var self = this;
    var fragment = self.head;
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
  }
};

LinkedBuffer.Buffer = Buffer;

module.exports = LinkedBuffer;

/**
 * 2014-06-19 yiminghe@gmail.com
 * string concat is faster than array join: 85ms<-> 131ms
 */