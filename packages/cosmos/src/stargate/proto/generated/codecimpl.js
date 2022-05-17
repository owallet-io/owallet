'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.tendermint = exports.cosmwasm = exports.ibc = exports.google = exports.cosmos = void 0;
var $protobuf = require('protobufjs/minimal');
const $Reader = $protobuf.Reader,
  $Writer = $protobuf.Writer,
  $util = $protobuf.util;
const $root = {};
exports.cosmos = $root.cosmos = (() => {
  const cosmos = {};
  cosmos.bank = (function () {
    const bank = {};
    bank.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Params = (function () {
        function Params(p) {
          this.sendEnabled = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Params.prototype.sendEnabled = $util.emptyArray;
        Params.prototype.defaultSendEnabled = false;
        Params.create = function create(properties) {
          return new Params(properties);
        };
        Params.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sendEnabled != null && m.sendEnabled.length) {
            for (var i = 0; i < m.sendEnabled.length; ++i)
              $root.cosmos.bank.v1beta1.SendEnabled.encode(
                m.sendEnabled[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.defaultSendEnabled != null &&
            Object.hasOwnProperty.call(m, 'defaultSendEnabled')
          )
            w.uint32(16).bool(m.defaultSendEnabled);
          return w;
        };
        Params.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Params();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.sendEnabled && m.sendEnabled.length))
                  m.sendEnabled = [];
                m.sendEnabled.push(
                  $root.cosmos.bank.v1beta1.SendEnabled.decode(r, r.uint32())
                );
                break;
              case 2:
                m.defaultSendEnabled = r.bool();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Params.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Params) return d;
          var m = new $root.cosmos.bank.v1beta1.Params();
          if (d.sendEnabled) {
            if (!Array.isArray(d.sendEnabled))
              throw TypeError(
                '.cosmos.bank.v1beta1.Params.sendEnabled: array expected'
              );
            m.sendEnabled = [];
            for (var i = 0; i < d.sendEnabled.length; ++i) {
              if (typeof d.sendEnabled[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.Params.sendEnabled: object expected'
                );
              m.sendEnabled[
                i
              ] = $root.cosmos.bank.v1beta1.SendEnabled.fromObject(
                d.sendEnabled[i]
              );
            }
          }
          if (d.defaultSendEnabled != null) {
            m.defaultSendEnabled = Boolean(d.defaultSendEnabled);
          }
          return m;
        };
        Params.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.sendEnabled = [];
          }
          if (o.defaults) {
            d.defaultSendEnabled = false;
          }
          if (m.sendEnabled && m.sendEnabled.length) {
            d.sendEnabled = [];
            for (var j = 0; j < m.sendEnabled.length; ++j) {
              d.sendEnabled[j] = $root.cosmos.bank.v1beta1.SendEnabled.toObject(
                m.sendEnabled[j],
                o
              );
            }
          }
          if (
            m.defaultSendEnabled != null &&
            m.hasOwnProperty('defaultSendEnabled')
          ) {
            d.defaultSendEnabled = m.defaultSendEnabled;
          }
          return d;
        };
        Params.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Params;
      })();
      v1beta1.SendEnabled = (function () {
        function SendEnabled(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SendEnabled.prototype.denom = '';
        SendEnabled.prototype.enabled = false;
        SendEnabled.create = function create(properties) {
          return new SendEnabled(properties);
        };
        SendEnabled.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, 'denom'))
            w.uint32(10).string(m.denom);
          if (m.enabled != null && Object.hasOwnProperty.call(m, 'enabled'))
            w.uint32(16).bool(m.enabled);
          return w;
        };
        SendEnabled.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.SendEnabled();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.enabled = r.bool();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SendEnabled.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.SendEnabled) return d;
          var m = new $root.cosmos.bank.v1beta1.SendEnabled();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.enabled != null) {
            m.enabled = Boolean(d.enabled);
          }
          return m;
        };
        SendEnabled.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = '';
            d.enabled = false;
          }
          if (m.denom != null && m.hasOwnProperty('denom')) {
            d.denom = m.denom;
          }
          if (m.enabled != null && m.hasOwnProperty('enabled')) {
            d.enabled = m.enabled;
          }
          return d;
        };
        SendEnabled.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SendEnabled;
      })();
      v1beta1.Input = (function () {
        function Input(p) {
          this.coins = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Input.prototype.address = '';
        Input.prototype.coins = $util.emptyArray;
        Input.create = function create(properties) {
          return new Input(properties);
        };
        Input.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.coins[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        Input.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Input();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                if (!(m.coins && m.coins.length)) m.coins = [];
                m.coins.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Input.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Input) return d;
          var m = new $root.cosmos.bank.v1beta1.Input();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.coins) {
            if (!Array.isArray(d.coins))
              throw TypeError(
                '.cosmos.bank.v1beta1.Input.coins: array expected'
              );
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.Input.coins: object expected'
                );
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.coins[i]
              );
            }
          }
          return m;
        };
        Input.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.coins = [];
          }
          if (o.defaults) {
            d.address = '';
          }
          if (m.address != null && m.hasOwnProperty('address')) {
            d.address = m.address;
          }
          if (m.coins && m.coins.length) {
            d.coins = [];
            for (var j = 0; j < m.coins.length; ++j) {
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.coins[j],
                o
              );
            }
          }
          return d;
        };
        Input.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Input;
      })();
      v1beta1.Output = (function () {
        function Output(p) {
          this.coins = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Output.prototype.address = '';
        Output.prototype.coins = $util.emptyArray;
        Output.create = function create(properties) {
          return new Output(properties);
        };
        Output.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.coins[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        Output.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Output();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                if (!(m.coins && m.coins.length)) m.coins = [];
                m.coins.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Output.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Output) return d;
          var m = new $root.cosmos.bank.v1beta1.Output();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.coins) {
            if (!Array.isArray(d.coins))
              throw TypeError(
                '.cosmos.bank.v1beta1.Output.coins: array expected'
              );
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.Output.coins: object expected'
                );
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.coins[i]
              );
            }
          }
          return m;
        };
        Output.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.coins = [];
          }
          if (o.defaults) {
            d.address = '';
          }
          if (m.address != null && m.hasOwnProperty('address')) {
            d.address = m.address;
          }
          if (m.coins && m.coins.length) {
            d.coins = [];
            for (var j = 0; j < m.coins.length; ++j) {
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.coins[j],
                o
              );
            }
          }
          return d;
        };
        Output.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Output;
      })();
      v1beta1.Supply = (function () {
        function Supply(p) {
          this.total = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Supply.prototype.total = $util.emptyArray;
        Supply.create = function create(properties) {
          return new Supply(properties);
        };
        Supply.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.total != null && m.total.length) {
            for (var i = 0; i < m.total.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.total[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        Supply.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Supply();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.total && m.total.length)) m.total = [];
                m.total.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Supply.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Supply) return d;
          var m = new $root.cosmos.bank.v1beta1.Supply();
          if (d.total) {
            if (!Array.isArray(d.total))
              throw TypeError(
                '.cosmos.bank.v1beta1.Supply.total: array expected'
              );
            m.total = [];
            for (var i = 0; i < d.total.length; ++i) {
              if (typeof d.total[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.Supply.total: object expected'
                );
              m.total[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.total[i]
              );
            }
          }
          return m;
        };
        Supply.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.total = [];
          }
          if (m.total && m.total.length) {
            d.total = [];
            for (var j = 0; j < m.total.length; ++j) {
              d.total[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.total[j],
                o
              );
            }
          }
          return d;
        };
        Supply.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Supply;
      })();
      v1beta1.DenomUnit = (function () {
        function DenomUnit(p) {
          this.aliases = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DenomUnit.prototype.denom = '';
        DenomUnit.prototype.exponent = 0;
        DenomUnit.prototype.aliases = $util.emptyArray;
        DenomUnit.create = function create(properties) {
          return new DenomUnit(properties);
        };
        DenomUnit.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, 'denom'))
            w.uint32(10).string(m.denom);
          if (m.exponent != null && Object.hasOwnProperty.call(m, 'exponent'))
            w.uint32(16).uint32(m.exponent);
          if (m.aliases != null && m.aliases.length) {
            for (var i = 0; i < m.aliases.length; ++i)
              w.uint32(26).string(m.aliases[i]);
          }
          return w;
        };
        DenomUnit.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.DenomUnit();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.exponent = r.uint32();
                break;
              case 3:
                if (!(m.aliases && m.aliases.length)) m.aliases = [];
                m.aliases.push(r.string());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DenomUnit.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.DenomUnit) return d;
          var m = new $root.cosmos.bank.v1beta1.DenomUnit();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.exponent != null) {
            m.exponent = d.exponent >>> 0;
          }
          if (d.aliases) {
            if (!Array.isArray(d.aliases))
              throw TypeError(
                '.cosmos.bank.v1beta1.DenomUnit.aliases: array expected'
              );
            m.aliases = [];
            for (var i = 0; i < d.aliases.length; ++i) {
              m.aliases[i] = String(d.aliases[i]);
            }
          }
          return m;
        };
        DenomUnit.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.aliases = [];
          }
          if (o.defaults) {
            d.denom = '';
            d.exponent = 0;
          }
          if (m.denom != null && m.hasOwnProperty('denom')) {
            d.denom = m.denom;
          }
          if (m.exponent != null && m.hasOwnProperty('exponent')) {
            d.exponent = m.exponent;
          }
          if (m.aliases && m.aliases.length) {
            d.aliases = [];
            for (var j = 0; j < m.aliases.length; ++j) {
              d.aliases[j] = m.aliases[j];
            }
          }
          return d;
        };
        DenomUnit.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DenomUnit;
      })();
      v1beta1.Metadata = (function () {
        function Metadata(p) {
          this.denomUnits = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Metadata.prototype.description = '';
        Metadata.prototype.denomUnits = $util.emptyArray;
        Metadata.prototype.base = '';
        Metadata.prototype.display = '';
        Metadata.prototype.name = '';
        Metadata.prototype.symbol = '';
        Metadata.create = function create(properties) {
          return new Metadata(properties);
        };
        Metadata.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, 'description')
          )
            w.uint32(10).string(m.description);
          if (m.denomUnits != null && m.denomUnits.length) {
            for (var i = 0; i < m.denomUnits.length; ++i)
              $root.cosmos.bank.v1beta1.DenomUnit.encode(
                m.denomUnits[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (m.base != null && Object.hasOwnProperty.call(m, 'base'))
            w.uint32(26).string(m.base);
          if (m.display != null && Object.hasOwnProperty.call(m, 'display'))
            w.uint32(34).string(m.display);
          if (m.name != null && Object.hasOwnProperty.call(m, 'name'))
            w.uint32(42).string(m.name);
          if (m.symbol != null && Object.hasOwnProperty.call(m, 'symbol'))
            w.uint32(50).string(m.symbol);
          return w;
        };
        Metadata.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Metadata();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.description = r.string();
                break;
              case 2:
                if (!(m.denomUnits && m.denomUnits.length)) m.denomUnits = [];
                m.denomUnits.push(
                  $root.cosmos.bank.v1beta1.DenomUnit.decode(r, r.uint32())
                );
                break;
              case 3:
                m.base = r.string();
                break;
              case 4:
                m.display = r.string();
                break;
              case 5:
                m.name = r.string();
                break;
              case 6:
                m.symbol = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Metadata.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Metadata) return d;
          var m = new $root.cosmos.bank.v1beta1.Metadata();
          if (d.description != null) {
            m.description = String(d.description);
          }
          if (d.denomUnits) {
            if (!Array.isArray(d.denomUnits))
              throw TypeError(
                '.cosmos.bank.v1beta1.Metadata.denomUnits: array expected'
              );
            m.denomUnits = [];
            for (var i = 0; i < d.denomUnits.length; ++i) {
              if (typeof d.denomUnits[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.Metadata.denomUnits: object expected'
                );
              m.denomUnits[i] = $root.cosmos.bank.v1beta1.DenomUnit.fromObject(
                d.denomUnits[i]
              );
            }
          }
          if (d.base != null) {
            m.base = String(d.base);
          }
          if (d.display != null) {
            m.display = String(d.display);
          }
          if (d.name != null) {
            m.name = String(d.name);
          }
          if (d.symbol != null) {
            m.symbol = String(d.symbol);
          }
          return m;
        };
        Metadata.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.denomUnits = [];
          }
          if (o.defaults) {
            d.description = '';
            d.base = '';
            d.display = '';
            d.name = '';
            d.symbol = '';
          }
          if (m.description != null && m.hasOwnProperty('description')) {
            d.description = m.description;
          }
          if (m.denomUnits && m.denomUnits.length) {
            d.denomUnits = [];
            for (var j = 0; j < m.denomUnits.length; ++j) {
              d.denomUnits[j] = $root.cosmos.bank.v1beta1.DenomUnit.toObject(
                m.denomUnits[j],
                o
              );
            }
          }
          if (m.base != null && m.hasOwnProperty('base')) {
            d.base = m.base;
          }
          if (m.display != null && m.hasOwnProperty('display')) {
            d.display = m.display;
          }
          if (m.name != null && m.hasOwnProperty('name')) {
            d.name = m.name;
          }
          if (m.symbol != null && m.hasOwnProperty('symbol')) {
            d.symbol = m.symbol;
          }
          return d;
        };
        Metadata.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Metadata;
      })();
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.send = function send(request, callback) {
            return this.rpcCall(
              send,
              $root.cosmos.bank.v1beta1.MsgSend,
              $root.cosmos.bank.v1beta1.MsgSendResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'Send' }
        );
        Object.defineProperty(
          (Msg.prototype.multiSend = function multiSend(request, callback) {
            return this.rpcCall(
              multiSend,
              $root.cosmos.bank.v1beta1.MsgMultiSend,
              $root.cosmos.bank.v1beta1.MsgMultiSendResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'MultiSend' }
        );
        return Msg;
      })();
      v1beta1.MsgSend = (function () {
        function MsgSend(p) {
          this.amount = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSend.prototype.fromAddress = '';
        MsgSend.prototype.toAddress = '';
        MsgSend.prototype.amount = $util.emptyArray;
        MsgSend.create = function create(properties) {
          return new MsgSend(properties);
        };
        MsgSend.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.fromAddress != null &&
            Object.hasOwnProperty.call(m, 'fromAddress')
          )
            w.uint32(10).string(m.fromAddress);
          if (m.toAddress != null && Object.hasOwnProperty.call(m, 'toAddress'))
            w.uint32(18).string(m.toAddress);
          if (m.amount != null && m.amount.length) {
            for (var i = 0; i < m.amount.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.amount[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          return w;
        };
        MsgSend.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgSend();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.fromAddress = r.string();
                break;
              case 2:
                m.toAddress = r.string();
                break;
              case 3:
                if (!(m.amount && m.amount.length)) m.amount = [];
                m.amount.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSend.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgSend) return d;
          var m = new $root.cosmos.bank.v1beta1.MsgSend();
          if (d.fromAddress != null) {
            m.fromAddress = String(d.fromAddress);
          }
          if (d.toAddress != null) {
            m.toAddress = String(d.toAddress);
          }
          if (d.amount) {
            if (!Array.isArray(d.amount))
              throw TypeError(
                '.cosmos.bank.v1beta1.MsgSend.amount: array expected'
              );
            m.amount = [];
            for (var i = 0; i < d.amount.length; ++i) {
              if (typeof d.amount[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.MsgSend.amount: object expected'
                );
              m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.amount[i]
              );
            }
          }
          return m;
        };
        MsgSend.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.amount = [];
          }
          if (o.defaults) {
            d.fromAddress = '';
            d.toAddress = '';
          }
          if (m.fromAddress != null && m.hasOwnProperty('fromAddress')) {
            d.fromAddress = m.fromAddress;
          }
          if (m.toAddress != null && m.hasOwnProperty('toAddress')) {
            d.toAddress = m.toAddress;
          }
          if (m.amount && m.amount.length) {
            d.amount = [];
            for (var j = 0; j < m.amount.length; ++j) {
              d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.amount[j],
                o
              );
            }
          }
          return d;
        };
        MsgSend.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSend;
      })();
      v1beta1.MsgSendResponse = (function () {
        function MsgSendResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSendResponse.create = function create(properties) {
          return new MsgSendResponse(properties);
        };
        MsgSendResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgSendResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgSendResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSendResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgSendResponse) return d;
          return new $root.cosmos.bank.v1beta1.MsgSendResponse();
        };
        MsgSendResponse.toObject = function toObject() {
          return {};
        };
        MsgSendResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSendResponse;
      })();
      v1beta1.MsgMultiSend = (function () {
        function MsgMultiSend(p) {
          this.inputs = [];
          this.outputs = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgMultiSend.prototype.inputs = $util.emptyArray;
        MsgMultiSend.prototype.outputs = $util.emptyArray;
        MsgMultiSend.create = function create(properties) {
          return new MsgMultiSend(properties);
        };
        MsgMultiSend.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.inputs != null && m.inputs.length) {
            for (var i = 0; i < m.inputs.length; ++i)
              $root.cosmos.bank.v1beta1.Input.encode(
                m.inputs[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.outputs != null && m.outputs.length) {
            for (var i = 0; i < m.outputs.length; ++i)
              $root.cosmos.bank.v1beta1.Output.encode(
                m.outputs[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        MsgMultiSend.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgMultiSend();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.inputs && m.inputs.length)) m.inputs = [];
                m.inputs.push(
                  $root.cosmos.bank.v1beta1.Input.decode(r, r.uint32())
                );
                break;
              case 2:
                if (!(m.outputs && m.outputs.length)) m.outputs = [];
                m.outputs.push(
                  $root.cosmos.bank.v1beta1.Output.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgMultiSend.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgMultiSend) return d;
          var m = new $root.cosmos.bank.v1beta1.MsgMultiSend();
          if (d.inputs) {
            if (!Array.isArray(d.inputs))
              throw TypeError(
                '.cosmos.bank.v1beta1.MsgMultiSend.inputs: array expected'
              );
            m.inputs = [];
            for (var i = 0; i < d.inputs.length; ++i) {
              if (typeof d.inputs[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.MsgMultiSend.inputs: object expected'
                );
              m.inputs[i] = $root.cosmos.bank.v1beta1.Input.fromObject(
                d.inputs[i]
              );
            }
          }
          if (d.outputs) {
            if (!Array.isArray(d.outputs))
              throw TypeError(
                '.cosmos.bank.v1beta1.MsgMultiSend.outputs: array expected'
              );
            m.outputs = [];
            for (var i = 0; i < d.outputs.length; ++i) {
              if (typeof d.outputs[i] !== 'object')
                throw TypeError(
                  '.cosmos.bank.v1beta1.MsgMultiSend.outputs: object expected'
                );
              m.outputs[i] = $root.cosmos.bank.v1beta1.Output.fromObject(
                d.outputs[i]
              );
            }
          }
          return m;
        };
        MsgMultiSend.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.inputs = [];
            d.outputs = [];
          }
          if (m.inputs && m.inputs.length) {
            d.inputs = [];
            for (var j = 0; j < m.inputs.length; ++j) {
              d.inputs[j] = $root.cosmos.bank.v1beta1.Input.toObject(
                m.inputs[j],
                o
              );
            }
          }
          if (m.outputs && m.outputs.length) {
            d.outputs = [];
            for (var j = 0; j < m.outputs.length; ++j) {
              d.outputs[j] = $root.cosmos.bank.v1beta1.Output.toObject(
                m.outputs[j],
                o
              );
            }
          }
          return d;
        };
        MsgMultiSend.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgMultiSend;
      })();
      v1beta1.MsgMultiSendResponse = (function () {
        function MsgMultiSendResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgMultiSendResponse.create = function create(properties) {
          return new MsgMultiSendResponse(properties);
        };
        MsgMultiSendResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgMultiSendResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgMultiSendResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgMultiSendResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgMultiSendResponse)
            return d;
          return new $root.cosmos.bank.v1beta1.MsgMultiSendResponse();
        };
        MsgMultiSendResponse.toObject = function toObject() {
          return {};
        };
        MsgMultiSendResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgMultiSendResponse;
      })();
      return v1beta1;
    })();
    return bank;
  })();
  cosmos.staking = (function () {
    const staking = {};
    staking.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.delegate = function delegate(request, callback) {
            return this.rpcCall(
              delegate,
              $root.cosmos.staking.v1beta1.MsgDelegate,
              $root.cosmos.staking.v1beta1.MsgDelegateResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'Delegate' }
        );
        Object.defineProperty(
          (Msg.prototype.beginRedelegate = function beginRedelegate(
            request,
            callback
          ) {
            return this.rpcCall(
              beginRedelegate,
              $root.cosmos.staking.v1beta1.MsgBeginRedelegate,
              $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'BeginRedelegate' }
        );
        Object.defineProperty(
          (Msg.prototype.undelegate = function undelegate(request, callback) {
            return this.rpcCall(
              undelegate,
              $root.cosmos.staking.v1beta1.MsgUndelegate,
              $root.cosmos.staking.v1beta1.MsgUndelegateResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'Undelegate' }
        );
        return Msg;
      })();
      v1beta1.MsgDelegate = (function () {
        function MsgDelegate(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgDelegate.prototype.delegatorAddress = '';
        MsgDelegate.prototype.validatorAddress = '';
        MsgDelegate.prototype.amount = null;
        MsgDelegate.create = function create(properties) {
          return new MsgDelegate(properties);
        };
        MsgDelegate.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, 'delegatorAddress')
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, 'validatorAddress')
          )
            w.uint32(18).string(m.validatorAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, 'amount'))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.amount,
              w.uint32(26).fork()
            ).ldelim();
          return w;
        };
        MsgDelegate.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgDelegate();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              case 3:
                m.amount = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgDelegate.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgDelegate) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgDelegate();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.amount != null) {
            if (typeof d.amount !== 'object')
              throw TypeError(
                '.cosmos.staking.v1beta1.MsgDelegate.amount: object expected'
              );
            m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
          }
          return m;
        };
        MsgDelegate.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = '';
            d.validatorAddress = '';
            d.amount = null;
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty('delegatorAddress')
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty('validatorAddress')
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.amount != null && m.hasOwnProperty('amount')) {
            d.amount = $root.cosmos.base.v1beta1.Coin.toObject(m.amount, o);
          }
          return d;
        };
        MsgDelegate.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgDelegate;
      })();
      v1beta1.MsgDelegateResponse = (function () {
        function MsgDelegateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgDelegateResponse.create = function create(properties) {
          return new MsgDelegateResponse(properties);
        };
        MsgDelegateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgDelegateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgDelegateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgDelegateResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgDelegateResponse)
            return d;
          return new $root.cosmos.staking.v1beta1.MsgDelegateResponse();
        };
        MsgDelegateResponse.toObject = function toObject() {
          return {};
        };
        MsgDelegateResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgDelegateResponse;
      })();
      v1beta1.MsgBeginRedelegate = (function () {
        function MsgBeginRedelegate(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgBeginRedelegate.prototype.delegatorAddress = '';
        MsgBeginRedelegate.prototype.validatorSrcAddress = '';
        MsgBeginRedelegate.prototype.validatorDstAddress = '';
        MsgBeginRedelegate.prototype.amount = null;
        MsgBeginRedelegate.create = function create(properties) {
          return new MsgBeginRedelegate(properties);
        };
        MsgBeginRedelegate.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, 'delegatorAddress')
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorSrcAddress != null &&
            Object.hasOwnProperty.call(m, 'validatorSrcAddress')
          )
            w.uint32(18).string(m.validatorSrcAddress);
          if (
            m.validatorDstAddress != null &&
            Object.hasOwnProperty.call(m, 'validatorDstAddress')
          )
            w.uint32(26).string(m.validatorDstAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, 'amount'))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.amount,
              w.uint32(34).fork()
            ).ldelim();
          return w;
        };
        MsgBeginRedelegate.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegate();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorSrcAddress = r.string();
                break;
              case 3:
                m.validatorDstAddress = r.string();
                break;
              case 4:
                m.amount = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgBeginRedelegate.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgBeginRedelegate)
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegate();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorSrcAddress != null) {
            m.validatorSrcAddress = String(d.validatorSrcAddress);
          }
          if (d.validatorDstAddress != null) {
            m.validatorDstAddress = String(d.validatorDstAddress);
          }
          if (d.amount != null) {
            if (typeof d.amount !== 'object')
              throw TypeError(
                '.cosmos.staking.v1beta1.MsgBeginRedelegate.amount: object expected'
              );
            m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
          }
          return m;
        };
        MsgBeginRedelegate.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = '';
            d.validatorSrcAddress = '';
            d.validatorDstAddress = '';
            d.amount = null;
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty('delegatorAddress')
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorSrcAddress != null &&
            m.hasOwnProperty('validatorSrcAddress')
          ) {
            d.validatorSrcAddress = m.validatorSrcAddress;
          }
          if (
            m.validatorDstAddress != null &&
            m.hasOwnProperty('validatorDstAddress')
          ) {
            d.validatorDstAddress = m.validatorDstAddress;
          }
          if (m.amount != null && m.hasOwnProperty('amount')) {
            d.amount = $root.cosmos.base.v1beta1.Coin.toObject(m.amount, o);
          }
          return d;
        };
        MsgBeginRedelegate.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgBeginRedelegate;
      })();
      v1beta1.MsgBeginRedelegateResponse = (function () {
        function MsgBeginRedelegateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgBeginRedelegateResponse.prototype.completionTime = null;
        MsgBeginRedelegateResponse.create = function create(properties) {
          return new MsgBeginRedelegateResponse(properties);
        };
        MsgBeginRedelegateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.completionTime != null &&
            Object.hasOwnProperty.call(m, 'completionTime')
          )
            $root.google.protobuf.Timestamp.encode(
              m.completionTime,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        MsgBeginRedelegateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.completionTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgBeginRedelegateResponse.fromObject = function fromObject(d) {
          if (
            d instanceof $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse
          )
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse();
          if (d.completionTime != null) {
            if (typeof d.completionTime !== 'object')
              throw TypeError(
                '.cosmos.staking.v1beta1.MsgBeginRedelegateResponse.completionTime: object expected'
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(
              d.completionTime
            );
          }
          return m;
        };
        MsgBeginRedelegateResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.completionTime = null;
          }
          if (m.completionTime != null && m.hasOwnProperty('completionTime')) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(
              m.completionTime,
              o
            );
          }
          return d;
        };
        MsgBeginRedelegateResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgBeginRedelegateResponse;
      })();
      v1beta1.MsgUndelegate = (function () {
        function MsgUndelegate(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgUndelegate.prototype.delegatorAddress = '';
        MsgUndelegate.prototype.validatorAddress = '';
        MsgUndelegate.prototype.amount = null;
        MsgUndelegate.create = function create(properties) {
          return new MsgUndelegate(properties);
        };
        MsgUndelegate.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, 'delegatorAddress')
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, 'validatorAddress')
          )
            w.uint32(18).string(m.validatorAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, 'amount'))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.amount,
              w.uint32(26).fork()
            ).ldelim();
          return w;
        };
        MsgUndelegate.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgUndelegate();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              case 3:
                m.amount = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgUndelegate.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgUndelegate) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgUndelegate();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.amount != null) {
            if (typeof d.amount !== 'object')
              throw TypeError(
                '.cosmos.staking.v1beta1.MsgUndelegate.amount: object expected'
              );
            m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
          }
          return m;
        };
        MsgUndelegate.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = '';
            d.validatorAddress = '';
            d.amount = null;
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty('delegatorAddress')
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty('validatorAddress')
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.amount != null && m.hasOwnProperty('amount')) {
            d.amount = $root.cosmos.base.v1beta1.Coin.toObject(m.amount, o);
          }
          return d;
        };
        MsgUndelegate.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgUndelegate;
      })();
      v1beta1.MsgUndelegateResponse = (function () {
        function MsgUndelegateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgUndelegateResponse.prototype.completionTime = null;
        MsgUndelegateResponse.create = function create(properties) {
          return new MsgUndelegateResponse(properties);
        };
        MsgUndelegateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.completionTime != null &&
            Object.hasOwnProperty.call(m, 'completionTime')
          )
            $root.google.protobuf.Timestamp.encode(
              m.completionTime,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        MsgUndelegateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgUndelegateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.completionTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgUndelegateResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgUndelegateResponse)
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgUndelegateResponse();
          if (d.completionTime != null) {
            if (typeof d.completionTime !== 'object')
              throw TypeError(
                '.cosmos.staking.v1beta1.MsgUndelegateResponse.completionTime: object expected'
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(
              d.completionTime
            );
          }
          return m;
        };
        MsgUndelegateResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.completionTime = null;
          }
          if (m.completionTime != null && m.hasOwnProperty('completionTime')) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(
              m.completionTime,
              o
            );
          }
          return d;
        };
        MsgUndelegateResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgUndelegateResponse;
      })();
      return v1beta1;
    })();
    return staking;
  })();
  cosmos.gov = (function () {
    const gov = {};
    gov.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.VoteOption = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = 'VOTE_OPTION_UNSPECIFIED')] = 0;
        values[(valuesById[1] = 'VOTE_OPTION_YES')] = 1;
        values[(valuesById[2] = 'VOTE_OPTION_ABSTAIN')] = 2;
        values[(valuesById[3] = 'VOTE_OPTION_NO')] = 3;
        values[(valuesById[4] = 'VOTE_OPTION_NO_WITH_VETO')] = 4;
        return values;
      })();
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.vote = function vote(request, callback) {
            return this.rpcCall(
              vote,
              $root.cosmos.gov.v1beta1.MsgVote,
              $root.cosmos.gov.v1beta1.MsgVoteResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'Vote' }
        );
        Object.defineProperty(
          (Msg.prototype.deposit = function deposit(request, callback) {
            return this.rpcCall(
              deposit,
              $root.cosmos.gov.v1beta1.MsgDeposit,
              $root.cosmos.gov.v1beta1.MsgDepositResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'Deposit' }
        );
        return Msg;
      })();
      v1beta1.MsgVote = (function () {
        function MsgVote(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgVote.prototype.proposalId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgVote.prototype.voter = '';
        MsgVote.prototype.option = 0;
        MsgVote.create = function create(properties) {
          return new MsgVote(properties);
        };
        MsgVote.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.proposalId != null &&
            Object.hasOwnProperty.call(m, 'proposalId')
          )
            w.uint32(8).uint64(m.proposalId);
          if (m.voter != null && Object.hasOwnProperty.call(m, 'voter'))
            w.uint32(18).string(m.voter);
          if (m.option != null && Object.hasOwnProperty.call(m, 'option'))
            w.uint32(24).int32(m.option);
          return w;
        };
        MsgVote.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.gov.v1beta1.MsgVote();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.proposalId = r.uint64();
                break;
              case 2:
                m.voter = r.string();
                break;
              case 3:
                m.option = r.int32();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgVote.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.gov.v1beta1.MsgVote) return d;
          var m = new $root.cosmos.gov.v1beta1.MsgVote();
          if (d.proposalId != null) {
            if ($util.Long)
              (m.proposalId = $util.Long.fromValue(
                d.proposalId
              )).unsigned = true;
            else if (typeof d.proposalId === 'string')
              m.proposalId = parseInt(d.proposalId, 10);
            else if (typeof d.proposalId === 'number')
              m.proposalId = d.proposalId;
            else if (typeof d.proposalId === 'object')
              m.proposalId = new $util.LongBits(
                d.proposalId.low >>> 0,
                d.proposalId.high >>> 0
              ).toNumber(true);
          }
          if (d.voter != null) {
            m.voter = String(d.voter);
          }
          switch (d.option) {
            case 'VOTE_OPTION_UNSPECIFIED':
            case 0:
              m.option = 0;
              break;
            case 'VOTE_OPTION_YES':
            case 1:
              m.option = 1;
              break;
            case 'VOTE_OPTION_ABSTAIN':
            case 2:
              m.option = 2;
              break;
            case 'VOTE_OPTION_NO':
            case 3:
              m.option = 3;
              break;
            case 'VOTE_OPTION_NO_WITH_VETO':
            case 4:
              m.option = 4;
              break;
          }
          return m;
        };
        MsgVote.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.proposalId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.proposalId = o.longs === String ? '0' : 0;
            d.voter = '';
            d.option = o.enums === String ? 'VOTE_OPTION_UNSPECIFIED' : 0;
          }
          if (m.proposalId != null && m.hasOwnProperty('proposalId')) {
            if (typeof m.proposalId === 'number')
              d.proposalId =
                o.longs === String ? String(m.proposalId) : m.proposalId;
            else
              d.proposalId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.proposalId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.proposalId.low >>> 0,
                      m.proposalId.high >>> 0
                    ).toNumber(true)
                  : m.proposalId;
          }
          if (m.voter != null && m.hasOwnProperty('voter')) {
            d.voter = m.voter;
          }
          if (m.option != null && m.hasOwnProperty('option')) {
            d.option =
              o.enums === String
                ? $root.cosmos.gov.v1beta1.VoteOption[m.option]
                : m.option;
          }
          return d;
        };
        MsgVote.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgVote;
      })();
      v1beta1.MsgVoteResponse = (function () {
        function MsgVoteResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgVoteResponse.create = function create(properties) {
          return new MsgVoteResponse(properties);
        };
        MsgVoteResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgVoteResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.gov.v1beta1.MsgVoteResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgVoteResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.gov.v1beta1.MsgVoteResponse) return d;
          return new $root.cosmos.gov.v1beta1.MsgVoteResponse();
        };
        MsgVoteResponse.toObject = function toObject() {
          return {};
        };
        MsgVoteResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgVoteResponse;
      })();
      v1beta1.MsgDeposit = (function () {
        function MsgDeposit(p) {
          this.amount = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgDeposit.prototype.proposalId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgDeposit.prototype.depositor = '';
        MsgDeposit.prototype.amount = $util.emptyArray;
        MsgDeposit.create = function create(properties) {
          return new MsgDeposit(properties);
        };
        MsgDeposit.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.proposalId != null &&
            Object.hasOwnProperty.call(m, 'proposalId')
          )
            w.uint32(8).uint64(m.proposalId);
          if (m.depositor != null && Object.hasOwnProperty.call(m, 'depositor'))
            w.uint32(18).string(m.depositor);
          if (m.amount != null && m.amount.length) {
            for (var i = 0; i < m.amount.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.amount[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          return w;
        };
        MsgDeposit.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.gov.v1beta1.MsgDeposit();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.proposalId = r.uint64();
                break;
              case 2:
                m.depositor = r.string();
                break;
              case 3:
                if (!(m.amount && m.amount.length)) m.amount = [];
                m.amount.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgDeposit.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.gov.v1beta1.MsgDeposit) return d;
          var m = new $root.cosmos.gov.v1beta1.MsgDeposit();
          if (d.proposalId != null) {
            if ($util.Long)
              (m.proposalId = $util.Long.fromValue(
                d.proposalId
              )).unsigned = true;
            else if (typeof d.proposalId === 'string')
              m.proposalId = parseInt(d.proposalId, 10);
            else if (typeof d.proposalId === 'number')
              m.proposalId = d.proposalId;
            else if (typeof d.proposalId === 'object')
              m.proposalId = new $util.LongBits(
                d.proposalId.low >>> 0,
                d.proposalId.high >>> 0
              ).toNumber(true);
          }
          if (d.depositor != null) {
            m.depositor = String(d.depositor);
          }
          if (d.amount) {
            if (!Array.isArray(d.amount))
              throw TypeError(
                '.cosmos.gov.v1beta1.MsgDeposit.amount: array expected'
              );
            m.amount = [];
            for (var i = 0; i < d.amount.length; ++i) {
              if (typeof d.amount[i] !== 'object')
                throw TypeError(
                  '.cosmos.gov.v1beta1.MsgDeposit.amount: object expected'
                );
              m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.amount[i]
              );
            }
          }
          return m;
        };
        MsgDeposit.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.amount = [];
          }
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.proposalId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.proposalId = o.longs === String ? '0' : 0;
            d.depositor = '';
          }
          if (m.proposalId != null && m.hasOwnProperty('proposalId')) {
            if (typeof m.proposalId === 'number')
              d.proposalId =
                o.longs === String ? String(m.proposalId) : m.proposalId;
            else
              d.proposalId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.proposalId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.proposalId.low >>> 0,
                      m.proposalId.high >>> 0
                    ).toNumber(true)
                  : m.proposalId;
          }
          if (m.depositor != null && m.hasOwnProperty('depositor')) {
            d.depositor = m.depositor;
          }
          if (m.amount && m.amount.length) {
            d.amount = [];
            for (var j = 0; j < m.amount.length; ++j) {
              d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.amount[j],
                o
              );
            }
          }
          return d;
        };
        MsgDeposit.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgDeposit;
      })();
      v1beta1.MsgDepositResponse = (function () {
        function MsgDepositResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgDepositResponse.create = function create(properties) {
          return new MsgDepositResponse(properties);
        };
        MsgDepositResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgDepositResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.gov.v1beta1.MsgDepositResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgDepositResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.gov.v1beta1.MsgDepositResponse)
            return d;
          return new $root.cosmos.gov.v1beta1.MsgDepositResponse();
        };
        MsgDepositResponse.toObject = function toObject() {
          return {};
        };
        MsgDepositResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgDepositResponse;
      })();
      return v1beta1;
    })();
    return gov;
  })();
  cosmos.distribution = (function () {
    const distribution = {};
    distribution.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.withdrawDelegatorReward = function withdrawDelegatorReward(
            request,
            callback
          ) {
            return this.rpcCall(
              withdrawDelegatorReward,
              $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward,
              $root.cosmos.distribution.v1beta1
                .MsgWithdrawDelegatorRewardResponse,
              request,
              callback
            );
          }),
          'name',
          { value: 'WithdrawDelegatorReward' }
        );
        return Msg;
      })();
      v1beta1.MsgWithdrawDelegatorReward = (function () {
        function MsgWithdrawDelegatorReward(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgWithdrawDelegatorReward.prototype.delegatorAddress = '';
        MsgWithdrawDelegatorReward.prototype.validatorAddress = '';
        MsgWithdrawDelegatorReward.create = function create(properties) {
          return new MsgWithdrawDelegatorReward(properties);
        };
        MsgWithdrawDelegatorReward.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, 'delegatorAddress')
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, 'validatorAddress')
          )
            w.uint32(18).string(m.validatorAddress);
          return w;
        };
        MsgWithdrawDelegatorReward.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgWithdrawDelegatorReward.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward
          )
            return d;
          var m = new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          return m;
        };
        MsgWithdrawDelegatorReward.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = '';
            d.validatorAddress = '';
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty('delegatorAddress')
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty('validatorAddress')
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          return d;
        };
        MsgWithdrawDelegatorReward.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgWithdrawDelegatorReward;
      })();
      v1beta1.MsgWithdrawDelegatorRewardResponse = (function () {
        function MsgWithdrawDelegatorRewardResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgWithdrawDelegatorRewardResponse.create = function create(
          properties
        ) {
          return new MsgWithdrawDelegatorRewardResponse(properties);
        };
        MsgWithdrawDelegatorRewardResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgWithdrawDelegatorRewardResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorRewardResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgWithdrawDelegatorRewardResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorRewardResponse
          )
            return d;
          return new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorRewardResponse();
        };
        MsgWithdrawDelegatorRewardResponse.toObject = function toObject() {
          return {};
        };
        MsgWithdrawDelegatorRewardResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgWithdrawDelegatorRewardResponse;
      })();
      return v1beta1;
    })();
    return distribution;
  })();
  cosmos.base = (function () {
    const base = {};
    base.query = (function () {
      /**
       * Namespace query.
       * @memberof cosmos.base
       * @namespace
       */
      const query = {};

      query.v1beta1 = (function () {
        /**
         * Namespace v1beta1.
         * @memberof cosmos.base.query
         * @namespace
         */
        const v1beta1 = {};

        v1beta1.PageRequest = (function () {
          /**
           * Properties of a PageRequest.
           * @memberof cosmos.base.query.v1beta1
           * @interface IPageRequest
           * @property {Uint8Array|null} [key] PageRequest key
           * @property {Long|null} [offset] PageRequest offset
           * @property {Long|null} [limit] PageRequest limit
           * @property {boolean|null} [count_total] PageRequest count_total
           */

          /**
           * Constructs a new PageRequest.
           * @memberof cosmos.base.query.v1beta1
           * @classdesc Represents a PageRequest.
           * @implements IPageRequest
           * @constructor
           * @param {cosmos.base.query.v1beta1.IPageRequest=} [p] Properties to set
           */
          function PageRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }

          /**
           * PageRequest key.
           * @member {Uint8Array} key
           * @memberof cosmos.base.query.v1beta1.PageRequest
           * @instance
           */
          PageRequest.prototype.key = $util.newBuffer([]);

          /**
           * PageRequest offset.
           * @member {Long} offset
           * @memberof cosmos.base.query.v1beta1.PageRequest
           * @instance
           */
          PageRequest.prototype.offset = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;

          /**
           * PageRequest limit.
           * @member {Long} limit
           * @memberof cosmos.base.query.v1beta1.PageRequest
           * @instance
           */
          PageRequest.prototype.limit = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;

          /**
           * PageRequest count_total.
           * @member {boolean} count_total
           * @memberof cosmos.base.query.v1beta1.PageRequest
           * @instance
           */
          PageRequest.prototype.count_total = false;

          /**
           * Encodes the specified PageRequest message. Does not implicitly {@link cosmos.base.query.v1beta1.PageRequest.verify|verify} messages.
           * @function encode
           * @memberof cosmos.base.query.v1beta1.PageRequest
           * @static
           * @param {cosmos.base.query.v1beta1.IPageRequest} m PageRequest message or plain object to encode
           * @param {$protobuf.Writer} [w] Writer to encode to
           * @returns {$protobuf.Writer} Writer
           */
          PageRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.key != null && Object.hasOwnProperty.call(m, 'key'))
              w.uint32(10).bytes(m.key);
            if (m.offset != null && Object.hasOwnProperty.call(m, 'offset'))
              w.uint32(16).uint64(m.offset);
            if (m.limit != null && Object.hasOwnProperty.call(m, 'limit'))
              w.uint32(24).uint64(m.limit);
            if (
              m.count_total != null &&
              Object.hasOwnProperty.call(m, 'count_total')
            )
              w.uint32(32).bool(m.count_total);
            return w;
          };

          /**
           * Decodes a PageRequest message from the specified reader or buffer.
           * @function decode
           * @memberof cosmos.base.query.v1beta1.PageRequest
           * @static
           * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
           * @param {number} [l] Message length if known beforehand
           * @returns {cosmos.base.query.v1beta1.PageRequest} PageRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          PageRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.base.query.v1beta1.PageRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.key = r.bytes();
                  break;
                case 2:
                  m.offset = r.uint64();
                  break;
                case 3:
                  m.limit = r.uint64();
                  break;
                case 4:
                  m.count_total = r.bool();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };

          return PageRequest;
        })();

        v1beta1.PageResponse = (function () {
          /**
           * Properties of a PageResponse.
           * @memberof cosmos.base.query.v1beta1
           * @interface IPageResponse
           * @property {Uint8Array|null} [next_key] PageResponse next_key
           * @property {Long|null} [total] PageResponse total
           */

          /**
           * Constructs a new PageResponse.
           * @memberof cosmos.base.query.v1beta1
           * @classdesc Represents a PageResponse.
           * @implements IPageResponse
           * @constructor
           * @param {cosmos.base.query.v1beta1.IPageResponse=} [p] Properties to set
           */
          function PageResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }

          /**
           * PageResponse next_key.
           * @member {Uint8Array} next_key
           * @memberof cosmos.base.query.v1beta1.PageResponse
           * @instance
           */
          PageResponse.prototype.next_key = $util.newBuffer([]);

          /**
           * PageResponse total.
           * @member {Long} total
           * @memberof cosmos.base.query.v1beta1.PageResponse
           * @instance
           */
          PageResponse.prototype.total = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;

          /**
           * Encodes the specified PageResponse message. Does not implicitly {@link cosmos.base.query.v1beta1.PageResponse.verify|verify} messages.
           * @function encode
           * @memberof cosmos.base.query.v1beta1.PageResponse
           * @static
           * @param {cosmos.base.query.v1beta1.IPageResponse} m PageResponse message or plain object to encode
           * @param {$protobuf.Writer} [w] Writer to encode to
           * @returns {$protobuf.Writer} Writer
           */
          PageResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.next_key != null && Object.hasOwnProperty.call(m, 'next_key'))
              w.uint32(10).bytes(m.next_key);
            if (m.total != null && Object.hasOwnProperty.call(m, 'total'))
              w.uint32(16).uint64(m.total);
            return w;
          };

          /**
           * Decodes a PageResponse message from the specified reader or buffer.
           * @function decode
           * @memberof cosmos.base.query.v1beta1.PageResponse
           * @static
           * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
           * @param {number} [l] Message length if known beforehand
           * @returns {cosmos.base.query.v1beta1.PageResponse} PageResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          PageResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.base.query.v1beta1.PageResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.next_key = r.bytes();
                  break;
                case 2:
                  m.total = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };

          return PageResponse;
        })();

        return v1beta1;
      })();

      return query;
    })();
    base.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Coin = (function () {
        function Coin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Coin.prototype.denom = '';
        Coin.prototype.amount = '';
        Coin.create = function create(properties) {
          return new Coin(properties);
        };
        Coin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, 'denom'))
            w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, 'amount'))
            w.uint32(18).string(m.amount);
          return w;
        };
        Coin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.Coin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.amount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Coin.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.Coin) return d;
          var m = new $root.cosmos.base.v1beta1.Coin();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.amount != null) {
            m.amount = String(d.amount);
          }
          return m;
        };
        Coin.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = '';
            d.amount = '';
          }
          if (m.denom != null && m.hasOwnProperty('denom')) {
            d.denom = m.denom;
          }
          if (m.amount != null && m.hasOwnProperty('amount')) {
            d.amount = m.amount;
          }
          return d;
        };
        Coin.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Coin;
      })();
      v1beta1.DecCoin = (function () {
        function DecCoin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DecCoin.prototype.denom = '';
        DecCoin.prototype.amount = '';
        DecCoin.create = function create(properties) {
          return new DecCoin(properties);
        };
        DecCoin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, 'denom'))
            w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, 'amount'))
            w.uint32(18).string(m.amount);
          return w;
        };
        DecCoin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.DecCoin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.amount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DecCoin.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.DecCoin) return d;
          var m = new $root.cosmos.base.v1beta1.DecCoin();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.amount != null) {
            m.amount = String(d.amount);
          }
          return m;
        };
        DecCoin.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = '';
            d.amount = '';
          }
          if (m.denom != null && m.hasOwnProperty('denom')) {
            d.denom = m.denom;
          }
          if (m.amount != null && m.hasOwnProperty('amount')) {
            d.amount = m.amount;
          }
          return d;
        };
        DecCoin.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DecCoin;
      })();
      v1beta1.IntProto = (function () {
        function IntProto(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        IntProto.prototype.int = '';
        IntProto.create = function create(properties) {
          return new IntProto(properties);
        };
        IntProto.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.int != null && Object.hasOwnProperty.call(m, 'int'))
            w.uint32(10).string(m.int);
          return w;
        };
        IntProto.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.IntProto();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.int = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        IntProto.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.IntProto) return d;
          var m = new $root.cosmos.base.v1beta1.IntProto();
          if (d.int != null) {
            m.int = String(d.int);
          }
          return m;
        };
        IntProto.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.int = '';
          }
          if (m.int != null && m.hasOwnProperty('int')) {
            d.int = m.int;
          }
          return d;
        };
        IntProto.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return IntProto;
      })();
      v1beta1.DecProto = (function () {
        function DecProto(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DecProto.prototype.dec = '';
        DecProto.create = function create(properties) {
          return new DecProto(properties);
        };
        DecProto.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.dec != null && Object.hasOwnProperty.call(m, 'dec'))
            w.uint32(10).string(m.dec);
          return w;
        };
        DecProto.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.DecProto();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.dec = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DecProto.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.DecProto) return d;
          var m = new $root.cosmos.base.v1beta1.DecProto();
          if (d.dec != null) {
            m.dec = String(d.dec);
          }
          return m;
        };
        DecProto.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.dec = '';
          }
          if (m.dec != null && m.hasOwnProperty('dec')) {
            d.dec = m.dec;
          }
          return d;
        };
        DecProto.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DecProto;
      })();
      return v1beta1;
    })();
    base.abci = (function () {
      const abci = {};
      abci.v1beta1 = (function () {
        const v1beta1 = {};
        v1beta1.MsgData = (function () {
          function MsgData(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgData.prototype.msgType = '';
          MsgData.prototype.data = $util.newBuffer([]);
          MsgData.create = function create(properties) {
            return new MsgData(properties);
          };
          MsgData.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.msgType != null && Object.hasOwnProperty.call(m, 'msgType'))
              w.uint32(10).string(m.msgType);
            if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
              w.uint32(18).bytes(m.data);
            return w;
          };
          MsgData.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.base.abci.v1beta1.MsgData();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.msgType = r.string();
                  break;
                case 2:
                  m.data = r.bytes();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgData.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.base.abci.v1beta1.MsgData) return d;
            var m = new $root.cosmos.base.abci.v1beta1.MsgData();
            if (d.msgType != null) {
              m.msgType = String(d.msgType);
            }
            if (d.data != null) {
              if (typeof d.data === 'string')
                $util.base64.decode(
                  d.data,
                  (m.data = $util.newBuffer($util.base64.length(d.data))),
                  0
                );
              else if (d.data.length) m.data = d.data;
            }
            return m;
          };
          MsgData.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.msgType = '';
              if (o.bytes === String) d.data = '';
              else {
                d.data = [];
                if (o.bytes !== Array) d.data = $util.newBuffer(d.data);
              }
            }
            if (m.msgType != null && m.hasOwnProperty('msgType')) {
              d.msgType = m.msgType;
            }
            if (m.data != null && m.hasOwnProperty('data')) {
              d.data =
                o.bytes === String
                  ? $util.base64.encode(m.data, 0, m.data.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.data)
                  : m.data;
            }
            return d;
          };
          MsgData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgData;
        })();
        v1beta1.TxMsgData = (function () {
          function TxMsgData(p) {
            this.data = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          TxMsgData.prototype.data = $util.emptyArray;
          TxMsgData.create = function create(properties) {
            return new TxMsgData(properties);
          };
          TxMsgData.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.data != null && m.data.length) {
              for (var i = 0; i < m.data.length; ++i)
                $root.cosmos.base.abci.v1beta1.MsgData.encode(
                  m.data[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            return w;
          };
          TxMsgData.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.base.abci.v1beta1.TxMsgData();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.data && m.data.length)) m.data = [];
                  m.data.push(
                    $root.cosmos.base.abci.v1beta1.MsgData.decode(r, r.uint32())
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          TxMsgData.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.base.abci.v1beta1.TxMsgData) return d;
            var m = new $root.cosmos.base.abci.v1beta1.TxMsgData();
            if (d.data) {
              if (!Array.isArray(d.data))
                throw TypeError(
                  '.cosmos.base.abci.v1beta1.TxMsgData.data: array expected'
                );
              m.data = [];
              for (var i = 0; i < d.data.length; ++i) {
                if (typeof d.data[i] !== 'object')
                  throw TypeError(
                    '.cosmos.base.abci.v1beta1.TxMsgData.data: object expected'
                  );
                m.data[i] = $root.cosmos.base.abci.v1beta1.MsgData.fromObject(
                  d.data[i]
                );
              }
            }
            return m;
          };
          TxMsgData.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.data = [];
            }
            if (m.data && m.data.length) {
              d.data = [];
              for (var j = 0; j < m.data.length; ++j) {
                d.data[j] = $root.cosmos.base.abci.v1beta1.MsgData.toObject(
                  m.data[j],
                  o
                );
              }
            }
            return d;
          };
          TxMsgData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return TxMsgData;
        })();
        return v1beta1;
      })();
      return abci;
    })();
    return base;
  })();
  cosmos.crypto = (function () {
    const crypto = {};
    crypto.multisig = (function () {
      const multisig = {};
      multisig.v1beta1 = (function () {
        const v1beta1 = {};
        v1beta1.MultiSignature = (function () {
          function MultiSignature(p) {
            this.signatures = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MultiSignature.prototype.signatures = $util.emptyArray;
          MultiSignature.create = function create(properties) {
            return new MultiSignature(properties);
          };
          MultiSignature.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.signatures != null && m.signatures.length) {
              for (var i = 0; i < m.signatures.length; ++i)
                w.uint32(10).bytes(m.signatures[i]);
            }
            return w;
          };
          MultiSignature.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.crypto.multisig.v1beta1.MultiSignature();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.signatures && m.signatures.length)) m.signatures = [];
                  m.signatures.push(r.bytes());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MultiSignature.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.crypto.multisig.v1beta1.MultiSignature
            )
              return d;
            var m = new $root.cosmos.crypto.multisig.v1beta1.MultiSignature();
            if (d.signatures) {
              if (!Array.isArray(d.signatures))
                throw TypeError(
                  '.cosmos.crypto.multisig.v1beta1.MultiSignature.signatures: array expected'
                );
              m.signatures = [];
              for (var i = 0; i < d.signatures.length; ++i) {
                if (typeof d.signatures[i] === 'string')
                  $util.base64.decode(
                    d.signatures[i],
                    (m.signatures[i] = $util.newBuffer(
                      $util.base64.length(d.signatures[i])
                    )),
                    0
                  );
                else if (d.signatures[i].length)
                  m.signatures[i] = d.signatures[i];
              }
            }
            return m;
          };
          MultiSignature.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.signatures = [];
            }
            if (m.signatures && m.signatures.length) {
              d.signatures = [];
              for (var j = 0; j < m.signatures.length; ++j) {
                d.signatures[j] =
                  o.bytes === String
                    ? $util.base64.encode(
                        m.signatures[j],
                        0,
                        m.signatures[j].length
                      )
                    : o.bytes === Array
                    ? Array.prototype.slice.call(m.signatures[j])
                    : m.signatures[j];
              }
            }
            return d;
          };
          MultiSignature.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MultiSignature;
        })();
        v1beta1.CompactBitArray = (function () {
          function CompactBitArray(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          CompactBitArray.prototype.extraBitsStored = 0;
          CompactBitArray.prototype.elems = $util.newBuffer([]);
          CompactBitArray.create = function create(properties) {
            return new CompactBitArray(properties);
          };
          CompactBitArray.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.extraBitsStored != null &&
              Object.hasOwnProperty.call(m, 'extraBitsStored')
            )
              w.uint32(8).uint32(m.extraBitsStored);
            if (m.elems != null && Object.hasOwnProperty.call(m, 'elems'))
              w.uint32(18).bytes(m.elems);
            return w;
          };
          CompactBitArray.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.crypto.multisig.v1beta1.CompactBitArray();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.extraBitsStored = r.uint32();
                  break;
                case 2:
                  m.elems = r.bytes();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          CompactBitArray.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.crypto.multisig.v1beta1.CompactBitArray
            )
              return d;
            var m = new $root.cosmos.crypto.multisig.v1beta1.CompactBitArray();
            if (d.extraBitsStored != null) {
              m.extraBitsStored = d.extraBitsStored >>> 0;
            }
            if (d.elems != null) {
              if (typeof d.elems === 'string')
                $util.base64.decode(
                  d.elems,
                  (m.elems = $util.newBuffer($util.base64.length(d.elems))),
                  0
                );
              else if (d.elems.length) m.elems = d.elems;
            }
            return m;
          };
          CompactBitArray.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.extraBitsStored = 0;
              if (o.bytes === String) d.elems = '';
              else {
                d.elems = [];
                if (o.bytes !== Array) d.elems = $util.newBuffer(d.elems);
              }
            }
            if (
              m.extraBitsStored != null &&
              m.hasOwnProperty('extraBitsStored')
            ) {
              d.extraBitsStored = m.extraBitsStored;
            }
            if (m.elems != null && m.hasOwnProperty('elems')) {
              d.elems =
                o.bytes === String
                  ? $util.base64.encode(m.elems, 0, m.elems.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.elems)
                  : m.elems;
            }
            return d;
          };
          CompactBitArray.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return CompactBitArray;
        })();
        return v1beta1;
      })();
      return multisig;
    })();
    crypto.secp256k1 = (function () {
      const secp256k1 = {};
      secp256k1.PubKey = (function () {
        function PubKey(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        PubKey.prototype.key = $util.newBuffer([]);
        PubKey.create = function create(properties) {
          return new PubKey(properties);
        };
        PubKey.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.key != null && Object.hasOwnProperty.call(m, 'key'))
            w.uint32(10).bytes(m.key);
          return w;
        };
        PubKey.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.crypto.secp256k1.PubKey();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.key = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        PubKey.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.crypto.secp256k1.PubKey) return d;
          var m = new $root.cosmos.crypto.secp256k1.PubKey();
          if (d.key != null) {
            if (typeof d.key === 'string')
              $util.base64.decode(
                d.key,
                (m.key = $util.newBuffer($util.base64.length(d.key))),
                0
              );
            else if (d.key.length) m.key = d.key;
          }
          return m;
        };
        PubKey.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if (o.bytes === String) d.key = '';
            else {
              d.key = [];
              if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
            }
          }
          if (m.key != null && m.hasOwnProperty('key')) {
            d.key =
              o.bytes === String
                ? $util.base64.encode(m.key, 0, m.key.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.key)
                : m.key;
          }
          return d;
        };
        PubKey.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return PubKey;
      })();
      secp256k1.PrivKey = (function () {
        function PrivKey(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        PrivKey.prototype.key = $util.newBuffer([]);
        PrivKey.create = function create(properties) {
          return new PrivKey(properties);
        };
        PrivKey.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.key != null && Object.hasOwnProperty.call(m, 'key'))
            w.uint32(10).bytes(m.key);
          return w;
        };
        PrivKey.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.crypto.secp256k1.PrivKey();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.key = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        PrivKey.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.crypto.secp256k1.PrivKey) return d;
          var m = new $root.cosmos.crypto.secp256k1.PrivKey();
          if (d.key != null) {
            if (typeof d.key === 'string')
              $util.base64.decode(
                d.key,
                (m.key = $util.newBuffer($util.base64.length(d.key))),
                0
              );
            else if (d.key.length) m.key = d.key;
          }
          return m;
        };
        PrivKey.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if (o.bytes === String) d.key = '';
            else {
              d.key = [];
              if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
            }
          }
          if (m.key != null && m.hasOwnProperty('key')) {
            d.key =
              o.bytes === String
                ? $util.base64.encode(m.key, 0, m.key.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.key)
                : m.key;
          }
          return d;
        };
        PrivKey.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return PrivKey;
      })();
      return secp256k1;
    })();
    return crypto;
  })();
  cosmos.tx = (function () {
    const tx = {};
    tx.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Tx = (function () {
        function Tx(p) {
          this.signatures = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Tx.prototype.body = null;
        Tx.prototype.authInfo = null;
        Tx.prototype.signatures = $util.emptyArray;
        Tx.create = function create(properties) {
          return new Tx(properties);
        };
        Tx.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.body != null && Object.hasOwnProperty.call(m, 'body'))
            $root.cosmos.tx.v1beta1.TxBody.encode(
              m.body,
              w.uint32(10).fork()
            ).ldelim();
          if (m.authInfo != null && Object.hasOwnProperty.call(m, 'authInfo'))
            $root.cosmos.tx.v1beta1.AuthInfo.encode(
              m.authInfo,
              w.uint32(18).fork()
            ).ldelim();
          if (m.signatures != null && m.signatures.length) {
            for (var i = 0; i < m.signatures.length; ++i)
              w.uint32(26).bytes(m.signatures[i]);
          }
          return w;
        };
        Tx.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.Tx();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.body = $root.cosmos.tx.v1beta1.TxBody.decode(r, r.uint32());
                break;
              case 2:
                m.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                if (!(m.signatures && m.signatures.length)) m.signatures = [];
                m.signatures.push(r.bytes());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Tx.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.Tx) return d;
          var m = new $root.cosmos.tx.v1beta1.Tx();
          if (d.body != null) {
            if (typeof d.body !== 'object')
              throw TypeError('.cosmos.tx.v1beta1.Tx.body: object expected');
            m.body = $root.cosmos.tx.v1beta1.TxBody.fromObject(d.body);
          }
          if (d.authInfo != null) {
            if (typeof d.authInfo !== 'object')
              throw TypeError(
                '.cosmos.tx.v1beta1.Tx.authInfo: object expected'
              );
            m.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.fromObject(
              d.authInfo
            );
          }
          if (d.signatures) {
            if (!Array.isArray(d.signatures))
              throw TypeError(
                '.cosmos.tx.v1beta1.Tx.signatures: array expected'
              );
            m.signatures = [];
            for (var i = 0; i < d.signatures.length; ++i) {
              if (typeof d.signatures[i] === 'string')
                $util.base64.decode(
                  d.signatures[i],
                  (m.signatures[i] = $util.newBuffer(
                    $util.base64.length(d.signatures[i])
                  )),
                  0
                );
              else if (d.signatures[i].length)
                m.signatures[i] = d.signatures[i];
            }
          }
          return m;
        };
        Tx.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.signatures = [];
          }
          if (o.defaults) {
            d.body = null;
            d.authInfo = null;
          }
          if (m.body != null && m.hasOwnProperty('body')) {
            d.body = $root.cosmos.tx.v1beta1.TxBody.toObject(m.body, o);
          }
          if (m.authInfo != null && m.hasOwnProperty('authInfo')) {
            d.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.toObject(
              m.authInfo,
              o
            );
          }
          if (m.signatures && m.signatures.length) {
            d.signatures = [];
            for (var j = 0; j < m.signatures.length; ++j) {
              d.signatures[j] =
                o.bytes === String
                  ? $util.base64.encode(
                      m.signatures[j],
                      0,
                      m.signatures[j].length
                    )
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.signatures[j])
                  : m.signatures[j];
            }
          }
          return d;
        };
        Tx.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Tx;
      })();
      v1beta1.TxRaw = (function () {
        function TxRaw(p) {
          this.signatures = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        TxRaw.prototype.bodyBytes = $util.newBuffer([]);
        TxRaw.prototype.authInfoBytes = $util.newBuffer([]);
        TxRaw.prototype.signatures = $util.emptyArray;
        TxRaw.create = function create(properties) {
          return new TxRaw(properties);
        };
        TxRaw.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.bodyBytes != null && Object.hasOwnProperty.call(m, 'bodyBytes'))
            w.uint32(10).bytes(m.bodyBytes);
          if (
            m.authInfoBytes != null &&
            Object.hasOwnProperty.call(m, 'authInfoBytes')
          )
            w.uint32(18).bytes(m.authInfoBytes);
          if (m.signatures != null && m.signatures.length) {
            for (var i = 0; i < m.signatures.length; ++i)
              w.uint32(26).bytes(m.signatures[i]);
          }
          return w;
        };
        TxRaw.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.TxRaw();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.bodyBytes = r.bytes();
                break;
              case 2:
                m.authInfoBytes = r.bytes();
                break;
              case 3:
                if (!(m.signatures && m.signatures.length)) m.signatures = [];
                m.signatures.push(r.bytes());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        TxRaw.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.TxRaw) return d;
          var m = new $root.cosmos.tx.v1beta1.TxRaw();
          if (d.bodyBytes != null) {
            if (typeof d.bodyBytes === 'string')
              $util.base64.decode(
                d.bodyBytes,
                (m.bodyBytes = $util.newBuffer(
                  $util.base64.length(d.bodyBytes)
                )),
                0
              );
            else if (d.bodyBytes.length) m.bodyBytes = d.bodyBytes;
          }
          if (d.authInfoBytes != null) {
            if (typeof d.authInfoBytes === 'string')
              $util.base64.decode(
                d.authInfoBytes,
                (m.authInfoBytes = $util.newBuffer(
                  $util.base64.length(d.authInfoBytes)
                )),
                0
              );
            else if (d.authInfoBytes.length) m.authInfoBytes = d.authInfoBytes;
          }
          if (d.signatures) {
            if (!Array.isArray(d.signatures))
              throw TypeError(
                '.cosmos.tx.v1beta1.TxRaw.signatures: array expected'
              );
            m.signatures = [];
            for (var i = 0; i < d.signatures.length; ++i) {
              if (typeof d.signatures[i] === 'string')
                $util.base64.decode(
                  d.signatures[i],
                  (m.signatures[i] = $util.newBuffer(
                    $util.base64.length(d.signatures[i])
                  )),
                  0
                );
              else if (d.signatures[i].length)
                m.signatures[i] = d.signatures[i];
            }
          }
          return m;
        };
        TxRaw.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.signatures = [];
          }
          if (o.defaults) {
            if (o.bytes === String) d.bodyBytes = '';
            else {
              d.bodyBytes = [];
              if (o.bytes !== Array) d.bodyBytes = $util.newBuffer(d.bodyBytes);
            }
            if (o.bytes === String) d.authInfoBytes = '';
            else {
              d.authInfoBytes = [];
              if (o.bytes !== Array)
                d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
            }
          }
          if (m.bodyBytes != null && m.hasOwnProperty('bodyBytes')) {
            d.bodyBytes =
              o.bytes === String
                ? $util.base64.encode(m.bodyBytes, 0, m.bodyBytes.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.bodyBytes)
                : m.bodyBytes;
          }
          if (m.authInfoBytes != null && m.hasOwnProperty('authInfoBytes')) {
            d.authInfoBytes =
              o.bytes === String
                ? $util.base64.encode(
                    m.authInfoBytes,
                    0,
                    m.authInfoBytes.length
                  )
                : o.bytes === Array
                ? Array.prototype.slice.call(m.authInfoBytes)
                : m.authInfoBytes;
          }
          if (m.signatures && m.signatures.length) {
            d.signatures = [];
            for (var j = 0; j < m.signatures.length; ++j) {
              d.signatures[j] =
                o.bytes === String
                  ? $util.base64.encode(
                      m.signatures[j],
                      0,
                      m.signatures[j].length
                    )
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.signatures[j])
                  : m.signatures[j];
            }
          }
          return d;
        };
        TxRaw.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return TxRaw;
      })();
      v1beta1.SignDoc = (function () {
        function SignDoc(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SignDoc.prototype.bodyBytes = $util.newBuffer([]);
        SignDoc.prototype.authInfoBytes = $util.newBuffer([]);
        SignDoc.prototype.chainId = '';
        SignDoc.prototype.accountNumber = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        SignDoc.create = function create(properties) {
          return new SignDoc(properties);
        };
        SignDoc.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.bodyBytes != null && Object.hasOwnProperty.call(m, 'bodyBytes'))
            w.uint32(10).bytes(m.bodyBytes);
          if (
            m.authInfoBytes != null &&
            Object.hasOwnProperty.call(m, 'authInfoBytes')
          )
            w.uint32(18).bytes(m.authInfoBytes);
          if (m.chainId != null && Object.hasOwnProperty.call(m, 'chainId'))
            w.uint32(26).string(m.chainId);
          if (
            m.accountNumber != null &&
            Object.hasOwnProperty.call(m, 'accountNumber')
          )
            w.uint32(32).uint64(m.accountNumber);
          return w;
        };
        SignDoc.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.SignDoc();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.bodyBytes = r.bytes();
                break;
              case 2:
                m.authInfoBytes = r.bytes();
                break;
              case 3:
                m.chainId = r.string();
                break;
              case 4:
                m.accountNumber = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SignDoc.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.SignDoc) return d;
          var m = new $root.cosmos.tx.v1beta1.SignDoc();
          if (d.bodyBytes != null) {
            if (typeof d.bodyBytes === 'string')
              $util.base64.decode(
                d.bodyBytes,
                (m.bodyBytes = $util.newBuffer(
                  $util.base64.length(d.bodyBytes)
                )),
                0
              );
            else if (d.bodyBytes.length) m.bodyBytes = d.bodyBytes;
          }
          if (d.authInfoBytes != null) {
            if (typeof d.authInfoBytes === 'string')
              $util.base64.decode(
                d.authInfoBytes,
                (m.authInfoBytes = $util.newBuffer(
                  $util.base64.length(d.authInfoBytes)
                )),
                0
              );
            else if (d.authInfoBytes.length) m.authInfoBytes = d.authInfoBytes;
          }
          if (d.chainId != null) {
            m.chainId = String(d.chainId);
          }
          if (d.accountNumber != null) {
            if ($util.Long)
              (m.accountNumber = $util.Long.fromValue(
                d.accountNumber
              )).unsigned = true;
            else if (typeof d.accountNumber === 'string')
              m.accountNumber = parseInt(d.accountNumber, 10);
            else if (typeof d.accountNumber === 'number')
              m.accountNumber = d.accountNumber;
            else if (typeof d.accountNumber === 'object')
              m.accountNumber = new $util.LongBits(
                d.accountNumber.low >>> 0,
                d.accountNumber.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        SignDoc.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if (o.bytes === String) d.bodyBytes = '';
            else {
              d.bodyBytes = [];
              if (o.bytes !== Array) d.bodyBytes = $util.newBuffer(d.bodyBytes);
            }
            if (o.bytes === String) d.authInfoBytes = '';
            else {
              d.authInfoBytes = [];
              if (o.bytes !== Array)
                d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
            }
            d.chainId = '';
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.accountNumber =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.accountNumber = o.longs === String ? '0' : 0;
          }
          if (m.bodyBytes != null && m.hasOwnProperty('bodyBytes')) {
            d.bodyBytes =
              o.bytes === String
                ? $util.base64.encode(m.bodyBytes, 0, m.bodyBytes.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.bodyBytes)
                : m.bodyBytes;
          }
          if (m.authInfoBytes != null && m.hasOwnProperty('authInfoBytes')) {
            d.authInfoBytes =
              o.bytes === String
                ? $util.base64.encode(
                    m.authInfoBytes,
                    0,
                    m.authInfoBytes.length
                  )
                : o.bytes === Array
                ? Array.prototype.slice.call(m.authInfoBytes)
                : m.authInfoBytes;
          }
          if (m.chainId != null && m.hasOwnProperty('chainId')) {
            d.chainId = m.chainId;
          }
          if (m.accountNumber != null && m.hasOwnProperty('accountNumber')) {
            if (typeof m.accountNumber === 'number')
              d.accountNumber =
                o.longs === String ? String(m.accountNumber) : m.accountNumber;
            else
              d.accountNumber =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.accountNumber)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.accountNumber.low >>> 0,
                      m.accountNumber.high >>> 0
                    ).toNumber(true)
                  : m.accountNumber;
          }
          return d;
        };
        SignDoc.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SignDoc;
      })();
      v1beta1.TxBody = (function () {
        function TxBody(p) {
          this.messages = [];
          this.extensionOptions = [];
          this.nonCriticalExtensionOptions = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        TxBody.prototype.messages = $util.emptyArray;
        TxBody.prototype.memo = '';
        TxBody.prototype.timeoutHeight = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        TxBody.prototype.extensionOptions = $util.emptyArray;
        TxBody.prototype.nonCriticalExtensionOptions = $util.emptyArray;
        TxBody.create = function create(properties) {
          return new TxBody(properties);
        };
        TxBody.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.messages != null && m.messages.length) {
            for (var i = 0; i < m.messages.length; ++i)
              $root.google.protobuf.Any.encode(
                m.messages[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.memo != null && Object.hasOwnProperty.call(m, 'memo'))
            w.uint32(18).string(m.memo);
          if (
            m.timeoutHeight != null &&
            Object.hasOwnProperty.call(m, 'timeoutHeight')
          )
            w.uint32(24).uint64(m.timeoutHeight);
          if (m.extensionOptions != null && m.extensionOptions.length) {
            for (var i = 0; i < m.extensionOptions.length; ++i)
              $root.google.protobuf.Any.encode(
                m.extensionOptions[i],
                w.uint32(8186).fork()
              ).ldelim();
          }
          if (
            m.nonCriticalExtensionOptions != null &&
            m.nonCriticalExtensionOptions.length
          ) {
            for (var i = 0; i < m.nonCriticalExtensionOptions.length; ++i)
              $root.google.protobuf.Any.encode(
                m.nonCriticalExtensionOptions[i],
                w.uint32(16378).fork()
              ).ldelim();
          }
          return w;
        };
        TxBody.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.TxBody();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.messages && m.messages.length)) m.messages = [];
                m.messages.push(
                  $root.google.protobuf.Any.decode(r, r.uint32())
                );
                break;
              case 2:
                m.memo = r.string();
                break;
              case 3:
                m.timeoutHeight = r.uint64();
                break;
              case 1023:
                if (!(m.extensionOptions && m.extensionOptions.length))
                  m.extensionOptions = [];
                m.extensionOptions.push(
                  $root.google.protobuf.Any.decode(r, r.uint32())
                );
                break;
              case 2047:
                if (
                  !(
                    m.nonCriticalExtensionOptions &&
                    m.nonCriticalExtensionOptions.length
                  )
                )
                  m.nonCriticalExtensionOptions = [];
                m.nonCriticalExtensionOptions.push(
                  $root.google.protobuf.Any.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        TxBody.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.TxBody) return d;
          var m = new $root.cosmos.tx.v1beta1.TxBody();
          if (d.messages) {
            if (!Array.isArray(d.messages))
              throw TypeError(
                '.cosmos.tx.v1beta1.TxBody.messages: array expected'
              );
            m.messages = [];
            for (var i = 0; i < d.messages.length; ++i) {
              if (typeof d.messages[i] !== 'object')
                throw TypeError(
                  '.cosmos.tx.v1beta1.TxBody.messages: object expected'
                );
              m.messages[i] = $root.google.protobuf.Any.fromObject(
                d.messages[i]
              );
            }
          }
          if (d.memo != null) {
            m.memo = String(d.memo);
          }
          if (d.timeoutHeight != null) {
            if ($util.Long)
              (m.timeoutHeight = $util.Long.fromValue(
                d.timeoutHeight
              )).unsigned = true;
            else if (typeof d.timeoutHeight === 'string')
              m.timeoutHeight = parseInt(d.timeoutHeight, 10);
            else if (typeof d.timeoutHeight === 'number')
              m.timeoutHeight = d.timeoutHeight;
            else if (typeof d.timeoutHeight === 'object')
              m.timeoutHeight = new $util.LongBits(
                d.timeoutHeight.low >>> 0,
                d.timeoutHeight.high >>> 0
              ).toNumber(true);
          }
          if (d.extensionOptions) {
            if (!Array.isArray(d.extensionOptions))
              throw TypeError(
                '.cosmos.tx.v1beta1.TxBody.extensionOptions: array expected'
              );
            m.extensionOptions = [];
            for (var i = 0; i < d.extensionOptions.length; ++i) {
              if (typeof d.extensionOptions[i] !== 'object')
                throw TypeError(
                  '.cosmos.tx.v1beta1.TxBody.extensionOptions: object expected'
                );
              m.extensionOptions[i] = $root.google.protobuf.Any.fromObject(
                d.extensionOptions[i]
              );
            }
          }
          if (d.nonCriticalExtensionOptions) {
            if (!Array.isArray(d.nonCriticalExtensionOptions))
              throw TypeError(
                '.cosmos.tx.v1beta1.TxBody.nonCriticalExtensionOptions: array expected'
              );
            m.nonCriticalExtensionOptions = [];
            for (var i = 0; i < d.nonCriticalExtensionOptions.length; ++i) {
              if (typeof d.nonCriticalExtensionOptions[i] !== 'object')
                throw TypeError(
                  '.cosmos.tx.v1beta1.TxBody.nonCriticalExtensionOptions: object expected'
                );
              m.nonCriticalExtensionOptions[
                i
              ] = $root.google.protobuf.Any.fromObject(
                d.nonCriticalExtensionOptions[i]
              );
            }
          }
          return m;
        };
        TxBody.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.messages = [];
            d.extensionOptions = [];
            d.nonCriticalExtensionOptions = [];
          }
          if (o.defaults) {
            d.memo = '';
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.timeoutHeight =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.timeoutHeight = o.longs === String ? '0' : 0;
          }
          if (m.messages && m.messages.length) {
            d.messages = [];
            for (var j = 0; j < m.messages.length; ++j) {
              d.messages[j] = $root.google.protobuf.Any.toObject(
                m.messages[j],
                o
              );
            }
          }
          if (m.memo != null && m.hasOwnProperty('memo')) {
            d.memo = m.memo;
          }
          if (m.timeoutHeight != null && m.hasOwnProperty('timeoutHeight')) {
            if (typeof m.timeoutHeight === 'number')
              d.timeoutHeight =
                o.longs === String ? String(m.timeoutHeight) : m.timeoutHeight;
            else
              d.timeoutHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.timeoutHeight)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.timeoutHeight.low >>> 0,
                      m.timeoutHeight.high >>> 0
                    ).toNumber(true)
                  : m.timeoutHeight;
          }
          if (m.extensionOptions && m.extensionOptions.length) {
            d.extensionOptions = [];
            for (var j = 0; j < m.extensionOptions.length; ++j) {
              d.extensionOptions[j] = $root.google.protobuf.Any.toObject(
                m.extensionOptions[j],
                o
              );
            }
          }
          if (
            m.nonCriticalExtensionOptions &&
            m.nonCriticalExtensionOptions.length
          ) {
            d.nonCriticalExtensionOptions = [];
            for (var j = 0; j < m.nonCriticalExtensionOptions.length; ++j) {
              d.nonCriticalExtensionOptions[
                j
              ] = $root.google.protobuf.Any.toObject(
                m.nonCriticalExtensionOptions[j],
                o
              );
            }
          }
          return d;
        };
        TxBody.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return TxBody;
      })();
      v1beta1.AuthInfo = (function () {
        function AuthInfo(p) {
          this.signerInfos = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        AuthInfo.prototype.signerInfos = $util.emptyArray;
        AuthInfo.prototype.fee = null;
        AuthInfo.create = function create(properties) {
          return new AuthInfo(properties);
        };
        AuthInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.signerInfos != null && m.signerInfos.length) {
            for (var i = 0; i < m.signerInfos.length; ++i)
              $root.cosmos.tx.v1beta1.SignerInfo.encode(
                m.signerInfos[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.fee != null && Object.hasOwnProperty.call(m, 'fee'))
            $root.cosmos.tx.v1beta1.Fee.encode(
              m.fee,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        AuthInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.AuthInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.signerInfos && m.signerInfos.length))
                  m.signerInfos = [];
                m.signerInfos.push(
                  $root.cosmos.tx.v1beta1.SignerInfo.decode(r, r.uint32())
                );
                break;
              case 2:
                m.fee = $root.cosmos.tx.v1beta1.Fee.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        AuthInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.AuthInfo) return d;
          var m = new $root.cosmos.tx.v1beta1.AuthInfo();
          if (d.signerInfos) {
            if (!Array.isArray(d.signerInfos))
              throw TypeError(
                '.cosmos.tx.v1beta1.AuthInfo.signerInfos: array expected'
              );
            m.signerInfos = [];
            for (var i = 0; i < d.signerInfos.length; ++i) {
              if (typeof d.signerInfos[i] !== 'object')
                throw TypeError(
                  '.cosmos.tx.v1beta1.AuthInfo.signerInfos: object expected'
                );
              m.signerInfos[i] = $root.cosmos.tx.v1beta1.SignerInfo.fromObject(
                d.signerInfos[i]
              );
            }
          }
          if (d.fee != null) {
            if (typeof d.fee !== 'object')
              throw TypeError(
                '.cosmos.tx.v1beta1.AuthInfo.fee: object expected'
              );
            m.fee = $root.cosmos.tx.v1beta1.Fee.fromObject(d.fee);
          }
          return m;
        };
        AuthInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.signerInfos = [];
          }
          if (o.defaults) {
            d.fee = null;
          }
          if (m.signerInfos && m.signerInfos.length) {
            d.signerInfos = [];
            for (var j = 0; j < m.signerInfos.length; ++j) {
              d.signerInfos[j] = $root.cosmos.tx.v1beta1.SignerInfo.toObject(
                m.signerInfos[j],
                o
              );
            }
          }
          if (m.fee != null && m.hasOwnProperty('fee')) {
            d.fee = $root.cosmos.tx.v1beta1.Fee.toObject(m.fee, o);
          }
          return d;
        };
        AuthInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return AuthInfo;
      })();
      v1beta1.SignerInfo = (function () {
        function SignerInfo(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SignerInfo.prototype.publicKey = null;
        SignerInfo.prototype.modeInfo = null;
        SignerInfo.prototype.sequence = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        SignerInfo.create = function create(properties) {
          return new SignerInfo(properties);
        };
        SignerInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.publicKey != null && Object.hasOwnProperty.call(m, 'publicKey'))
            $root.google.protobuf.Any.encode(
              m.publicKey,
              w.uint32(10).fork()
            ).ldelim();
          if (m.modeInfo != null && Object.hasOwnProperty.call(m, 'modeInfo'))
            $root.cosmos.tx.v1beta1.ModeInfo.encode(
              m.modeInfo,
              w.uint32(18).fork()
            ).ldelim();
          if (m.sequence != null && Object.hasOwnProperty.call(m, 'sequence'))
            w.uint32(24).uint64(m.sequence);
          return w;
        };
        SignerInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.SignerInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.publicKey = $root.google.protobuf.Any.decode(r, r.uint32());
                break;
              case 2:
                m.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                m.sequence = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SignerInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.SignerInfo) return d;
          var m = new $root.cosmos.tx.v1beta1.SignerInfo();
          if (d.publicKey != null) {
            if (typeof d.publicKey !== 'object')
              throw TypeError(
                '.cosmos.tx.v1beta1.SignerInfo.publicKey: object expected'
              );
            m.publicKey = $root.google.protobuf.Any.fromObject(d.publicKey);
          }
          if (d.modeInfo != null) {
            if (typeof d.modeInfo !== 'object')
              throw TypeError(
                '.cosmos.tx.v1beta1.SignerInfo.modeInfo: object expected'
              );
            m.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.fromObject(
              d.modeInfo
            );
          }
          if (d.sequence != null) {
            if ($util.Long)
              (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
            else if (typeof d.sequence === 'string')
              m.sequence = parseInt(d.sequence, 10);
            else if (typeof d.sequence === 'number') m.sequence = d.sequence;
            else if (typeof d.sequence === 'object')
              m.sequence = new $util.LongBits(
                d.sequence.low >>> 0,
                d.sequence.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        SignerInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.publicKey = null;
            d.modeInfo = null;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.sequence =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.sequence = o.longs === String ? '0' : 0;
          }
          if (m.publicKey != null && m.hasOwnProperty('publicKey')) {
            d.publicKey = $root.google.protobuf.Any.toObject(m.publicKey, o);
          }
          if (m.modeInfo != null && m.hasOwnProperty('modeInfo')) {
            d.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.toObject(
              m.modeInfo,
              o
            );
          }
          if (m.sequence != null && m.hasOwnProperty('sequence')) {
            if (typeof m.sequence === 'number')
              d.sequence = o.longs === String ? String(m.sequence) : m.sequence;
            else
              d.sequence =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.sequence)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.sequence.low >>> 0,
                      m.sequence.high >>> 0
                    ).toNumber(true)
                  : m.sequence;
          }
          return d;
        };
        SignerInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SignerInfo;
      })();
      v1beta1.ModeInfo = (function () {
        function ModeInfo(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        ModeInfo.prototype.single = null;
        ModeInfo.prototype.multi = null;
        let $oneOfFields;
        Object.defineProperty(ModeInfo.prototype, 'sum', {
          get: $util.oneOfGetter(($oneOfFields = ['single', 'multi'])),
          set: $util.oneOfSetter($oneOfFields)
        });
        ModeInfo.create = function create(properties) {
          return new ModeInfo(properties);
        };
        ModeInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.single != null && Object.hasOwnProperty.call(m, 'single'))
            $root.cosmos.tx.v1beta1.ModeInfo.Single.encode(
              m.single,
              w.uint32(10).fork()
            ).ldelim();
          if (m.multi != null && Object.hasOwnProperty.call(m, 'multi'))
            $root.cosmos.tx.v1beta1.ModeInfo.Multi.encode(
              m.multi,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        ModeInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.ModeInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        ModeInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo) return d;
          var m = new $root.cosmos.tx.v1beta1.ModeInfo();
          if (d.single != null) {
            if (typeof d.single !== 'object')
              throw TypeError(
                '.cosmos.tx.v1beta1.ModeInfo.single: object expected'
              );
            m.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.fromObject(
              d.single
            );
          }
          if (d.multi != null) {
            if (typeof d.multi !== 'object')
              throw TypeError(
                '.cosmos.tx.v1beta1.ModeInfo.multi: object expected'
              );
            m.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.fromObject(
              d.multi
            );
          }
          return m;
        };
        ModeInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (m.single != null && m.hasOwnProperty('single')) {
            d.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.toObject(
              m.single,
              o
            );
            if (o.oneofs) d.sum = 'single';
          }
          if (m.multi != null && m.hasOwnProperty('multi')) {
            d.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.toObject(
              m.multi,
              o
            );
            if (o.oneofs) d.sum = 'multi';
          }
          return d;
        };
        ModeInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ModeInfo.Single = (function () {
          function Single(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Single.prototype.mode = 0;
          Single.create = function create(properties) {
            return new Single(properties);
          };
          Single.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.mode != null && Object.hasOwnProperty.call(m, 'mode'))
              w.uint32(8).int32(m.mode);
            return w;
          };
          Single.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.v1beta1.ModeInfo.Single();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.mode = r.int32();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Single.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo.Single) return d;
            var m = new $root.cosmos.tx.v1beta1.ModeInfo.Single();
            switch (d.mode) {
              case 'SIGN_MODE_UNSPECIFIED':
              case 0:
                m.mode = 0;
                break;
              case 'SIGN_MODE_DIRECT':
              case 1:
                m.mode = 1;
                break;
              case 'SIGN_MODE_TEXTUAL':
              case 2:
                m.mode = 2;
                break;
              case 'SIGN_MODE_LEGACY_AMINO_JSON':
              case 127:
                m.mode = 127;
                break;
            }
            return m;
          };
          Single.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.mode = o.enums === String ? 'SIGN_MODE_UNSPECIFIED' : 0;
            }
            if (m.mode != null && m.hasOwnProperty('mode')) {
              d.mode =
                o.enums === String
                  ? $root.cosmos.tx.signing.v1beta1.SignMode[m.mode]
                  : m.mode;
            }
            return d;
          };
          Single.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Single;
        })();
        ModeInfo.Multi = (function () {
          function Multi(p) {
            this.modeInfos = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Multi.prototype.bitarray = null;
          Multi.prototype.modeInfos = $util.emptyArray;
          Multi.create = function create(properties) {
            return new Multi(properties);
          };
          Multi.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.bitarray != null && Object.hasOwnProperty.call(m, 'bitarray'))
              $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.encode(
                m.bitarray,
                w.uint32(10).fork()
              ).ldelim();
            if (m.modeInfos != null && m.modeInfos.length) {
              for (var i = 0; i < m.modeInfos.length; ++i)
                $root.cosmos.tx.v1beta1.ModeInfo.encode(
                  m.modeInfos[i],
                  w.uint32(18).fork()
                ).ldelim();
            }
            return w;
          };
          Multi.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.v1beta1.ModeInfo.Multi();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  if (!(m.modeInfos && m.modeInfos.length)) m.modeInfos = [];
                  m.modeInfos.push(
                    $root.cosmos.tx.v1beta1.ModeInfo.decode(r, r.uint32())
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Multi.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo.Multi) return d;
            var m = new $root.cosmos.tx.v1beta1.ModeInfo.Multi();
            if (d.bitarray != null) {
              if (typeof d.bitarray !== 'object')
                throw TypeError(
                  '.cosmos.tx.v1beta1.ModeInfo.Multi.bitarray: object expected'
                );
              m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject(
                d.bitarray
              );
            }
            if (d.modeInfos) {
              if (!Array.isArray(d.modeInfos))
                throw TypeError(
                  '.cosmos.tx.v1beta1.ModeInfo.Multi.modeInfos: array expected'
                );
              m.modeInfos = [];
              for (var i = 0; i < d.modeInfos.length; ++i) {
                if (typeof d.modeInfos[i] !== 'object')
                  throw TypeError(
                    '.cosmos.tx.v1beta1.ModeInfo.Multi.modeInfos: object expected'
                  );
                m.modeInfos[i] = $root.cosmos.tx.v1beta1.ModeInfo.fromObject(
                  d.modeInfos[i]
                );
              }
            }
            return m;
          };
          Multi.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.modeInfos = [];
            }
            if (o.defaults) {
              d.bitarray = null;
            }
            if (m.bitarray != null && m.hasOwnProperty('bitarray')) {
              d.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.toObject(
                m.bitarray,
                o
              );
            }
            if (m.modeInfos && m.modeInfos.length) {
              d.modeInfos = [];
              for (var j = 0; j < m.modeInfos.length; ++j) {
                d.modeInfos[j] = $root.cosmos.tx.v1beta1.ModeInfo.toObject(
                  m.modeInfos[j],
                  o
                );
              }
            }
            return d;
          };
          Multi.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Multi;
        })();
        return ModeInfo;
      })();
      v1beta1.Fee = (function () {
        function Fee(p) {
          this.amount = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Fee.prototype.amount = $util.emptyArray;
        Fee.prototype.gasLimit = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Fee.prototype.payer = '';
        Fee.prototype.granter = '';
        Fee.create = function create(properties) {
          return new Fee(properties);
        };
        Fee.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.amount != null && m.amount.length) {
            for (var i = 0; i < m.amount.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.amount[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.gasLimit != null && Object.hasOwnProperty.call(m, 'gasLimit'))
            w.uint32(16).uint64(m.gasLimit);
          if (m.payer != null && Object.hasOwnProperty.call(m, 'payer'))
            w.uint32(26).string(m.payer);
          if (m.granter != null && Object.hasOwnProperty.call(m, 'granter'))
            w.uint32(34).string(m.granter);
          return w;
        };
        Fee.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.Fee();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.amount && m.amount.length)) m.amount = [];
                m.amount.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              case 2:
                m.gasLimit = r.uint64();
                break;
              case 3:
                m.payer = r.string();
                break;
              case 4:
                m.granter = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Fee.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.Fee) return d;
          var m = new $root.cosmos.tx.v1beta1.Fee();
          if (d.amount) {
            if (!Array.isArray(d.amount))
              throw TypeError('.cosmos.tx.v1beta1.Fee.amount: array expected');
            m.amount = [];
            for (var i = 0; i < d.amount.length; ++i) {
              if (typeof d.amount[i] !== 'object')
                throw TypeError(
                  '.cosmos.tx.v1beta1.Fee.amount: object expected'
                );
              m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.amount[i]
              );
            }
          }
          if (d.gasLimit != null) {
            if ($util.Long)
              (m.gasLimit = $util.Long.fromValue(d.gasLimit)).unsigned = true;
            else if (typeof d.gasLimit === 'string')
              m.gasLimit = parseInt(d.gasLimit, 10);
            else if (typeof d.gasLimit === 'number') m.gasLimit = d.gasLimit;
            else if (typeof d.gasLimit === 'object')
              m.gasLimit = new $util.LongBits(
                d.gasLimit.low >>> 0,
                d.gasLimit.high >>> 0
              ).toNumber(true);
          }
          if (d.payer != null) {
            m.payer = String(d.payer);
          }
          if (d.granter != null) {
            m.granter = String(d.granter);
          }
          return m;
        };
        Fee.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.amount = [];
          }
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.gasLimit =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.gasLimit = o.longs === String ? '0' : 0;
            d.payer = '';
            d.granter = '';
          }
          if (m.amount && m.amount.length) {
            d.amount = [];
            for (var j = 0; j < m.amount.length; ++j) {
              d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.amount[j],
                o
              );
            }
          }
          if (m.gasLimit != null && m.hasOwnProperty('gasLimit')) {
            if (typeof m.gasLimit === 'number')
              d.gasLimit = o.longs === String ? String(m.gasLimit) : m.gasLimit;
            else
              d.gasLimit =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.gasLimit)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.gasLimit.low >>> 0,
                      m.gasLimit.high >>> 0
                    ).toNumber(true)
                  : m.gasLimit;
          }
          if (m.payer != null && m.hasOwnProperty('payer')) {
            d.payer = m.payer;
          }
          if (m.granter != null && m.hasOwnProperty('granter')) {
            d.granter = m.granter;
          }
          return d;
        };
        Fee.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Fee;
      })();
      return v1beta1;
    })();
    tx.signing = (function () {
      const signing = {};
      signing.v1beta1 = (function () {
        const v1beta1 = {};
        v1beta1.SignMode = (function () {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = 'SIGN_MODE_UNSPECIFIED')] = 0;
          values[(valuesById[1] = 'SIGN_MODE_DIRECT')] = 1;
          values[(valuesById[2] = 'SIGN_MODE_TEXTUAL')] = 2;
          values[(valuesById[127] = 'SIGN_MODE_LEGACY_AMINO_JSON')] = 127;
          return values;
        })();
        v1beta1.SignatureDescriptors = (function () {
          function SignatureDescriptors(p) {
            this.signatures = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          SignatureDescriptors.prototype.signatures = $util.emptyArray;
          SignatureDescriptors.create = function create(properties) {
            return new SignatureDescriptors(properties);
          };
          SignatureDescriptors.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.signatures != null && m.signatures.length) {
              for (var i = 0; i < m.signatures.length; ++i)
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.encode(
                  m.signatures[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            return w;
          };
          SignatureDescriptors.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptors();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.signatures && m.signatures.length)) m.signatures = [];
                  m.signatures.push(
                    $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.decode(
                      r,
                      r.uint32()
                    )
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          SignatureDescriptors.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptors
            )
              return d;
            var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptors();
            if (d.signatures) {
              if (!Array.isArray(d.signatures))
                throw TypeError(
                  '.cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: array expected'
                );
              m.signatures = [];
              for (var i = 0; i < d.signatures.length; ++i) {
                if (typeof d.signatures[i] !== 'object')
                  throw TypeError(
                    '.cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: object expected'
                  );
                m.signatures[
                  i
                ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.fromObject(
                  d.signatures[i]
                );
              }
            }
            return m;
          };
          SignatureDescriptors.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.signatures = [];
            }
            if (m.signatures && m.signatures.length) {
              d.signatures = [];
              for (var j = 0; j < m.signatures.length; ++j) {
                d.signatures[
                  j
                ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.toObject(
                  m.signatures[j],
                  o
                );
              }
            }
            return d;
          };
          SignatureDescriptors.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return SignatureDescriptors;
        })();
        v1beta1.SignatureDescriptor = (function () {
          function SignatureDescriptor(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          SignatureDescriptor.prototype.publicKey = null;
          SignatureDescriptor.prototype.data = null;
          SignatureDescriptor.prototype.sequence = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          SignatureDescriptor.create = function create(properties) {
            return new SignatureDescriptor(properties);
          };
          SignatureDescriptor.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.publicKey != null &&
              Object.hasOwnProperty.call(m, 'publicKey')
            )
              $root.google.protobuf.Any.encode(
                m.publicKey,
                w.uint32(10).fork()
              ).ldelim();
            if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
              $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(
                m.data,
                w.uint32(18).fork()
              ).ldelim();
            if (m.sequence != null && Object.hasOwnProperty.call(m, 'sequence'))
              w.uint32(24).uint64(m.sequence);
            return w;
          };
          SignatureDescriptor.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.publicKey = $root.google.protobuf.Any.decode(r, r.uint32());
                  break;
                case 2:
                  m.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.sequence = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          SignatureDescriptor.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor
            )
              return d;
            var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor();
            if (d.publicKey != null) {
              if (typeof d.publicKey !== 'object')
                throw TypeError(
                  '.cosmos.tx.signing.v1beta1.SignatureDescriptor.publicKey: object expected'
                );
              m.publicKey = $root.google.protobuf.Any.fromObject(d.publicKey);
            }
            if (d.data != null) {
              if (typeof d.data !== 'object')
                throw TypeError(
                  '.cosmos.tx.signing.v1beta1.SignatureDescriptor.data: object expected'
                );
              m.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.fromObject(
                d.data
              );
            }
            if (d.sequence != null) {
              if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === 'string')
                m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === 'number') m.sequence = d.sequence;
              else if (typeof d.sequence === 'object')
                m.sequence = new $util.LongBits(
                  d.sequence.low >>> 0,
                  d.sequence.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          SignatureDescriptor.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.publicKey = null;
              d.data = null;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.sequence = o.longs === String ? '0' : 0;
            }
            if (m.publicKey != null && m.hasOwnProperty('publicKey')) {
              d.publicKey = $root.google.protobuf.Any.toObject(m.publicKey, o);
            }
            if (m.data != null && m.hasOwnProperty('data')) {
              d.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.toObject(
                m.data,
                o
              );
            }
            if (m.sequence != null && m.hasOwnProperty('sequence')) {
              if (typeof m.sequence === 'number')
                d.sequence =
                  o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.sequence.low >>> 0,
                        m.sequence.high >>> 0
                      ).toNumber(true)
                    : m.sequence;
            }
            return d;
          };
          SignatureDescriptor.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          SignatureDescriptor.Data = (function () {
            function Data(p) {
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            Data.prototype.single = null;
            Data.prototype.multi = null;
            let $oneOfFields;
            Object.defineProperty(Data.prototype, 'sum', {
              get: $util.oneOfGetter(($oneOfFields = ['single', 'multi'])),
              set: $util.oneOfSetter($oneOfFields)
            });
            Data.create = function create(properties) {
              return new Data(properties);
            };
            Data.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.single != null && Object.hasOwnProperty.call(m, 'single'))
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.encode(
                  m.single,
                  w.uint32(10).fork()
                ).ldelim();
              if (m.multi != null && Object.hasOwnProperty.call(m, 'multi'))
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.encode(
                  m.multi,
                  w.uint32(18).fork()
                ).ldelim();
              return w;
            };
            Data.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.decode(
                      r,
                      r.uint32()
                    );
                    break;
                  case 2:
                    m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.decode(
                      r,
                      r.uint32()
                    );
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            Data.fromObject = function fromObject(d) {
              if (
                d instanceof
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data
              )
                return d;
              var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data();
              if (d.single != null) {
                if (typeof d.single !== 'object')
                  throw TypeError(
                    '.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.single: object expected'
                  );
                m.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.fromObject(
                  d.single
                );
              }
              if (d.multi != null) {
                if (typeof d.multi !== 'object')
                  throw TypeError(
                    '.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.multi: object expected'
                  );
                m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.fromObject(
                  d.multi
                );
              }
              return m;
            };
            Data.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (m.single != null && m.hasOwnProperty('single')) {
                d.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.toObject(
                  m.single,
                  o
                );
                if (o.oneofs) d.sum = 'single';
              }
              if (m.multi != null && m.hasOwnProperty('multi')) {
                d.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.toObject(
                  m.multi,
                  o
                );
                if (o.oneofs) d.sum = 'multi';
              }
              return d;
            };
            Data.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(
                this,
                $protobuf.util.toJSONOptions
              );
            };
            Data.Single = (function () {
              function Single(p) {
                if (p)
                  for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
              }
              Single.prototype.mode = 0;
              Single.prototype.signature = $util.newBuffer([]);
              Single.create = function create(properties) {
                return new Single(properties);
              };
              Single.encode = function encode(m, w) {
                if (!w) w = $Writer.create();
                if (m.mode != null && Object.hasOwnProperty.call(m, 'mode'))
                  w.uint32(8).int32(m.mode);
                if (
                  m.signature != null &&
                  Object.hasOwnProperty.call(m, 'signature')
                )
                  w.uint32(18).bytes(m.signature);
                return w;
              };
              Single.decode = function decode(r, l) {
                if (!(r instanceof $Reader)) r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l,
                  m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single();
                while (r.pos < c) {
                  var t = r.uint32();
                  switch (t >>> 3) {
                    case 1:
                      m.mode = r.int32();
                      break;
                    case 2:
                      m.signature = r.bytes();
                      break;
                    default:
                      r.skipType(t & 7);
                      break;
                  }
                }
                return m;
              };
              Single.fromObject = function fromObject(d) {
                if (
                  d instanceof
                  $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data
                    .Single
                )
                  return d;
                var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single();
                switch (d.mode) {
                  case 'SIGN_MODE_UNSPECIFIED':
                  case 0:
                    m.mode = 0;
                    break;
                  case 'SIGN_MODE_DIRECT':
                  case 1:
                    m.mode = 1;
                    break;
                  case 'SIGN_MODE_TEXTUAL':
                  case 2:
                    m.mode = 2;
                    break;
                  case 'SIGN_MODE_LEGACY_AMINO_JSON':
                  case 127:
                    m.mode = 127;
                    break;
                }
                if (d.signature != null) {
                  if (typeof d.signature === 'string')
                    $util.base64.decode(
                      d.signature,
                      (m.signature = $util.newBuffer(
                        $util.base64.length(d.signature)
                      )),
                      0
                    );
                  else if (d.signature.length) m.signature = d.signature;
                }
                return m;
              };
              Single.toObject = function toObject(m, o) {
                if (!o) o = {};
                var d = {};
                if (o.defaults) {
                  d.mode = o.enums === String ? 'SIGN_MODE_UNSPECIFIED' : 0;
                  if (o.bytes === String) d.signature = '';
                  else {
                    d.signature = [];
                    if (o.bytes !== Array)
                      d.signature = $util.newBuffer(d.signature);
                  }
                }
                if (m.mode != null && m.hasOwnProperty('mode')) {
                  d.mode =
                    o.enums === String
                      ? $root.cosmos.tx.signing.v1beta1.SignMode[m.mode]
                      : m.mode;
                }
                if (m.signature != null && m.hasOwnProperty('signature')) {
                  d.signature =
                    o.bytes === String
                      ? $util.base64.encode(m.signature, 0, m.signature.length)
                      : o.bytes === Array
                      ? Array.prototype.slice.call(m.signature)
                      : m.signature;
                }
                return d;
              };
              Single.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(
                  this,
                  $protobuf.util.toJSONOptions
                );
              };
              return Single;
            })();
            Data.Multi = (function () {
              function Multi(p) {
                this.signatures = [];
                if (p)
                  for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
              }
              Multi.prototype.bitarray = null;
              Multi.prototype.signatures = $util.emptyArray;
              Multi.create = function create(properties) {
                return new Multi(properties);
              };
              Multi.encode = function encode(m, w) {
                if (!w) w = $Writer.create();
                if (
                  m.bitarray != null &&
                  Object.hasOwnProperty.call(m, 'bitarray')
                )
                  $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.encode(
                    m.bitarray,
                    w.uint32(10).fork()
                  ).ldelim();
                if (m.signatures != null && m.signatures.length) {
                  for (var i = 0; i < m.signatures.length; ++i)
                    $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(
                      m.signatures[i],
                      w.uint32(18).fork()
                    ).ldelim();
                }
                return w;
              };
              Multi.decode = function decode(r, l) {
                if (!(r instanceof $Reader)) r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l,
                  m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi();
                while (r.pos < c) {
                  var t = r.uint32();
                  switch (t >>> 3) {
                    case 1:
                      m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(
                        r,
                        r.uint32()
                      );
                      break;
                    case 2:
                      if (!(m.signatures && m.signatures.length))
                        m.signatures = [];
                      m.signatures.push(
                        $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.decode(
                          r,
                          r.uint32()
                        )
                      );
                      break;
                    default:
                      r.skipType(t & 7);
                      break;
                  }
                }
                return m;
              };
              Multi.fromObject = function fromObject(d) {
                if (
                  d instanceof
                  $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi
                )
                  return d;
                var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi();
                if (d.bitarray != null) {
                  if (typeof d.bitarray !== 'object')
                    throw TypeError(
                      '.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.bitarray: object expected'
                    );
                  m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject(
                    d.bitarray
                  );
                }
                if (d.signatures) {
                  if (!Array.isArray(d.signatures))
                    throw TypeError(
                      '.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: array expected'
                    );
                  m.signatures = [];
                  for (var i = 0; i < d.signatures.length; ++i) {
                    if (typeof d.signatures[i] !== 'object')
                      throw TypeError(
                        '.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: object expected'
                      );
                    m.signatures[
                      i
                    ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.fromObject(
                      d.signatures[i]
                    );
                  }
                }
                return m;
              };
              Multi.toObject = function toObject(m, o) {
                if (!o) o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                  d.signatures = [];
                }
                if (o.defaults) {
                  d.bitarray = null;
                }
                if (m.bitarray != null && m.hasOwnProperty('bitarray')) {
                  d.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.toObject(
                    m.bitarray,
                    o
                  );
                }
                if (m.signatures && m.signatures.length) {
                  d.signatures = [];
                  for (var j = 0; j < m.signatures.length; ++j) {
                    d.signatures[
                      j
                    ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.toObject(
                      m.signatures[j],
                      o
                    );
                  }
                }
                return d;
              };
              Multi.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(
                  this,
                  $protobuf.util.toJSONOptions
                );
              };
              return Multi;
            })();
            return Data;
          })();
          return SignatureDescriptor;
        })();
        return v1beta1;
      })();
      return signing;
    })();
    return tx;
  })();
  return cosmos;
})();
exports.google = $root.google = (() => {
  const google = {};
  google.protobuf = (function () {
    const protobuf = {};
    protobuf.Any = (function () {
      function Any(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Any.prototype.type_url = '';
      Any.prototype.value = $util.newBuffer([]);
      Any.create = function create(properties) {
        return new Any(properties);
      };
      Any.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.type_url != null && Object.hasOwnProperty.call(m, 'type_url'))
          w.uint32(10).string(m.type_url);
        if (m.value != null && Object.hasOwnProperty.call(m, 'value'))
          w.uint32(18).bytes(m.value);
        return w;
      };
      Any.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.Any();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.type_url = r.string();
              break;
            case 2:
              m.value = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Any.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.Any) return d;
        var m = new $root.google.protobuf.Any();
        if (d.type_url != null) {
          m.type_url = String(d.type_url);
        }
        if (d.value != null) {
          if (typeof d.value === 'string')
            $util.base64.decode(
              d.value,
              (m.value = $util.newBuffer($util.base64.length(d.value))),
              0
            );
          else if (d.value.length) m.value = d.value;
        }
        return m;
      };
      Any.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.type_url = '';
          if (o.bytes === String) d.value = '';
          else {
            d.value = [];
            if (o.bytes !== Array) d.value = $util.newBuffer(d.value);
          }
        }
        if (m.type_url != null && m.hasOwnProperty('type_url')) {
          d.type_url = m.type_url;
        }
        if (m.value != null && m.hasOwnProperty('value')) {
          d.value =
            o.bytes === String
              ? $util.base64.encode(m.value, 0, m.value.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.value)
              : m.value;
        }
        return d;
      };
      Any.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Any;
    })();
    protobuf.Timestamp = (function () {
      function Timestamp(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Timestamp.prototype.seconds = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Timestamp.prototype.nanos = 0;
      Timestamp.create = function create(properties) {
        return new Timestamp(properties);
      };
      Timestamp.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.seconds != null && Object.hasOwnProperty.call(m, 'seconds'))
          w.uint32(8).int64(m.seconds);
        if (m.nanos != null && Object.hasOwnProperty.call(m, 'nanos'))
          w.uint32(16).int32(m.nanos);
        return w;
      };
      Timestamp.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.Timestamp();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.seconds = r.int64();
              break;
            case 2:
              m.nanos = r.int32();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Timestamp.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.Timestamp) return d;
        var m = new $root.google.protobuf.Timestamp();
        if (d.seconds != null) {
          if ($util.Long)
            (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
          else if (typeof d.seconds === 'string')
            m.seconds = parseInt(d.seconds, 10);
          else if (typeof d.seconds === 'number') m.seconds = d.seconds;
          else if (typeof d.seconds === 'object')
            m.seconds = new $util.LongBits(
              d.seconds.low >>> 0,
              d.seconds.high >>> 0
            ).toNumber();
        }
        if (d.nanos != null) {
          m.nanos = d.nanos | 0;
        }
        return m;
      };
      Timestamp.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.seconds =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.seconds = o.longs === String ? '0' : 0;
          d.nanos = 0;
        }
        if (m.seconds != null && m.hasOwnProperty('seconds')) {
          if (typeof m.seconds === 'number')
            d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
          else
            d.seconds =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.seconds)
                : o.longs === Number
                ? new $util.LongBits(
                    m.seconds.low >>> 0,
                    m.seconds.high >>> 0
                  ).toNumber()
                : m.seconds;
        }
        if (m.nanos != null && m.hasOwnProperty('nanos')) {
          d.nanos = m.nanos;
        }
        return d;
      };
      Timestamp.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Timestamp;
    })();
    return protobuf;
  })();
  return google;
})();
exports.ibc = $root.ibc = (() => {
  const ibc = {};
  ibc.applications = (function () {
    const applications = {};
    applications.transfer = (function () {
      const transfer = {};
      transfer.v1 = (function () {
        const v1 = {};
        v1.Msg = (function () {
          function Msg(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(
              this,
              rpcImpl,
              requestDelimited,
              responseDelimited
            );
          }
          (Msg.prototype = Object.create(
            $protobuf.rpc.Service.prototype
          )).constructor = Msg;
          Msg.create = function create(
            rpcImpl,
            requestDelimited,
            responseDelimited
          ) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
          };
          Object.defineProperty(
            (Msg.prototype.transfer = function transfer(request, callback) {
              return this.rpcCall(
                transfer,
                $root.ibc.applications.transfer.v1.MsgTransfer,
                $root.ibc.applications.transfer.v1.MsgTransferResponse,
                request,
                callback
              );
            }),
            'name',
            { value: 'Transfer' }
          );
          return Msg;
        })();
        v1.MsgTransfer = (function () {
          function MsgTransfer(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgTransfer.prototype.sourcePort = '';
          MsgTransfer.prototype.sourceChannel = '';
          MsgTransfer.prototype.token = null;
          MsgTransfer.prototype.sender = '';
          MsgTransfer.prototype.receiver = '';
          MsgTransfer.prototype.timeoutHeight = null;
          MsgTransfer.prototype.timeoutTimestamp = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          MsgTransfer.create = function create(properties) {
            return new MsgTransfer(properties);
          };
          MsgTransfer.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.sourcePort != null &&
              Object.hasOwnProperty.call(m, 'sourcePort')
            )
              w.uint32(10).string(m.sourcePort);
            if (
              m.sourceChannel != null &&
              Object.hasOwnProperty.call(m, 'sourceChannel')
            )
              w.uint32(18).string(m.sourceChannel);
            if (m.token != null && Object.hasOwnProperty.call(m, 'token'))
              $root.cosmos.base.v1beta1.Coin.encode(
                m.token,
                w.uint32(26).fork()
              ).ldelim();
            if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
              w.uint32(34).string(m.sender);
            if (m.receiver != null && Object.hasOwnProperty.call(m, 'receiver'))
              w.uint32(42).string(m.receiver);
            if (
              m.timeoutHeight != null &&
              Object.hasOwnProperty.call(m, 'timeoutHeight')
            )
              $root.ibc.core.client.v1.Height.encode(
                m.timeoutHeight,
                w.uint32(50).fork()
              ).ldelim();
            if (
              m.timeoutTimestamp != null &&
              Object.hasOwnProperty.call(m, 'timeoutTimestamp')
            )
              w.uint32(56).uint64(m.timeoutTimestamp);
            return w;
          };
          MsgTransfer.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.applications.transfer.v1.MsgTransfer();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.sourcePort = r.string();
                  break;
                case 2:
                  m.sourceChannel = r.string();
                  break;
                case 3:
                  m.token = $root.cosmos.base.v1beta1.Coin.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 4:
                  m.sender = r.string();
                  break;
                case 5:
                  m.receiver = r.string();
                  break;
                case 6:
                  m.timeoutHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 7:
                  m.timeoutTimestamp = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgTransfer.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.applications.transfer.v1.MsgTransfer)
              return d;
            var m = new $root.ibc.applications.transfer.v1.MsgTransfer();
            if (d.sourcePort != null) {
              m.sourcePort = String(d.sourcePort);
            }
            if (d.sourceChannel != null) {
              m.sourceChannel = String(d.sourceChannel);
            }
            if (d.token != null) {
              if (typeof d.token !== 'object')
                throw TypeError(
                  '.ibc.applications.transfer.v1.MsgTransfer.token: object expected'
                );
              m.token = $root.cosmos.base.v1beta1.Coin.fromObject(d.token);
            }
            if (d.sender != null) {
              m.sender = String(d.sender);
            }
            if (d.receiver != null) {
              m.receiver = String(d.receiver);
            }
            if (d.timeoutHeight != null) {
              if (typeof d.timeoutHeight !== 'object')
                throw TypeError(
                  '.ibc.applications.transfer.v1.MsgTransfer.timeoutHeight: object expected'
                );
              m.timeoutHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.timeoutHeight
              );
            }
            if (d.timeoutTimestamp != null) {
              if ($util.Long)
                (m.timeoutTimestamp = $util.Long.fromValue(
                  d.timeoutTimestamp
                )).unsigned = true;
              else if (typeof d.timeoutTimestamp === 'string')
                m.timeoutTimestamp = parseInt(d.timeoutTimestamp, 10);
              else if (typeof d.timeoutTimestamp === 'number')
                m.timeoutTimestamp = d.timeoutTimestamp;
              else if (typeof d.timeoutTimestamp === 'object')
                m.timeoutTimestamp = new $util.LongBits(
                  d.timeoutTimestamp.low >>> 0,
                  d.timeoutTimestamp.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          MsgTransfer.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.sourcePort = '';
              d.sourceChannel = '';
              d.token = null;
              d.sender = '';
              d.receiver = '';
              d.timeoutHeight = null;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.timeoutTimestamp =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.timeoutTimestamp = o.longs === String ? '0' : 0;
            }
            if (m.sourcePort != null && m.hasOwnProperty('sourcePort')) {
              d.sourcePort = m.sourcePort;
            }
            if (m.sourceChannel != null && m.hasOwnProperty('sourceChannel')) {
              d.sourceChannel = m.sourceChannel;
            }
            if (m.token != null && m.hasOwnProperty('token')) {
              d.token = $root.cosmos.base.v1beta1.Coin.toObject(m.token, o);
            }
            if (m.sender != null && m.hasOwnProperty('sender')) {
              d.sender = m.sender;
            }
            if (m.receiver != null && m.hasOwnProperty('receiver')) {
              d.receiver = m.receiver;
            }
            if (m.timeoutHeight != null && m.hasOwnProperty('timeoutHeight')) {
              d.timeoutHeight = $root.ibc.core.client.v1.Height.toObject(
                m.timeoutHeight,
                o
              );
            }
            if (
              m.timeoutTimestamp != null &&
              m.hasOwnProperty('timeoutTimestamp')
            ) {
              if (typeof m.timeoutTimestamp === 'number')
                d.timeoutTimestamp =
                  o.longs === String
                    ? String(m.timeoutTimestamp)
                    : m.timeoutTimestamp;
              else
                d.timeoutTimestamp =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.timeoutTimestamp)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.timeoutTimestamp.low >>> 0,
                        m.timeoutTimestamp.high >>> 0
                      ).toNumber(true)
                    : m.timeoutTimestamp;
            }
            return d;
          };
          MsgTransfer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgTransfer;
        })();
        v1.MsgTransferResponse = (function () {
          function MsgTransferResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgTransferResponse.create = function create(properties) {
            return new MsgTransferResponse(properties);
          };
          MsgTransferResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            return w;
          };
          MsgTransferResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.applications.transfer.v1.MsgTransferResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgTransferResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.applications.transfer.v1.MsgTransferResponse
            )
              return d;
            return new $root.ibc.applications.transfer.v1.MsgTransferResponse();
          };
          MsgTransferResponse.toObject = function toObject() {
            return {};
          };
          MsgTransferResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgTransferResponse;
        })();
        return v1;
      })();
      return transfer;
    })();
    return applications;
  })();
  ibc.core = (function () {
    const core = {};
    core.client = (function () {
      const client = {};
      client.v1 = (function () {
        const v1 = {};
        v1.Height = (function () {
          function Height(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Height.prototype.revisionNumber = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          Height.prototype.revisionHeight = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          Height.create = function create(properties) {
            return new Height(properties);
          };
          Height.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.revisionNumber != null &&
              Object.hasOwnProperty.call(m, 'revisionNumber')
            )
              w.uint32(8).uint64(m.revisionNumber);
            if (
              m.revisionHeight != null &&
              Object.hasOwnProperty.call(m, 'revisionHeight')
            )
              w.uint32(16).uint64(m.revisionHeight);
            return w;
          };
          Height.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.Height();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.revisionNumber = r.uint64();
                  break;
                case 2:
                  m.revisionHeight = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Height.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.Height) return d;
            var m = new $root.ibc.core.client.v1.Height();
            if (d.revisionNumber != null) {
              if ($util.Long)
                (m.revisionNumber = $util.Long.fromValue(
                  d.revisionNumber
                )).unsigned = true;
              else if (typeof d.revisionNumber === 'string')
                m.revisionNumber = parseInt(d.revisionNumber, 10);
              else if (typeof d.revisionNumber === 'number')
                m.revisionNumber = d.revisionNumber;
              else if (typeof d.revisionNumber === 'object')
                m.revisionNumber = new $util.LongBits(
                  d.revisionNumber.low >>> 0,
                  d.revisionNumber.high >>> 0
                ).toNumber(true);
            }
            if (d.revisionHeight != null) {
              if ($util.Long)
                (m.revisionHeight = $util.Long.fromValue(
                  d.revisionHeight
                )).unsigned = true;
              else if (typeof d.revisionHeight === 'string')
                m.revisionHeight = parseInt(d.revisionHeight, 10);
              else if (typeof d.revisionHeight === 'number')
                m.revisionHeight = d.revisionHeight;
              else if (typeof d.revisionHeight === 'object')
                m.revisionHeight = new $util.LongBits(
                  d.revisionHeight.low >>> 0,
                  d.revisionHeight.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          Height.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.revisionNumber =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.revisionNumber = o.longs === String ? '0' : 0;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.revisionHeight =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.revisionHeight = o.longs === String ? '0' : 0;
            }
            if (
              m.revisionNumber != null &&
              m.hasOwnProperty('revisionNumber')
            ) {
              if (typeof m.revisionNumber === 'number')
                d.revisionNumber =
                  o.longs === String
                    ? String(m.revisionNumber)
                    : m.revisionNumber;
              else
                d.revisionNumber =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.revisionNumber)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.revisionNumber.low >>> 0,
                        m.revisionNumber.high >>> 0
                      ).toNumber(true)
                    : m.revisionNumber;
            }
            if (
              m.revisionHeight != null &&
              m.hasOwnProperty('revisionHeight')
            ) {
              if (typeof m.revisionHeight === 'number')
                d.revisionHeight =
                  o.longs === String
                    ? String(m.revisionHeight)
                    : m.revisionHeight;
              else
                d.revisionHeight =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.revisionHeight)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.revisionHeight.low >>> 0,
                        m.revisionHeight.high >>> 0
                      ).toNumber(true)
                    : m.revisionHeight;
            }
            return d;
          };
          Height.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Height;
        })();
        return v1;
      })();
      return client;
    })();
    return core;
  })();
  return ibc;
})();
exports.cosmwasm = $root.cosmwasm = (() => {
  const cosmwasm = {};
  cosmwasm.wasm = (function () {
    const wasm = {};
    wasm.v1beta1 = (function () {
      /**
       * Namespace v1beta1.
       * @memberof cosmwasm.wasm
       * @namespace
       */
      const v1beta1 = {};

      v1beta1.QueryContractInfoRequest = (function () {
        /**
         * Properties of a QueryContractInfoRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryContractInfoRequest
         * @property {string|null} [address] QueryContractInfoRequest address
         */

        /**
         * Constructs a new QueryContractInfoRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryContractInfoRequest.
         * @implements IQueryContractInfoRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryContractInfoRequest=} [p] Properties to set
         */
        function QueryContractInfoRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryContractInfoRequest address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.QueryContractInfoRequest
         * @instance
         */
        QueryContractInfoRequest.prototype.address = '';

        /**
         * Encodes the specified QueryContractInfoRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryContractInfoRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractInfoRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryContractInfoRequest} m QueryContractInfoRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryContractInfoRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          return w;
        };

        /**
         * Decodes a QueryContractInfoRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractInfoRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryContractInfoRequest} QueryContractInfoRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryContractInfoRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryContractInfoRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryContractInfoRequest;
      })();

      v1beta1.QueryContractInfoResponse = (function () {
        /**
         * Properties of a QueryContractInfoResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryContractInfoResponse
         * @property {string|null} [address] QueryContractInfoResponse address
         * @property {cosmwasm.wasm.v1beta1.IContractInfo|null} [contract_info] QueryContractInfoResponse contract_info
         */

        /**
         * Constructs a new QueryContractInfoResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryContractInfoResponse.
         * @implements IQueryContractInfoResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryContractInfoResponse=} [p] Properties to set
         */
        function QueryContractInfoResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryContractInfoResponse address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.QueryContractInfoResponse
         * @instance
         */
        QueryContractInfoResponse.prototype.address = '';

        /**
         * QueryContractInfoResponse contract_info.
         * @member {cosmwasm.wasm.v1beta1.IContractInfo|null|undefined} contract_info
         * @memberof cosmwasm.wasm.v1beta1.QueryContractInfoResponse
         * @instance
         */
        QueryContractInfoResponse.prototype.contract_info = null;

        /**
         * Encodes the specified QueryContractInfoResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryContractInfoResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractInfoResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryContractInfoResponse} m QueryContractInfoResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryContractInfoResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (
            m.contract_info != null &&
            Object.hasOwnProperty.call(m, 'contract_info')
          )
            $root.cosmwasm.wasm.v1beta1.ContractInfo.encode(
              m.contract_info,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryContractInfoResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractInfoResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryContractInfoResponse} QueryContractInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryContractInfoResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryContractInfoResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.contract_info = $root.cosmwasm.wasm.v1beta1.ContractInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryContractInfoResponse;
      })();

      v1beta1.QueryContractHistoryRequest = (function () {
        /**
         * Properties of a QueryContractHistoryRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryContractHistoryRequest
         * @property {string|null} [address] QueryContractHistoryRequest address
         * @property {cosmos.base.query.v1beta1.IPageRequest|null} [pagination] QueryContractHistoryRequest pagination
         */

        /**
         * Constructs a new QueryContractHistoryRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryContractHistoryRequest.
         * @implements IQueryContractHistoryRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryContractHistoryRequest=} [p] Properties to set
         */
        function QueryContractHistoryRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryContractHistoryRequest address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryRequest
         * @instance
         */
        QueryContractHistoryRequest.prototype.address = '';

        /**
         * QueryContractHistoryRequest pagination.
         * @member {cosmos.base.query.v1beta1.IPageRequest|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryRequest
         * @instance
         */
        QueryContractHistoryRequest.prototype.pagination = null;

        /**
         * Encodes the specified QueryContractHistoryRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryContractHistoryRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryContractHistoryRequest} m QueryContractHistoryRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryContractHistoryRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageRequest.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryContractHistoryRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryContractHistoryRequest} QueryContractHistoryRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryContractHistoryRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryContractHistoryRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryContractHistoryRequest;
      })();

      v1beta1.QueryContractHistoryResponse = (function () {
        /**
         * Properties of a QueryContractHistoryResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryContractHistoryResponse
         * @property {Array.<cosmwasm.wasm.v1beta1.IContractCodeHistoryEntry>|null} [entries] QueryContractHistoryResponse entries
         * @property {cosmos.base.query.v1beta1.IPageResponse|null} [pagination] QueryContractHistoryResponse pagination
         */

        /**
         * Constructs a new QueryContractHistoryResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryContractHistoryResponse.
         * @implements IQueryContractHistoryResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryContractHistoryResponse=} [p] Properties to set
         */
        function QueryContractHistoryResponse(p) {
          this.entries = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryContractHistoryResponse entries.
         * @member {Array.<cosmwasm.wasm.v1beta1.IContractCodeHistoryEntry>} entries
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryResponse
         * @instance
         */
        QueryContractHistoryResponse.prototype.entries = $util.emptyArray;

        /**
         * QueryContractHistoryResponse pagination.
         * @member {cosmos.base.query.v1beta1.IPageResponse|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryResponse
         * @instance
         */
        QueryContractHistoryResponse.prototype.pagination = null;

        /**
         * Encodes the specified QueryContractHistoryResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryContractHistoryResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryContractHistoryResponse} m QueryContractHistoryResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryContractHistoryResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.entries != null && m.entries.length) {
            for (var i = 0; i < m.entries.length; ++i)
              $root.cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry.encode(
                m.entries[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageResponse.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryContractHistoryResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractHistoryResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryContractHistoryResponse} QueryContractHistoryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryContractHistoryResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryContractHistoryResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.entries && m.entries.length)) m.entries = [];
                m.entries.push(
                  $root.cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryContractHistoryResponse;
      })();

      v1beta1.QueryContractsByCodeRequest = (function () {
        /**
         * Properties of a QueryContractsByCodeRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryContractsByCodeRequest
         * @property {Long|null} [code_id] QueryContractsByCodeRequest code_id
         * @property {cosmos.base.query.v1beta1.IPageRequest|null} [pagination] QueryContractsByCodeRequest pagination
         */

        /**
         * Constructs a new QueryContractsByCodeRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryContractsByCodeRequest.
         * @implements IQueryContractsByCodeRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryContractsByCodeRequest=} [p] Properties to set
         */
        function QueryContractsByCodeRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryContractsByCodeRequest code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeRequest
         * @instance
         */
        QueryContractsByCodeRequest.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * QueryContractsByCodeRequest pagination.
         * @member {cosmos.base.query.v1beta1.IPageRequest|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeRequest
         * @instance
         */
        QueryContractsByCodeRequest.prototype.pagination = null;

        /**
         * Encodes the specified QueryContractsByCodeRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryContractsByCodeRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryContractsByCodeRequest} m QueryContractsByCodeRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryContractsByCodeRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(8).uint64(m.code_id);
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageRequest.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryContractsByCodeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryContractsByCodeRequest} QueryContractsByCodeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryContractsByCodeRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryContractsByCodeRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_id = r.uint64();
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryContractsByCodeRequest;
      })();

      v1beta1.ContractInfoWithAddress = (function () {
        /**
         * Properties of a ContractInfoWithAddress.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IContractInfoWithAddress
         * @property {string|null} [address] ContractInfoWithAddress address
         * @property {cosmwasm.wasm.v1beta1.IContractInfo|null} [contract_info] ContractInfoWithAddress contract_info
         */

        /**
         * Constructs a new ContractInfoWithAddress.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a ContractInfoWithAddress.
         * @implements IContractInfoWithAddress
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IContractInfoWithAddress=} [p] Properties to set
         */
        function ContractInfoWithAddress(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * ContractInfoWithAddress address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.ContractInfoWithAddress
         * @instance
         */
        ContractInfoWithAddress.prototype.address = '';

        /**
         * ContractInfoWithAddress contract_info.
         * @member {cosmwasm.wasm.v1beta1.IContractInfo|null|undefined} contract_info
         * @memberof cosmwasm.wasm.v1beta1.ContractInfoWithAddress
         * @instance
         */
        ContractInfoWithAddress.prototype.contract_info = null;

        /**
         * Encodes the specified ContractInfoWithAddress message. Does not implicitly {@link cosmwasm.wasm.v1beta1.ContractInfoWithAddress.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.ContractInfoWithAddress
         * @static
         * @param {cosmwasm.wasm.v1beta1.IContractInfoWithAddress} m ContractInfoWithAddress message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ContractInfoWithAddress.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (
            m.contract_info != null &&
            Object.hasOwnProperty.call(m, 'contract_info')
          )
            $root.cosmwasm.wasm.v1beta1.ContractInfo.encode(
              m.contract_info,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a ContractInfoWithAddress message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.ContractInfoWithAddress
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.ContractInfoWithAddress} ContractInfoWithAddress
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ContractInfoWithAddress.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.ContractInfoWithAddress();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.contract_info = $root.cosmwasm.wasm.v1beta1.ContractInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return ContractInfoWithAddress;
      })();

      v1beta1.QueryContractsByCodeResponse = (function () {
        /**
         * Properties of a QueryContractsByCodeResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryContractsByCodeResponse
         * @property {Array.<cosmwasm.wasm.v1beta1.IContractInfoWithAddress>|null} [contract_infos] QueryContractsByCodeResponse contract_infos
         * @property {cosmos.base.query.v1beta1.IPageResponse|null} [pagination] QueryContractsByCodeResponse pagination
         */

        /**
         * Constructs a new QueryContractsByCodeResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryContractsByCodeResponse.
         * @implements IQueryContractsByCodeResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryContractsByCodeResponse=} [p] Properties to set
         */
        function QueryContractsByCodeResponse(p) {
          this.contract_infos = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryContractsByCodeResponse contract_infos.
         * @member {Array.<cosmwasm.wasm.v1beta1.IContractInfoWithAddress>} contract_infos
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeResponse
         * @instance
         */
        QueryContractsByCodeResponse.prototype.contract_infos =
          $util.emptyArray;

        /**
         * QueryContractsByCodeResponse pagination.
         * @member {cosmos.base.query.v1beta1.IPageResponse|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeResponse
         * @instance
         */
        QueryContractsByCodeResponse.prototype.pagination = null;

        /**
         * Encodes the specified QueryContractsByCodeResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryContractsByCodeResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryContractsByCodeResponse} m QueryContractsByCodeResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryContractsByCodeResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.contract_infos != null && m.contract_infos.length) {
            for (var i = 0; i < m.contract_infos.length; ++i)
              $root.cosmwasm.wasm.v1beta1.ContractInfoWithAddress.encode(
                m.contract_infos[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageResponse.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryContractsByCodeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryContractsByCodeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryContractsByCodeResponse} QueryContractsByCodeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryContractsByCodeResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryContractsByCodeResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.contract_infos && m.contract_infos.length))
                  m.contract_infos = [];
                m.contract_infos.push(
                  $root.cosmwasm.wasm.v1beta1.ContractInfoWithAddress.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryContractsByCodeResponse;
      })();

      v1beta1.QueryAllContractStateRequest = (function () {
        /**
         * Properties of a QueryAllContractStateRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryAllContractStateRequest
         * @property {string|null} [address] QueryAllContractStateRequest address
         * @property {cosmos.base.query.v1beta1.IPageRequest|null} [pagination] QueryAllContractStateRequest pagination
         */

        /**
         * Constructs a new QueryAllContractStateRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryAllContractStateRequest.
         * @implements IQueryAllContractStateRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryAllContractStateRequest=} [p] Properties to set
         */
        function QueryAllContractStateRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryAllContractStateRequest address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateRequest
         * @instance
         */
        QueryAllContractStateRequest.prototype.address = '';

        /**
         * QueryAllContractStateRequest pagination.
         * @member {cosmos.base.query.v1beta1.IPageRequest|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateRequest
         * @instance
         */
        QueryAllContractStateRequest.prototype.pagination = null;

        /**
         * Encodes the specified QueryAllContractStateRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryAllContractStateRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryAllContractStateRequest} m QueryAllContractStateRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryAllContractStateRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageRequest.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryAllContractStateRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryAllContractStateRequest} QueryAllContractStateRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryAllContractStateRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryAllContractStateRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryAllContractStateRequest;
      })();

      v1beta1.QueryAllContractStateResponse = (function () {
        /**
         * Properties of a QueryAllContractStateResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryAllContractStateResponse
         * @property {Array.<cosmwasm.wasm.v1beta1.IModel>|null} [models] QueryAllContractStateResponse models
         * @property {cosmos.base.query.v1beta1.IPageResponse|null} [pagination] QueryAllContractStateResponse pagination
         */

        /**
         * Constructs a new QueryAllContractStateResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryAllContractStateResponse.
         * @implements IQueryAllContractStateResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryAllContractStateResponse=} [p] Properties to set
         */
        function QueryAllContractStateResponse(p) {
          this.models = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryAllContractStateResponse models.
         * @member {Array.<cosmwasm.wasm.v1beta1.IModel>} models
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateResponse
         * @instance
         */
        QueryAllContractStateResponse.prototype.models = $util.emptyArray;

        /**
         * QueryAllContractStateResponse pagination.
         * @member {cosmos.base.query.v1beta1.IPageResponse|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateResponse
         * @instance
         */
        QueryAllContractStateResponse.prototype.pagination = null;

        /**
         * Encodes the specified QueryAllContractStateResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryAllContractStateResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryAllContractStateResponse} m QueryAllContractStateResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryAllContractStateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.models != null && m.models.length) {
            for (var i = 0; i < m.models.length; ++i)
              $root.cosmwasm.wasm.v1beta1.Model.encode(
                m.models[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageResponse.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryAllContractStateResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryAllContractStateResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryAllContractStateResponse} QueryAllContractStateResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryAllContractStateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryAllContractStateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.models && m.models.length)) m.models = [];
                m.models.push(
                  $root.cosmwasm.wasm.v1beta1.Model.decode(r, r.uint32())
                );
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryAllContractStateResponse;
      })();

      v1beta1.QueryRawContractStateRequest = (function () {
        /**
         * Properties of a QueryRawContractStateRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryRawContractStateRequest
         * @property {string|null} [address] QueryRawContractStateRequest address
         * @property {Uint8Array|null} [query_data] QueryRawContractStateRequest query_data
         */

        /**
         * Constructs a new QueryRawContractStateRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryRawContractStateRequest.
         * @implements IQueryRawContractStateRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryRawContractStateRequest=} [p] Properties to set
         */
        function QueryRawContractStateRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryRawContractStateRequest address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.QueryRawContractStateRequest
         * @instance
         */
        QueryRawContractStateRequest.prototype.address = '';

        /**
         * QueryRawContractStateRequest query_data.
         * @member {Uint8Array} query_data
         * @memberof cosmwasm.wasm.v1beta1.QueryRawContractStateRequest
         * @instance
         */
        QueryRawContractStateRequest.prototype.query_data = $util.newBuffer([]);

        /**
         * Encodes the specified QueryRawContractStateRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryRawContractStateRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryRawContractStateRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryRawContractStateRequest} m QueryRawContractStateRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryRawContractStateRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (
            m.query_data != null &&
            Object.hasOwnProperty.call(m, 'query_data')
          )
            w.uint32(18).bytes(m.query_data);
          return w;
        };

        /**
         * Decodes a QueryRawContractStateRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryRawContractStateRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryRawContractStateRequest} QueryRawContractStateRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryRawContractStateRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryRawContractStateRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.query_data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryRawContractStateRequest;
      })();

      v1beta1.QueryRawContractStateResponse = (function () {
        /**
         * Properties of a QueryRawContractStateResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryRawContractStateResponse
         * @property {Uint8Array|null} [data] QueryRawContractStateResponse data
         */

        /**
         * Constructs a new QueryRawContractStateResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryRawContractStateResponse.
         * @implements IQueryRawContractStateResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryRawContractStateResponse=} [p] Properties to set
         */
        function QueryRawContractStateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryRawContractStateResponse data.
         * @member {Uint8Array} data
         * @memberof cosmwasm.wasm.v1beta1.QueryRawContractStateResponse
         * @instance
         */
        QueryRawContractStateResponse.prototype.data = $util.newBuffer([]);

        /**
         * Encodes the specified QueryRawContractStateResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryRawContractStateResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryRawContractStateResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryRawContractStateResponse} m QueryRawContractStateResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryRawContractStateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
            w.uint32(10).bytes(m.data);
          return w;
        };

        /**
         * Decodes a QueryRawContractStateResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryRawContractStateResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryRawContractStateResponse} QueryRawContractStateResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryRawContractStateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryRawContractStateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryRawContractStateResponse;
      })();

      v1beta1.QuerySmartContractStateRequest = (function () {
        /**
         * Properties of a QuerySmartContractStateRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQuerySmartContractStateRequest
         * @property {string|null} [address] QuerySmartContractStateRequest address
         * @property {Uint8Array|null} [query_data] QuerySmartContractStateRequest query_data
         */

        /**
         * Constructs a new QuerySmartContractStateRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QuerySmartContractStateRequest.
         * @implements IQuerySmartContractStateRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQuerySmartContractStateRequest=} [p] Properties to set
         */
        function QuerySmartContractStateRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QuerySmartContractStateRequest address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.QuerySmartContractStateRequest
         * @instance
         */
        QuerySmartContractStateRequest.prototype.address = '';

        /**
         * QuerySmartContractStateRequest query_data.
         * @member {Uint8Array} query_data
         * @memberof cosmwasm.wasm.v1beta1.QuerySmartContractStateRequest
         * @instance
         */
        QuerySmartContractStateRequest.prototype.query_data = $util.newBuffer(
          []
        );

        /**
         * Encodes the specified QuerySmartContractStateRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QuerySmartContractStateRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QuerySmartContractStateRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQuerySmartContractStateRequest} m QuerySmartContractStateRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuerySmartContractStateRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          if (
            m.query_data != null &&
            Object.hasOwnProperty.call(m, 'query_data')
          )
            w.uint32(18).bytes(m.query_data);
          return w;
        };

        /**
         * Decodes a QuerySmartContractStateRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QuerySmartContractStateRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QuerySmartContractStateRequest} QuerySmartContractStateRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuerySmartContractStateRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QuerySmartContractStateRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.query_data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QuerySmartContractStateRequest;
      })();

      v1beta1.QuerySmartContractStateResponse = (function () {
        /**
         * Properties of a QuerySmartContractStateResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQuerySmartContractStateResponse
         * @property {Uint8Array|null} [data] QuerySmartContractStateResponse data
         */

        /**
         * Constructs a new QuerySmartContractStateResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QuerySmartContractStateResponse.
         * @implements IQuerySmartContractStateResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQuerySmartContractStateResponse=} [p] Properties to set
         */
        function QuerySmartContractStateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QuerySmartContractStateResponse data.
         * @member {Uint8Array} data
         * @memberof cosmwasm.wasm.v1beta1.QuerySmartContractStateResponse
         * @instance
         */
        QuerySmartContractStateResponse.prototype.data = $util.newBuffer([]);

        /**
         * Encodes the specified QuerySmartContractStateResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QuerySmartContractStateResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QuerySmartContractStateResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQuerySmartContractStateResponse} m QuerySmartContractStateResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuerySmartContractStateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
            w.uint32(10).bytes(m.data);
          return w;
        };

        /**
         * Decodes a QuerySmartContractStateResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QuerySmartContractStateResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QuerySmartContractStateResponse} QuerySmartContractStateResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuerySmartContractStateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QuerySmartContractStateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QuerySmartContractStateResponse;
      })();

      v1beta1.QueryCodeRequest = (function () {
        /**
         * Properties of a QueryCodeRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryCodeRequest
         * @property {Long|null} [code_id] QueryCodeRequest code_id
         */

        /**
         * Constructs a new QueryCodeRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryCodeRequest.
         * @implements IQueryCodeRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryCodeRequest=} [p] Properties to set
         */
        function QueryCodeRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryCodeRequest code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.QueryCodeRequest
         * @instance
         */
        QueryCodeRequest.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * Encodes the specified QueryCodeRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryCodeRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodeRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryCodeRequest} m QueryCodeRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryCodeRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(8).uint64(m.code_id);
          return w;
        };

        /**
         * Decodes a QueryCodeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryCodeRequest} QueryCodeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryCodeRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryCodeRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_id = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryCodeRequest;
      })();

      v1beta1.CodeInfoResponse = (function () {
        /**
         * Properties of a CodeInfoResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface ICodeInfoResponse
         * @property {Long|null} [code_id] CodeInfoResponse code_id
         * @property {string|null} [creator] CodeInfoResponse creator
         * @property {Uint8Array|null} [data_hash] CodeInfoResponse data_hash
         * @property {string|null} [source] CodeInfoResponse source
         * @property {string|null} [builder] CodeInfoResponse builder
         */

        /**
         * Constructs a new CodeInfoResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a CodeInfoResponse.
         * @implements ICodeInfoResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.ICodeInfoResponse=} [p] Properties to set
         */
        function CodeInfoResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * CodeInfoResponse code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.CodeInfoResponse
         * @instance
         */
        CodeInfoResponse.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * CodeInfoResponse creator.
         * @member {string} creator
         * @memberof cosmwasm.wasm.v1beta1.CodeInfoResponse
         * @instance
         */
        CodeInfoResponse.prototype.creator = '';

        /**
         * CodeInfoResponse data_hash.
         * @member {Uint8Array} data_hash
         * @memberof cosmwasm.wasm.v1beta1.CodeInfoResponse
         * @instance
         */
        CodeInfoResponse.prototype.data_hash = $util.newBuffer([]);

        /**
         * CodeInfoResponse source.
         * @member {string} source
         * @memberof cosmwasm.wasm.v1beta1.CodeInfoResponse
         * @instance
         */
        CodeInfoResponse.prototype.source = '';

        /**
         * CodeInfoResponse builder.
         * @member {string} builder
         * @memberof cosmwasm.wasm.v1beta1.CodeInfoResponse
         * @instance
         */
        CodeInfoResponse.prototype.builder = '';

        /**
         * Encodes the specified CodeInfoResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.CodeInfoResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.CodeInfoResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.ICodeInfoResponse} m CodeInfoResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CodeInfoResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(8).uint64(m.code_id);
          if (m.creator != null && Object.hasOwnProperty.call(m, 'creator'))
            w.uint32(18).string(m.creator);
          if (m.data_hash != null && Object.hasOwnProperty.call(m, 'data_hash'))
            w.uint32(26).bytes(m.data_hash);
          if (m.source != null && Object.hasOwnProperty.call(m, 'source'))
            w.uint32(34).string(m.source);
          if (m.builder != null && Object.hasOwnProperty.call(m, 'builder'))
            w.uint32(42).string(m.builder);
          return w;
        };

        /**
         * Decodes a CodeInfoResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.CodeInfoResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.CodeInfoResponse} CodeInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CodeInfoResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.CodeInfoResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_id = r.uint64();
                break;
              case 2:
                m.creator = r.string();
                break;
              case 3:
                m.data_hash = r.bytes();
                break;
              case 4:
                m.source = r.string();
                break;
              case 5:
                m.builder = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return CodeInfoResponse;
      })();

      v1beta1.QueryCodeResponse = (function () {
        /**
         * Properties of a QueryCodeResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryCodeResponse
         * @property {cosmwasm.wasm.v1beta1.ICodeInfoResponse|null} [code_info] QueryCodeResponse code_info
         * @property {Uint8Array|null} [data] QueryCodeResponse data
         */

        /**
         * Constructs a new QueryCodeResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryCodeResponse.
         * @implements IQueryCodeResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryCodeResponse=} [p] Properties to set
         */
        function QueryCodeResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryCodeResponse code_info.
         * @member {cosmwasm.wasm.v1beta1.ICodeInfoResponse|null|undefined} code_info
         * @memberof cosmwasm.wasm.v1beta1.QueryCodeResponse
         * @instance
         */
        QueryCodeResponse.prototype.code_info = null;

        /**
         * QueryCodeResponse data.
         * @member {Uint8Array} data
         * @memberof cosmwasm.wasm.v1beta1.QueryCodeResponse
         * @instance
         */
        QueryCodeResponse.prototype.data = $util.newBuffer([]);

        /**
         * Encodes the specified QueryCodeResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryCodeResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodeResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryCodeResponse} m QueryCodeResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryCodeResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_info != null && Object.hasOwnProperty.call(m, 'code_info'))
            $root.cosmwasm.wasm.v1beta1.CodeInfoResponse.encode(
              m.code_info,
              w.uint32(10).fork()
            ).ldelim();
          if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
            w.uint32(18).bytes(m.data);
          return w;
        };

        /**
         * Decodes a QueryCodeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryCodeResponse} QueryCodeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryCodeResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryCodeResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_info = $root.cosmwasm.wasm.v1beta1.CodeInfoResponse.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryCodeResponse;
      })();

      v1beta1.QueryCodesRequest = (function () {
        /**
         * Properties of a QueryCodesRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryCodesRequest
         * @property {cosmos.base.query.v1beta1.IPageRequest|null} [pagination] QueryCodesRequest pagination
         */

        /**
         * Constructs a new QueryCodesRequest.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryCodesRequest.
         * @implements IQueryCodesRequest
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryCodesRequest=} [p] Properties to set
         */
        function QueryCodesRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryCodesRequest pagination.
         * @member {cosmos.base.query.v1beta1.IPageRequest|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryCodesRequest
         * @instance
         */
        QueryCodesRequest.prototype.pagination = null;

        /**
         * Encodes the specified QueryCodesRequest message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryCodesRequest.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodesRequest
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryCodesRequest} m QueryCodesRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryCodesRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageRequest.encode(
              m.pagination,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryCodesRequest message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryCodesRequest} QueryCodesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryCodesRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryCodesRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryCodesRequest;
      })();

      v1beta1.QueryCodesResponse = (function () {
        /**
         * Properties of a QueryCodesResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IQueryCodesResponse
         * @property {Array.<cosmwasm.wasm.v1beta1.ICodeInfoResponse>|null} [code_infos] QueryCodesResponse code_infos
         * @property {cosmos.base.query.v1beta1.IPageResponse|null} [pagination] QueryCodesResponse pagination
         */

        /**
         * Constructs a new QueryCodesResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a QueryCodesResponse.
         * @implements IQueryCodesResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IQueryCodesResponse=} [p] Properties to set
         */
        function QueryCodesResponse(p) {
          this.code_infos = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * QueryCodesResponse code_infos.
         * @member {Array.<cosmwasm.wasm.v1beta1.ICodeInfoResponse>} code_infos
         * @memberof cosmwasm.wasm.v1beta1.QueryCodesResponse
         * @instance
         */
        QueryCodesResponse.prototype.code_infos = $util.emptyArray;

        /**
         * QueryCodesResponse pagination.
         * @member {cosmos.base.query.v1beta1.IPageResponse|null|undefined} pagination
         * @memberof cosmwasm.wasm.v1beta1.QueryCodesResponse
         * @instance
         */
        QueryCodesResponse.prototype.pagination = null;

        /**
         * Encodes the specified QueryCodesResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.QueryCodesResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodesResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IQueryCodesResponse} m QueryCodesResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QueryCodesResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_infos != null && m.code_infos.length) {
            for (var i = 0; i < m.code_infos.length; ++i)
              $root.cosmwasm.wasm.v1beta1.CodeInfoResponse.encode(
                m.code_infos[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, 'pagination')
          )
            $root.cosmos.base.query.v1beta1.PageResponse.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a QueryCodesResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.QueryCodesResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.QueryCodesResponse} QueryCodesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QueryCodesResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.QueryCodesResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.code_infos && m.code_infos.length)) m.code_infos = [];
                m.code_infos.push(
                  $root.cosmwasm.wasm.v1beta1.CodeInfoResponse.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return QueryCodesResponse;
      })();

      v1beta1.StoreCodeProposal = (function () {
        /**
         * Properties of a StoreCodeProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IStoreCodeProposal
         * @property {string|null} [title] StoreCodeProposal title
         * @property {string|null} [description] StoreCodeProposal description
         * @property {string|null} [run_as] StoreCodeProposal run_as
         * @property {Uint8Array|null} [wasm_byte_code] StoreCodeProposal wasm_byte_code
         * @property {string|null} [source] StoreCodeProposal source
         * @property {string|null} [builder] StoreCodeProposal builder
         * @property {cosmwasm.wasm.v1beta1.IAccessConfig|null} [instantiate_permission] StoreCodeProposal instantiate_permission
         */

        /**
         * Constructs a new StoreCodeProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a StoreCodeProposal.
         * @implements IStoreCodeProposal
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IStoreCodeProposal=} [p] Properties to set
         */
        function StoreCodeProposal(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * StoreCodeProposal title.
         * @member {string} title
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @instance
         */
        StoreCodeProposal.prototype.title = '';

        /**
         * StoreCodeProposal description.
         * @member {string} description
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @instance
         */
        StoreCodeProposal.prototype.description = '';

        /**
         * StoreCodeProposal run_as.
         * @member {string} run_as
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @instance
         */
        StoreCodeProposal.prototype.run_as = '';

        /**
         * StoreCodeProposal wasm_byte_code.
         * @member {Uint8Array} wasm_byte_code
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @instance
         */
        StoreCodeProposal.prototype.wasm_byte_code = $util.newBuffer([]);

        /**
         * StoreCodeProposal source.
         * @member {string} source
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @instance
         */
        StoreCodeProposal.prototype.source = '';

        /**
         * StoreCodeProposal builder.
         * @member {string} builder
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @instance
         */
        StoreCodeProposal.prototype.builder = '';

        /**
         * StoreCodeProposal instantiate_permission.
         * @member {cosmwasm.wasm.v1beta1.IAccessConfig|null|undefined} instantiate_permission
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @instance
         */
        StoreCodeProposal.prototype.instantiate_permission = null;

        /**
         * Encodes the specified StoreCodeProposal message. Does not implicitly {@link cosmwasm.wasm.v1beta1.StoreCodeProposal.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @static
         * @param {cosmwasm.wasm.v1beta1.IStoreCodeProposal} m StoreCodeProposal message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StoreCodeProposal.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.title != null && Object.hasOwnProperty.call(m, 'title'))
            w.uint32(10).string(m.title);
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, 'description')
          )
            w.uint32(18).string(m.description);
          if (m.run_as != null && Object.hasOwnProperty.call(m, 'run_as'))
            w.uint32(26).string(m.run_as);
          if (
            m.wasm_byte_code != null &&
            Object.hasOwnProperty.call(m, 'wasm_byte_code')
          )
            w.uint32(34).bytes(m.wasm_byte_code);
          if (m.source != null && Object.hasOwnProperty.call(m, 'source'))
            w.uint32(42).string(m.source);
          if (m.builder != null && Object.hasOwnProperty.call(m, 'builder'))
            w.uint32(50).string(m.builder);
          if (
            m.instantiate_permission != null &&
            Object.hasOwnProperty.call(m, 'instantiate_permission')
          )
            $root.cosmwasm.wasm.v1beta1.AccessConfig.encode(
              m.instantiate_permission,
              w.uint32(58).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a StoreCodeProposal message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.StoreCodeProposal
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.StoreCodeProposal} StoreCodeProposal
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StoreCodeProposal.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.StoreCodeProposal();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.title = r.string();
                break;
              case 2:
                m.description = r.string();
                break;
              case 3:
                m.run_as = r.string();
                break;
              case 4:
                m.wasm_byte_code = r.bytes();
                break;
              case 5:
                m.source = r.string();
                break;
              case 6:
                m.builder = r.string();
                break;
              case 7:
                m.instantiate_permission = $root.cosmwasm.wasm.v1beta1.AccessConfig.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return StoreCodeProposal;
      })();

      v1beta1.InstantiateContractProposal = (function () {
        /**
         * Properties of an InstantiateContractProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IInstantiateContractProposal
         * @property {string|null} [title] InstantiateContractProposal title
         * @property {string|null} [description] InstantiateContractProposal description
         * @property {string|null} [run_as] InstantiateContractProposal run_as
         * @property {string|null} [admin] InstantiateContractProposal admin
         * @property {Long|null} [code_id] InstantiateContractProposal code_id
         * @property {string|null} [label] InstantiateContractProposal label
         * @property {Uint8Array|null} [init_msg] InstantiateContractProposal init_msg
         * @property {Array.<cosmos.base.v1beta1.ICoin>|null} [init_funds] InstantiateContractProposal init_funds
         */

        /**
         * Constructs a new InstantiateContractProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents an InstantiateContractProposal.
         * @implements IInstantiateContractProposal
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IInstantiateContractProposal=} [p] Properties to set
         */
        function InstantiateContractProposal(p) {
          this.init_funds = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * InstantiateContractProposal title.
         * @member {string} title
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.title = '';

        /**
         * InstantiateContractProposal description.
         * @member {string} description
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.description = '';

        /**
         * InstantiateContractProposal run_as.
         * @member {string} run_as
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.run_as = '';

        /**
         * InstantiateContractProposal admin.
         * @member {string} admin
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.admin = '';

        /**
         * InstantiateContractProposal code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * InstantiateContractProposal label.
         * @member {string} label
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.label = '';

        /**
         * InstantiateContractProposal init_msg.
         * @member {Uint8Array} init_msg
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.init_msg = $util.newBuffer([]);

        /**
         * InstantiateContractProposal init_funds.
         * @member {Array.<cosmos.base.v1beta1.ICoin>} init_funds
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @instance
         */
        InstantiateContractProposal.prototype.init_funds = $util.emptyArray;

        /**
         * Encodes the specified InstantiateContractProposal message. Does not implicitly {@link cosmwasm.wasm.v1beta1.InstantiateContractProposal.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @static
         * @param {cosmwasm.wasm.v1beta1.IInstantiateContractProposal} m InstantiateContractProposal message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InstantiateContractProposal.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.title != null && Object.hasOwnProperty.call(m, 'title'))
            w.uint32(10).string(m.title);
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, 'description')
          )
            w.uint32(18).string(m.description);
          if (m.run_as != null && Object.hasOwnProperty.call(m, 'run_as'))
            w.uint32(26).string(m.run_as);
          if (m.admin != null && Object.hasOwnProperty.call(m, 'admin'))
            w.uint32(34).string(m.admin);
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(40).uint64(m.code_id);
          if (m.label != null && Object.hasOwnProperty.call(m, 'label'))
            w.uint32(50).string(m.label);
          if (m.init_msg != null && Object.hasOwnProperty.call(m, 'init_msg'))
            w.uint32(58).bytes(m.init_msg);
          if (m.init_funds != null && m.init_funds.length) {
            for (var i = 0; i < m.init_funds.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.init_funds[i],
                w.uint32(66).fork()
              ).ldelim();
          }
          return w;
        };

        /**
         * Decodes an InstantiateContractProposal message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.InstantiateContractProposal
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.InstantiateContractProposal} InstantiateContractProposal
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InstantiateContractProposal.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.InstantiateContractProposal();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.title = r.string();
                break;
              case 2:
                m.description = r.string();
                break;
              case 3:
                m.run_as = r.string();
                break;
              case 4:
                m.admin = r.string();
                break;
              case 5:
                m.code_id = r.uint64();
                break;
              case 6:
                m.label = r.string();
                break;
              case 7:
                m.init_msg = r.bytes();
                break;
              case 8:
                if (!(m.init_funds && m.init_funds.length)) m.init_funds = [];
                m.init_funds.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return InstantiateContractProposal;
      })();

      v1beta1.MigrateContractProposal = (function () {
        /**
         * Properties of a MigrateContractProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMigrateContractProposal
         * @property {string|null} [title] MigrateContractProposal title
         * @property {string|null} [description] MigrateContractProposal description
         * @property {string|null} [run_as] MigrateContractProposal run_as
         * @property {string|null} [contract] MigrateContractProposal contract
         * @property {Long|null} [code_id] MigrateContractProposal code_id
         * @property {Uint8Array|null} [migrate_msg] MigrateContractProposal migrate_msg
         */

        /**
         * Constructs a new MigrateContractProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MigrateContractProposal.
         * @implements IMigrateContractProposal
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMigrateContractProposal=} [p] Properties to set
         */
        function MigrateContractProposal(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MigrateContractProposal title.
         * @member {string} title
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @instance
         */
        MigrateContractProposal.prototype.title = '';

        /**
         * MigrateContractProposal description.
         * @member {string} description
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @instance
         */
        MigrateContractProposal.prototype.description = '';

        /**
         * MigrateContractProposal run_as.
         * @member {string} run_as
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @instance
         */
        MigrateContractProposal.prototype.run_as = '';

        /**
         * MigrateContractProposal contract.
         * @member {string} contract
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @instance
         */
        MigrateContractProposal.prototype.contract = '';

        /**
         * MigrateContractProposal code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @instance
         */
        MigrateContractProposal.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * MigrateContractProposal migrate_msg.
         * @member {Uint8Array} migrate_msg
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @instance
         */
        MigrateContractProposal.prototype.migrate_msg = $util.newBuffer([]);

        /**
         * Encodes the specified MigrateContractProposal message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MigrateContractProposal.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMigrateContractProposal} m MigrateContractProposal message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MigrateContractProposal.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.title != null && Object.hasOwnProperty.call(m, 'title'))
            w.uint32(10).string(m.title);
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, 'description')
          )
            w.uint32(18).string(m.description);
          if (m.run_as != null && Object.hasOwnProperty.call(m, 'run_as'))
            w.uint32(26).string(m.run_as);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(34).string(m.contract);
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(40).uint64(m.code_id);
          if (
            m.migrate_msg != null &&
            Object.hasOwnProperty.call(m, 'migrate_msg')
          )
            w.uint32(50).bytes(m.migrate_msg);
          return w;
        };

        /**
         * Decodes a MigrateContractProposal message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MigrateContractProposal
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MigrateContractProposal} MigrateContractProposal
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MigrateContractProposal.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MigrateContractProposal();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.title = r.string();
                break;
              case 2:
                m.description = r.string();
                break;
              case 3:
                m.run_as = r.string();
                break;
              case 4:
                m.contract = r.string();
                break;
              case 5:
                m.code_id = r.uint64();
                break;
              case 6:
                m.migrate_msg = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MigrateContractProposal;
      })();

      v1beta1.UpdateAdminProposal = (function () {
        /**
         * Properties of an UpdateAdminProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IUpdateAdminProposal
         * @property {string|null} [title] UpdateAdminProposal title
         * @property {string|null} [description] UpdateAdminProposal description
         * @property {string|null} [new_admin] UpdateAdminProposal new_admin
         * @property {string|null} [contract] UpdateAdminProposal contract
         */

        /**
         * Constructs a new UpdateAdminProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents an UpdateAdminProposal.
         * @implements IUpdateAdminProposal
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IUpdateAdminProposal=} [p] Properties to set
         */
        function UpdateAdminProposal(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * UpdateAdminProposal title.
         * @member {string} title
         * @memberof cosmwasm.wasm.v1beta1.UpdateAdminProposal
         * @instance
         */
        UpdateAdminProposal.prototype.title = '';

        /**
         * UpdateAdminProposal description.
         * @member {string} description
         * @memberof cosmwasm.wasm.v1beta1.UpdateAdminProposal
         * @instance
         */
        UpdateAdminProposal.prototype.description = '';

        /**
         * UpdateAdminProposal new_admin.
         * @member {string} new_admin
         * @memberof cosmwasm.wasm.v1beta1.UpdateAdminProposal
         * @instance
         */
        UpdateAdminProposal.prototype.new_admin = '';

        /**
         * UpdateAdminProposal contract.
         * @member {string} contract
         * @memberof cosmwasm.wasm.v1beta1.UpdateAdminProposal
         * @instance
         */
        UpdateAdminProposal.prototype.contract = '';

        /**
         * Encodes the specified UpdateAdminProposal message. Does not implicitly {@link cosmwasm.wasm.v1beta1.UpdateAdminProposal.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.UpdateAdminProposal
         * @static
         * @param {cosmwasm.wasm.v1beta1.IUpdateAdminProposal} m UpdateAdminProposal message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateAdminProposal.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.title != null && Object.hasOwnProperty.call(m, 'title'))
            w.uint32(10).string(m.title);
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, 'description')
          )
            w.uint32(18).string(m.description);
          if (m.new_admin != null && Object.hasOwnProperty.call(m, 'new_admin'))
            w.uint32(26).string(m.new_admin);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(34).string(m.contract);
          return w;
        };

        /**
         * Decodes an UpdateAdminProposal message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.UpdateAdminProposal
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.UpdateAdminProposal} UpdateAdminProposal
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateAdminProposal.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.UpdateAdminProposal();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.title = r.string();
                break;
              case 2:
                m.description = r.string();
                break;
              case 3:
                m.new_admin = r.string();
                break;
              case 4:
                m.contract = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return UpdateAdminProposal;
      })();

      v1beta1.ClearAdminProposal = (function () {
        /**
         * Properties of a ClearAdminProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IClearAdminProposal
         * @property {string|null} [title] ClearAdminProposal title
         * @property {string|null} [description] ClearAdminProposal description
         * @property {string|null} [contract] ClearAdminProposal contract
         */

        /**
         * Constructs a new ClearAdminProposal.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a ClearAdminProposal.
         * @implements IClearAdminProposal
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IClearAdminProposal=} [p] Properties to set
         */
        function ClearAdminProposal(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * ClearAdminProposal title.
         * @member {string} title
         * @memberof cosmwasm.wasm.v1beta1.ClearAdminProposal
         * @instance
         */
        ClearAdminProposal.prototype.title = '';

        /**
         * ClearAdminProposal description.
         * @member {string} description
         * @memberof cosmwasm.wasm.v1beta1.ClearAdminProposal
         * @instance
         */
        ClearAdminProposal.prototype.description = '';

        /**
         * ClearAdminProposal contract.
         * @member {string} contract
         * @memberof cosmwasm.wasm.v1beta1.ClearAdminProposal
         * @instance
         */
        ClearAdminProposal.prototype.contract = '';

        /**
         * Encodes the specified ClearAdminProposal message. Does not implicitly {@link cosmwasm.wasm.v1beta1.ClearAdminProposal.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.ClearAdminProposal
         * @static
         * @param {cosmwasm.wasm.v1beta1.IClearAdminProposal} m ClearAdminProposal message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClearAdminProposal.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.title != null && Object.hasOwnProperty.call(m, 'title'))
            w.uint32(10).string(m.title);
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, 'description')
          )
            w.uint32(18).string(m.description);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(26).string(m.contract);
          return w;
        };

        /**
         * Decodes a ClearAdminProposal message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.ClearAdminProposal
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.ClearAdminProposal} ClearAdminProposal
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClearAdminProposal.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.ClearAdminProposal();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.title = r.string();
                break;
              case 2:
                m.description = r.string();
                break;
              case 3:
                m.contract = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return ClearAdminProposal;
      })();

      v1beta1.GenesisState = (function () {
        /**
         * Properties of a GenesisState.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IGenesisState
         * @property {cosmwasm.wasm.v1beta1.IParams|null} [params] GenesisState params
         * @property {Array.<cosmwasm.wasm.v1beta1.ICode>|null} [codes] GenesisState codes
         * @property {Array.<cosmwasm.wasm.v1beta1.IContract>|null} [contracts] GenesisState contracts
         * @property {Array.<cosmwasm.wasm.v1beta1.ISequence>|null} [sequences] GenesisState sequences
         * @property {Array.<cosmwasm.wasm.v1beta1.GenesisState.IGenMsgs>|null} [gen_msgs] GenesisState gen_msgs
         */

        /**
         * Constructs a new GenesisState.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a GenesisState.
         * @implements IGenesisState
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IGenesisState=} [p] Properties to set
         */
        function GenesisState(p) {
          this.codes = [];
          this.contracts = [];
          this.sequences = [];
          this.gen_msgs = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * GenesisState params.
         * @member {cosmwasm.wasm.v1beta1.IParams|null|undefined} params
         * @memberof cosmwasm.wasm.v1beta1.GenesisState
         * @instance
         */
        GenesisState.prototype.params = null;

        /**
         * GenesisState codes.
         * @member {Array.<cosmwasm.wasm.v1beta1.ICode>} codes
         * @memberof cosmwasm.wasm.v1beta1.GenesisState
         * @instance
         */
        GenesisState.prototype.codes = $util.emptyArray;

        /**
         * GenesisState contracts.
         * @member {Array.<cosmwasm.wasm.v1beta1.IContract>} contracts
         * @memberof cosmwasm.wasm.v1beta1.GenesisState
         * @instance
         */
        GenesisState.prototype.contracts = $util.emptyArray;

        /**
         * GenesisState sequences.
         * @member {Array.<cosmwasm.wasm.v1beta1.ISequence>} sequences
         * @memberof cosmwasm.wasm.v1beta1.GenesisState
         * @instance
         */
        GenesisState.prototype.sequences = $util.emptyArray;

        /**
         * GenesisState gen_msgs.
         * @member {Array.<cosmwasm.wasm.v1beta1.GenesisState.IGenMsgs>} gen_msgs
         * @memberof cosmwasm.wasm.v1beta1.GenesisState
         * @instance
         */
        GenesisState.prototype.gen_msgs = $util.emptyArray;

        /**
         * Encodes the specified GenesisState message. Does not implicitly {@link cosmwasm.wasm.v1beta1.GenesisState.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.GenesisState
         * @static
         * @param {cosmwasm.wasm.v1beta1.IGenesisState} m GenesisState message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GenesisState.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.params != null && Object.hasOwnProperty.call(m, 'params'))
            $root.cosmwasm.wasm.v1beta1.Params.encode(
              m.params,
              w.uint32(10).fork()
            ).ldelim();
          if (m.codes != null && m.codes.length) {
            for (var i = 0; i < m.codes.length; ++i)
              $root.cosmwasm.wasm.v1beta1.Code.encode(
                m.codes[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (m.contracts != null && m.contracts.length) {
            for (var i = 0; i < m.contracts.length; ++i)
              $root.cosmwasm.wasm.v1beta1.Contract.encode(
                m.contracts[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          if (m.sequences != null && m.sequences.length) {
            for (var i = 0; i < m.sequences.length; ++i)
              $root.cosmwasm.wasm.v1beta1.Sequence.encode(
                m.sequences[i],
                w.uint32(34).fork()
              ).ldelim();
          }
          if (m.gen_msgs != null && m.gen_msgs.length) {
            for (var i = 0; i < m.gen_msgs.length; ++i)
              $root.cosmwasm.wasm.v1beta1.GenesisState.GenMsgs.encode(
                m.gen_msgs[i],
                w.uint32(42).fork()
              ).ldelim();
          }
          return w;
        };

        /**
         * Decodes a GenesisState message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.GenesisState
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.GenesisState} GenesisState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GenesisState.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.GenesisState();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.params = $root.cosmwasm.wasm.v1beta1.Params.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                if (!(m.codes && m.codes.length)) m.codes = [];
                m.codes.push(
                  $root.cosmwasm.wasm.v1beta1.Code.decode(r, r.uint32())
                );
                break;
              case 3:
                if (!(m.contracts && m.contracts.length)) m.contracts = [];
                m.contracts.push(
                  $root.cosmwasm.wasm.v1beta1.Contract.decode(r, r.uint32())
                );
                break;
              case 4:
                if (!(m.sequences && m.sequences.length)) m.sequences = [];
                m.sequences.push(
                  $root.cosmwasm.wasm.v1beta1.Sequence.decode(r, r.uint32())
                );
                break;
              case 5:
                if (!(m.gen_msgs && m.gen_msgs.length)) m.gen_msgs = [];
                m.gen_msgs.push(
                  $root.cosmwasm.wasm.v1beta1.GenesisState.GenMsgs.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        GenesisState.GenMsgs = (function () {
          /**
           * Properties of a GenMsgs.
           * @memberof cosmwasm.wasm.v1beta1.GenesisState
           * @interface IGenMsgs
           * @property {cosmwasm.wasm.v1beta1.IMsgStoreCode|null} [store_code] GenMsgs store_code
           * @property {cosmwasm.wasm.v1beta1.IMsgInstantiateContract|null} [instantiate_contract] GenMsgs instantiate_contract
           * @property {cosmwasm.wasm.v1beta1.IMsgExecuteContract|null} [execute_contract] GenMsgs execute_contract
           */

          /**
           * Constructs a new GenMsgs.
           * @memberof cosmwasm.wasm.v1beta1.GenesisState
           * @classdesc Represents a GenMsgs.
           * @implements IGenMsgs
           * @constructor
           * @param {cosmwasm.wasm.v1beta1.GenesisState.IGenMsgs=} [p] Properties to set
           */
          function GenMsgs(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }

          /**
           * GenMsgs store_code.
           * @member {cosmwasm.wasm.v1beta1.IMsgStoreCode|null|undefined} store_code
           * @memberof cosmwasm.wasm.v1beta1.GenesisState.GenMsgs
           * @instance
           */
          GenMsgs.prototype.store_code = null;

          /**
           * GenMsgs instantiate_contract.
           * @member {cosmwasm.wasm.v1beta1.IMsgInstantiateContract|null|undefined} instantiate_contract
           * @memberof cosmwasm.wasm.v1beta1.GenesisState.GenMsgs
           * @instance
           */
          GenMsgs.prototype.instantiate_contract = null;

          /**
           * GenMsgs execute_contract.
           * @member {cosmwasm.wasm.v1beta1.IMsgExecuteContract|null|undefined} execute_contract
           * @memberof cosmwasm.wasm.v1beta1.GenesisState.GenMsgs
           * @instance
           */
          GenMsgs.prototype.execute_contract = null;

          // OneOf field names bound to virtual getters and setters
          let $oneOfFields;

          /**
           * GenMsgs sum.
           * @member {"store_code"|"instantiate_contract"|"execute_contract"|undefined} sum
           * @memberof cosmwasm.wasm.v1beta1.GenesisState.GenMsgs
           * @instance
           */
          Object.defineProperty(GenMsgs.prototype, 'sum', {
            get: $util.oneOfGetter(
              ($oneOfFields = [
                'store_code',
                'instantiate_contract',
                'execute_contract'
              ])
            ),
            set: $util.oneOfSetter($oneOfFields)
          });

          /**
           * Encodes the specified GenMsgs message. Does not implicitly {@link cosmwasm.wasm.v1beta1.GenesisState.GenMsgs.verify|verify} messages.
           * @function encode
           * @memberof cosmwasm.wasm.v1beta1.GenesisState.GenMsgs
           * @static
           * @param {cosmwasm.wasm.v1beta1.GenesisState.IGenMsgs} m GenMsgs message or plain object to encode
           * @param {$protobuf.Writer} [w] Writer to encode to
           * @returns {$protobuf.Writer} Writer
           */
          GenMsgs.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.store_code != null &&
              Object.hasOwnProperty.call(m, 'store_code')
            )
              $root.cosmwasm.wasm.v1beta1.MsgStoreCode.encode(
                m.store_code,
                w.uint32(10).fork()
              ).ldelim();
            if (
              m.instantiate_contract != null &&
              Object.hasOwnProperty.call(m, 'instantiate_contract')
            )
              $root.cosmwasm.wasm.v1beta1.MsgInstantiateContract.encode(
                m.instantiate_contract,
                w.uint32(18).fork()
              ).ldelim();
            if (
              m.execute_contract != null &&
              Object.hasOwnProperty.call(m, 'execute_contract')
            )
              $root.cosmwasm.wasm.v1beta1.MsgExecuteContract.encode(
                m.execute_contract,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };

          /**
           * Decodes a GenMsgs message from the specified reader or buffer.
           * @function decode
           * @memberof cosmwasm.wasm.v1beta1.GenesisState.GenMsgs
           * @static
           * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
           * @param {number} [l] Message length if known beforehand
           * @returns {cosmwasm.wasm.v1beta1.GenesisState.GenMsgs} GenMsgs
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          GenMsgs.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmwasm.wasm.v1beta1.GenesisState.GenMsgs();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.store_code = $root.cosmwasm.wasm.v1beta1.MsgStoreCode.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.instantiate_contract = $root.cosmwasm.wasm.v1beta1.MsgInstantiateContract.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.execute_contract = $root.cosmwasm.wasm.v1beta1.MsgExecuteContract.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };

          return GenMsgs;
        })();

        return GenesisState;
      })();

      v1beta1.Code = (function () {
        /**
         * Properties of a Code.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface ICode
         * @property {Long|null} [code_id] Code code_id
         * @property {cosmwasm.wasm.v1beta1.ICodeInfo|null} [code_info] Code code_info
         * @property {Uint8Array|null} [code_bytes] Code code_bytes
         */

        /**
         * Constructs a new Code.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a Code.
         * @implements ICode
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.ICode=} [p] Properties to set
         */
        function Code(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * Code code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.Code
         * @instance
         */
        Code.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * Code code_info.
         * @member {cosmwasm.wasm.v1beta1.ICodeInfo|null|undefined} code_info
         * @memberof cosmwasm.wasm.v1beta1.Code
         * @instance
         */
        Code.prototype.code_info = null;

        /**
         * Code code_bytes.
         * @member {Uint8Array} code_bytes
         * @memberof cosmwasm.wasm.v1beta1.Code
         * @instance
         */
        Code.prototype.code_bytes = $util.newBuffer([]);

        /**
         * Encodes the specified Code message. Does not implicitly {@link cosmwasm.wasm.v1beta1.Code.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.Code
         * @static
         * @param {cosmwasm.wasm.v1beta1.ICode} m Code message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Code.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(8).uint64(m.code_id);
          if (m.code_info != null && Object.hasOwnProperty.call(m, 'code_info'))
            $root.cosmwasm.wasm.v1beta1.CodeInfo.encode(
              m.code_info,
              w.uint32(18).fork()
            ).ldelim();
          if (
            m.code_bytes != null &&
            Object.hasOwnProperty.call(m, 'code_bytes')
          )
            w.uint32(26).bytes(m.code_bytes);
          return w;
        };

        /**
         * Decodes a Code message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.Code
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.Code} Code
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Code.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.Code();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_id = r.uint64();
                break;
              case 2:
                m.code_info = $root.cosmwasm.wasm.v1beta1.CodeInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                m.code_bytes = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return Code;
      })();

      v1beta1.Contract = (function () {
        /**
         * Properties of a Contract.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IContract
         * @property {string|null} [contract_address] Contract contract_address
         * @property {cosmwasm.wasm.v1beta1.IContractInfo|null} [contract_info] Contract contract_info
         * @property {Array.<cosmwasm.wasm.v1beta1.IModel>|null} [contract_state] Contract contract_state
         */

        /**
         * Constructs a new Contract.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a Contract.
         * @implements IContract
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IContract=} [p] Properties to set
         */
        function Contract(p) {
          this.contract_state = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * Contract contract_address.
         * @member {string} contract_address
         * @memberof cosmwasm.wasm.v1beta1.Contract
         * @instance
         */
        Contract.prototype.contract_address = '';

        /**
         * Contract contract_info.
         * @member {cosmwasm.wasm.v1beta1.IContractInfo|null|undefined} contract_info
         * @memberof cosmwasm.wasm.v1beta1.Contract
         * @instance
         */
        Contract.prototype.contract_info = null;

        /**
         * Contract contract_state.
         * @member {Array.<cosmwasm.wasm.v1beta1.IModel>} contract_state
         * @memberof cosmwasm.wasm.v1beta1.Contract
         * @instance
         */
        Contract.prototype.contract_state = $util.emptyArray;

        /**
         * Encodes the specified Contract message. Does not implicitly {@link cosmwasm.wasm.v1beta1.Contract.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.Contract
         * @static
         * @param {cosmwasm.wasm.v1beta1.IContract} m Contract message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Contract.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.contract_address != null &&
            Object.hasOwnProperty.call(m, 'contract_address')
          )
            w.uint32(10).string(m.contract_address);
          if (
            m.contract_info != null &&
            Object.hasOwnProperty.call(m, 'contract_info')
          )
            $root.cosmwasm.wasm.v1beta1.ContractInfo.encode(
              m.contract_info,
              w.uint32(18).fork()
            ).ldelim();
          if (m.contract_state != null && m.contract_state.length) {
            for (var i = 0; i < m.contract_state.length; ++i)
              $root.cosmwasm.wasm.v1beta1.Model.encode(
                m.contract_state[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          return w;
        };

        /**
         * Decodes a Contract message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.Contract
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.Contract} Contract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Contract.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.Contract();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.contract_address = r.string();
                break;
              case 2:
                m.contract_info = $root.cosmwasm.wasm.v1beta1.ContractInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                if (!(m.contract_state && m.contract_state.length))
                  m.contract_state = [];
                m.contract_state.push(
                  $root.cosmwasm.wasm.v1beta1.Model.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return Contract;
      })();

      v1beta1.Sequence = (function () {
        /**
         * Properties of a Sequence.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface ISequence
         * @property {Uint8Array|null} [id_key] Sequence id_key
         * @property {Long|null} [value] Sequence value
         */

        /**
         * Constructs a new Sequence.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a Sequence.
         * @implements ISequence
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.ISequence=} [p] Properties to set
         */
        function Sequence(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * Sequence id_key.
         * @member {Uint8Array} id_key
         * @memberof cosmwasm.wasm.v1beta1.Sequence
         * @instance
         */
        Sequence.prototype.id_key = $util.newBuffer([]);

        /**
         * Sequence value.
         * @member {Long} value
         * @memberof cosmwasm.wasm.v1beta1.Sequence
         * @instance
         */
        Sequence.prototype.value = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * Encodes the specified Sequence message. Does not implicitly {@link cosmwasm.wasm.v1beta1.Sequence.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.Sequence
         * @static
         * @param {cosmwasm.wasm.v1beta1.ISequence} m Sequence message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sequence.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.id_key != null && Object.hasOwnProperty.call(m, 'id_key'))
            w.uint32(10).bytes(m.id_key);
          if (m.value != null && Object.hasOwnProperty.call(m, 'value'))
            w.uint32(16).uint64(m.value);
          return w;
        };

        /**
         * Decodes a Sequence message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.Sequence
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.Sequence} Sequence
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sequence.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.Sequence();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.id_key = r.bytes();
                break;
              case 2:
                m.value = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return Sequence;
      })();

      v1beta1.MsgStoreCode = (function () {
        /**
         * Properties of a MsgStoreCode.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgStoreCode
         * @property {string|null} [sender] MsgStoreCode sender
         * @property {Uint8Array|null} [wasm_byte_code] MsgStoreCode wasm_byte_code
         * @property {string|null} [source] MsgStoreCode source
         * @property {string|null} [builder] MsgStoreCode builder
         * @property {cosmwasm.wasm.v1beta1.IAccessConfig|null} [instantiate_permission] MsgStoreCode instantiate_permission
         */

        /**
         * Constructs a new MsgStoreCode.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgStoreCode.
         * @implements IMsgStoreCode
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgStoreCode=} [p] Properties to set
         */
        function MsgStoreCode(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgStoreCode sender.
         * @member {string} sender
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCode
         * @instance
         */
        MsgStoreCode.prototype.sender = '';

        /**
         * MsgStoreCode wasm_byte_code.
         * @member {Uint8Array} wasm_byte_code
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCode
         * @instance
         */
        MsgStoreCode.prototype.wasm_byte_code = $util.newBuffer([]);

        /**
         * MsgStoreCode source.
         * @member {string} source
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCode
         * @instance
         */
        MsgStoreCode.prototype.source = '';

        /**
         * MsgStoreCode builder.
         * @member {string} builder
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCode
         * @instance
         */
        MsgStoreCode.prototype.builder = '';

        /**
         * MsgStoreCode instantiate_permission.
         * @member {cosmwasm.wasm.v1beta1.IAccessConfig|null|undefined} instantiate_permission
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCode
         * @instance
         */
        MsgStoreCode.prototype.instantiate_permission = null;

        /**
         * Encodes the specified MsgStoreCode message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgStoreCode.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCode
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgStoreCode} m MsgStoreCode message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgStoreCode.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
            w.uint32(10).string(m.sender);
          if (
            m.wasm_byte_code != null &&
            Object.hasOwnProperty.call(m, 'wasm_byte_code')
          )
            w.uint32(18).bytes(m.wasm_byte_code);
          if (m.source != null && Object.hasOwnProperty.call(m, 'source'))
            w.uint32(26).string(m.source);
          if (m.builder != null && Object.hasOwnProperty.call(m, 'builder'))
            w.uint32(34).string(m.builder);
          if (
            m.instantiate_permission != null &&
            Object.hasOwnProperty.call(m, 'instantiate_permission')
          )
            $root.cosmwasm.wasm.v1beta1.AccessConfig.encode(
              m.instantiate_permission,
              w.uint32(42).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a MsgStoreCode message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCode
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgStoreCode} MsgStoreCode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgStoreCode.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgStoreCode();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.wasm_byte_code = r.bytes();
                break;
              case 3:
                m.source = r.string();
                break;
              case 4:
                m.builder = r.string();
                break;
              case 5:
                m.instantiate_permission = $root.cosmwasm.wasm.v1beta1.AccessConfig.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgStoreCode;
      })();

      v1beta1.MsgStoreCodeResponse = (function () {
        /**
         * Properties of a MsgStoreCodeResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgStoreCodeResponse
         * @property {Long|null} [code_id] MsgStoreCodeResponse code_id
         */

        /**
         * Constructs a new MsgStoreCodeResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgStoreCodeResponse.
         * @implements IMsgStoreCodeResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgStoreCodeResponse=} [p] Properties to set
         */
        function MsgStoreCodeResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgStoreCodeResponse code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCodeResponse
         * @instance
         */
        MsgStoreCodeResponse.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * Encodes the specified MsgStoreCodeResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgStoreCodeResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCodeResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgStoreCodeResponse} m MsgStoreCodeResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgStoreCodeResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(8).uint64(m.code_id);
          return w;
        };

        /**
         * Decodes a MsgStoreCodeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgStoreCodeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgStoreCodeResponse} MsgStoreCodeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgStoreCodeResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgStoreCodeResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_id = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgStoreCodeResponse;
      })();

      v1beta1.MsgInstantiateContract = (function () {
        /**
         * Properties of a MsgInstantiateContract.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgInstantiateContract
         * @property {string|null} [sender] MsgInstantiateContract sender
         * @property {string|null} [admin] MsgInstantiateContract admin
         * @property {Long|null} [code_id] MsgInstantiateContract code_id
         * @property {string|null} [label] MsgInstantiateContract label
         * @property {Uint8Array|null} [init_msg] MsgInstantiateContract init_msg
         * @property {Array.<cosmos.base.v1beta1.ICoin>|null} [init_funds] MsgInstantiateContract init_funds
         */

        /**
         * Constructs a new MsgInstantiateContract.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgInstantiateContract.
         * @implements IMsgInstantiateContract
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgInstantiateContract=} [p] Properties to set
         */
        function MsgInstantiateContract(p) {
          this.init_funds = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgInstantiateContract sender.
         * @member {string} sender
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @instance
         */
        MsgInstantiateContract.prototype.sender = '';

        /**
         * MsgInstantiateContract admin.
         * @member {string} admin
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @instance
         */
        MsgInstantiateContract.prototype.admin = '';

        /**
         * MsgInstantiateContract code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @instance
         */
        MsgInstantiateContract.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * MsgInstantiateContract label.
         * @member {string} label
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @instance
         */
        MsgInstantiateContract.prototype.label = '';

        /**
         * MsgInstantiateContract init_msg.
         * @member {Uint8Array} init_msg
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @instance
         */
        MsgInstantiateContract.prototype.init_msg = $util.newBuffer([]);

        /**
         * MsgInstantiateContract init_funds.
         * @member {Array.<cosmos.base.v1beta1.ICoin>} init_funds
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @instance
         */
        MsgInstantiateContract.prototype.init_funds = $util.emptyArray;

        /**
         * Encodes the specified MsgInstantiateContract message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgInstantiateContract.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgInstantiateContract} m MsgInstantiateContract message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgInstantiateContract.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
            w.uint32(10).string(m.sender);
          if (m.admin != null && Object.hasOwnProperty.call(m, 'admin'))
            w.uint32(18).string(m.admin);
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(24).uint64(m.code_id);
          if (m.label != null && Object.hasOwnProperty.call(m, 'label'))
            w.uint32(34).string(m.label);
          if (m.init_msg != null && Object.hasOwnProperty.call(m, 'init_msg'))
            w.uint32(42).bytes(m.init_msg);
          if (m.init_funds != null && m.init_funds.length) {
            for (var i = 0; i < m.init_funds.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.init_funds[i],
                w.uint32(50).fork()
              ).ldelim();
          }
          return w;
        };

        /**
         * Decodes a MsgInstantiateContract message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgInstantiateContract} MsgInstantiateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgInstantiateContract.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgInstantiateContract();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.admin = r.string();
                break;
              case 3:
                m.code_id = r.uint64();
                break;
              case 4:
                m.label = r.string();
                break;
              case 5:
                m.init_msg = r.bytes();
                break;
              case 6:
                if (!(m.init_funds && m.init_funds.length)) m.init_funds = [];
                m.init_funds.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgInstantiateContract;
      })();

      v1beta1.MsgInstantiateContractResponse = (function () {
        /**
         * Properties of a MsgInstantiateContractResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgInstantiateContractResponse
         * @property {string|null} [address] MsgInstantiateContractResponse address
         */

        /**
         * Constructs a new MsgInstantiateContractResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgInstantiateContractResponse.
         * @implements IMsgInstantiateContractResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgInstantiateContractResponse=} [p] Properties to set
         */
        function MsgInstantiateContractResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgInstantiateContractResponse address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContractResponse
         * @instance
         */
        MsgInstantiateContractResponse.prototype.address = '';

        /**
         * Encodes the specified MsgInstantiateContractResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgInstantiateContractResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContractResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgInstantiateContractResponse} m MsgInstantiateContractResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgInstantiateContractResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(10).string(m.address);
          return w;
        };

        /**
         * Decodes a MsgInstantiateContractResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgInstantiateContractResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgInstantiateContractResponse} MsgInstantiateContractResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgInstantiateContractResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgInstantiateContractResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgInstantiateContractResponse;
      })();

      v1beta1.MsgExecuteContract = (function () {
        /**
         * Properties of a MsgExecuteContract.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgExecuteContract
         * @property {string|null} [sender] MsgExecuteContract sender
         * @property {string|null} [contract] MsgExecuteContract contract
         * @property {Uint8Array|null} [msg] MsgExecuteContract msg
         * @property {Array.<cosmos.base.v1beta1.ICoin>|null} [sent_funds] MsgExecuteContract sent_funds
         */

        /**
         * Constructs a new MsgExecuteContract.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgExecuteContract.
         * @implements IMsgExecuteContract
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgExecuteContract=} [p] Properties to set
         */
        function MsgExecuteContract(p) {
          this.sent_funds = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgExecuteContract sender.
         * @member {string} sender
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContract
         * @instance
         */
        MsgExecuteContract.prototype.sender = '';

        /**
         * MsgExecuteContract contract.
         * @member {string} contract
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContract
         * @instance
         */
        MsgExecuteContract.prototype.contract = '';

        /**
         * MsgExecuteContract msg.
         * @member {Uint8Array} msg
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContract
         * @instance
         */
        MsgExecuteContract.prototype.msg = $util.newBuffer([]);

        /**
         * MsgExecuteContract sent_funds.
         * @member {Array.<cosmos.base.v1beta1.ICoin>} sent_funds
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContract
         * @instance
         */
        MsgExecuteContract.prototype.sent_funds = $util.emptyArray;

        /**
         * Encodes the specified MsgExecuteContract message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgExecuteContract.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContract
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgExecuteContract} m MsgExecuteContract message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgExecuteContract.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
            w.uint32(10).string(m.sender);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(18).string(m.contract);
          if (m.msg != null && Object.hasOwnProperty.call(m, 'msg'))
            w.uint32(26).bytes(m.msg);
          if (m.sent_funds != null && m.sent_funds.length) {
            for (var i = 0; i < m.sent_funds.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.sent_funds[i],
                w.uint32(42).fork()
              ).ldelim();
          }
          return w;
        };

        /**
         * Decodes a MsgExecuteContract message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgExecuteContract} MsgExecuteContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgExecuteContract.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgExecuteContract();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.contract = r.string();
                break;
              case 3:
                m.msg = r.bytes();
                break;
              case 5:
                if (!(m.sent_funds && m.sent_funds.length)) m.sent_funds = [];
                m.sent_funds.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgExecuteContract;
      })();

      v1beta1.MsgExecuteContractResponse = (function () {
        /**
         * Properties of a MsgExecuteContractResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgExecuteContractResponse
         * @property {Uint8Array|null} [data] MsgExecuteContractResponse data
         */

        /**
         * Constructs a new MsgExecuteContractResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgExecuteContractResponse.
         * @implements IMsgExecuteContractResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgExecuteContractResponse=} [p] Properties to set
         */
        function MsgExecuteContractResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgExecuteContractResponse data.
         * @member {Uint8Array} data
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContractResponse
         * @instance
         */
        MsgExecuteContractResponse.prototype.data = $util.newBuffer([]);

        /**
         * Encodes the specified MsgExecuteContractResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgExecuteContractResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContractResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgExecuteContractResponse} m MsgExecuteContractResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgExecuteContractResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
            w.uint32(10).bytes(m.data);
          return w;
        };

        /**
         * Decodes a MsgExecuteContractResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgExecuteContractResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgExecuteContractResponse} MsgExecuteContractResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgExecuteContractResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgExecuteContractResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgExecuteContractResponse;
      })();

      v1beta1.MsgMigrateContract = (function () {
        /**
         * Properties of a MsgMigrateContract.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgMigrateContract
         * @property {string|null} [sender] MsgMigrateContract sender
         * @property {string|null} [contract] MsgMigrateContract contract
         * @property {Long|null} [code_id] MsgMigrateContract code_id
         * @property {Uint8Array|null} [migrate_msg] MsgMigrateContract migrate_msg
         */

        /**
         * Constructs a new MsgMigrateContract.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgMigrateContract.
         * @implements IMsgMigrateContract
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgMigrateContract=} [p] Properties to set
         */
        function MsgMigrateContract(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgMigrateContract sender.
         * @member {string} sender
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContract
         * @instance
         */
        MsgMigrateContract.prototype.sender = '';

        /**
         * MsgMigrateContract contract.
         * @member {string} contract
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContract
         * @instance
         */
        MsgMigrateContract.prototype.contract = '';

        /**
         * MsgMigrateContract code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContract
         * @instance
         */
        MsgMigrateContract.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * MsgMigrateContract migrate_msg.
         * @member {Uint8Array} migrate_msg
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContract
         * @instance
         */
        MsgMigrateContract.prototype.migrate_msg = $util.newBuffer([]);

        /**
         * Encodes the specified MsgMigrateContract message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgMigrateContract.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContract
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgMigrateContract} m MsgMigrateContract message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgMigrateContract.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
            w.uint32(10).string(m.sender);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(18).string(m.contract);
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(24).uint64(m.code_id);
          if (
            m.migrate_msg != null &&
            Object.hasOwnProperty.call(m, 'migrate_msg')
          )
            w.uint32(34).bytes(m.migrate_msg);
          return w;
        };

        /**
         * Decodes a MsgMigrateContract message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgMigrateContract} MsgMigrateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgMigrateContract.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgMigrateContract();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.contract = r.string();
                break;
              case 3:
                m.code_id = r.uint64();
                break;
              case 4:
                m.migrate_msg = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgMigrateContract;
      })();

      v1beta1.MsgMigrateContractResponse = (function () {
        /**
         * Properties of a MsgMigrateContractResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgMigrateContractResponse
         * @property {Uint8Array|null} [data] MsgMigrateContractResponse data
         */

        /**
         * Constructs a new MsgMigrateContractResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgMigrateContractResponse.
         * @implements IMsgMigrateContractResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgMigrateContractResponse=} [p] Properties to set
         */
        function MsgMigrateContractResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgMigrateContractResponse data.
         * @member {Uint8Array} data
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContractResponse
         * @instance
         */
        MsgMigrateContractResponse.prototype.data = $util.newBuffer([]);

        /**
         * Encodes the specified MsgMigrateContractResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgMigrateContractResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContractResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgMigrateContractResponse} m MsgMigrateContractResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgMigrateContractResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
            w.uint32(10).bytes(m.data);
          return w;
        };

        /**
         * Decodes a MsgMigrateContractResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgMigrateContractResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgMigrateContractResponse} MsgMigrateContractResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgMigrateContractResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgMigrateContractResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgMigrateContractResponse;
      })();

      v1beta1.MsgUpdateAdmin = (function () {
        /**
         * Properties of a MsgUpdateAdmin.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgUpdateAdmin
         * @property {string|null} [sender] MsgUpdateAdmin sender
         * @property {string|null} [new_admin] MsgUpdateAdmin new_admin
         * @property {string|null} [contract] MsgUpdateAdmin contract
         */

        /**
         * Constructs a new MsgUpdateAdmin.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgUpdateAdmin.
         * @implements IMsgUpdateAdmin
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgUpdateAdmin=} [p] Properties to set
         */
        function MsgUpdateAdmin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgUpdateAdmin sender.
         * @member {string} sender
         * @memberof cosmwasm.wasm.v1beta1.MsgUpdateAdmin
         * @instance
         */
        MsgUpdateAdmin.prototype.sender = '';

        /**
         * MsgUpdateAdmin new_admin.
         * @member {string} new_admin
         * @memberof cosmwasm.wasm.v1beta1.MsgUpdateAdmin
         * @instance
         */
        MsgUpdateAdmin.prototype.new_admin = '';

        /**
         * MsgUpdateAdmin contract.
         * @member {string} contract
         * @memberof cosmwasm.wasm.v1beta1.MsgUpdateAdmin
         * @instance
         */
        MsgUpdateAdmin.prototype.contract = '';

        /**
         * Encodes the specified MsgUpdateAdmin message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgUpdateAdmin.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgUpdateAdmin
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgUpdateAdmin} m MsgUpdateAdmin message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgUpdateAdmin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
            w.uint32(10).string(m.sender);
          if (m.new_admin != null && Object.hasOwnProperty.call(m, 'new_admin'))
            w.uint32(18).string(m.new_admin);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(26).string(m.contract);
          return w;
        };

        /**
         * Decodes a MsgUpdateAdmin message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgUpdateAdmin
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgUpdateAdmin} MsgUpdateAdmin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgUpdateAdmin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgUpdateAdmin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.new_admin = r.string();
                break;
              case 3:
                m.contract = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgUpdateAdmin;
      })();

      v1beta1.MsgUpdateAdminResponse = (function () {
        /**
         * Properties of a MsgUpdateAdminResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgUpdateAdminResponse
         */

        /**
         * Constructs a new MsgUpdateAdminResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgUpdateAdminResponse.
         * @implements IMsgUpdateAdminResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgUpdateAdminResponse=} [p] Properties to set
         */
        function MsgUpdateAdminResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * Encodes the specified MsgUpdateAdminResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgUpdateAdminResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgUpdateAdminResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgUpdateAdminResponse} m MsgUpdateAdminResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgUpdateAdminResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };

        /**
         * Decodes a MsgUpdateAdminResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgUpdateAdminResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgUpdateAdminResponse} MsgUpdateAdminResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgUpdateAdminResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgUpdateAdminResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgUpdateAdminResponse;
      })();

      v1beta1.MsgClearAdmin = (function () {
        /**
         * Properties of a MsgClearAdmin.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgClearAdmin
         * @property {string|null} [sender] MsgClearAdmin sender
         * @property {string|null} [contract] MsgClearAdmin contract
         */

        /**
         * Constructs a new MsgClearAdmin.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgClearAdmin.
         * @implements IMsgClearAdmin
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgClearAdmin=} [p] Properties to set
         */
        function MsgClearAdmin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * MsgClearAdmin sender.
         * @member {string} sender
         * @memberof cosmwasm.wasm.v1beta1.MsgClearAdmin
         * @instance
         */
        MsgClearAdmin.prototype.sender = '';

        /**
         * MsgClearAdmin contract.
         * @member {string} contract
         * @memberof cosmwasm.wasm.v1beta1.MsgClearAdmin
         * @instance
         */
        MsgClearAdmin.prototype.contract = '';

        /**
         * Encodes the specified MsgClearAdmin message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgClearAdmin.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgClearAdmin
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgClearAdmin} m MsgClearAdmin message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgClearAdmin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
            w.uint32(10).string(m.sender);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(26).string(m.contract);
          return w;
        };

        /**
         * Decodes a MsgClearAdmin message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgClearAdmin
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgClearAdmin} MsgClearAdmin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgClearAdmin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgClearAdmin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 3:
                m.contract = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgClearAdmin;
      })();

      v1beta1.MsgClearAdminResponse = (function () {
        /**
         * Properties of a MsgClearAdminResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IMsgClearAdminResponse
         */

        /**
         * Constructs a new MsgClearAdminResponse.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a MsgClearAdminResponse.
         * @implements IMsgClearAdminResponse
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IMsgClearAdminResponse=} [p] Properties to set
         */
        function MsgClearAdminResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * Encodes the specified MsgClearAdminResponse message. Does not implicitly {@link cosmwasm.wasm.v1beta1.MsgClearAdminResponse.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.MsgClearAdminResponse
         * @static
         * @param {cosmwasm.wasm.v1beta1.IMsgClearAdminResponse} m MsgClearAdminResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgClearAdminResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };

        /**
         * Decodes a MsgClearAdminResponse message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.MsgClearAdminResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.MsgClearAdminResponse} MsgClearAdminResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgClearAdminResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.MsgClearAdminResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return MsgClearAdminResponse;
      })();

      /**
       * AccessType enum.
       * @name cosmwasm.wasm.v1beta1.AccessType
       * @enum {number}
       * @property {number} ACCESS_TYPE_UNSPECIFIED=0 ACCESS_TYPE_UNSPECIFIED value
       * @property {number} ACCESS_TYPE_NOBODY=1 ACCESS_TYPE_NOBODY value
       * @property {number} ACCESS_TYPE_ONLY_ADDRESS=2 ACCESS_TYPE_ONLY_ADDRESS value
       * @property {number} ACCESS_TYPE_EVERYBODY=3 ACCESS_TYPE_EVERYBODY value
       */
      v1beta1.AccessType = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = 'ACCESS_TYPE_UNSPECIFIED')] = 0;
        values[(valuesById[1] = 'ACCESS_TYPE_NOBODY')] = 1;
        values[(valuesById[2] = 'ACCESS_TYPE_ONLY_ADDRESS')] = 2;
        values[(valuesById[3] = 'ACCESS_TYPE_EVERYBODY')] = 3;
        return values;
      })();

      v1beta1.AccessTypeParam = (function () {
        /**
         * Properties of an AccessTypeParam.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IAccessTypeParam
         * @property {cosmwasm.wasm.v1beta1.AccessType|null} [value] AccessTypeParam value
         */

        /**
         * Constructs a new AccessTypeParam.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents an AccessTypeParam.
         * @implements IAccessTypeParam
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IAccessTypeParam=} [p] Properties to set
         */
        function AccessTypeParam(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * AccessTypeParam value.
         * @member {cosmwasm.wasm.v1beta1.AccessType} value
         * @memberof cosmwasm.wasm.v1beta1.AccessTypeParam
         * @instance
         */
        AccessTypeParam.prototype.value = 0;

        /**
         * Encodes the specified AccessTypeParam message. Does not implicitly {@link cosmwasm.wasm.v1beta1.AccessTypeParam.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.AccessTypeParam
         * @static
         * @param {cosmwasm.wasm.v1beta1.IAccessTypeParam} m AccessTypeParam message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AccessTypeParam.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.value != null && Object.hasOwnProperty.call(m, 'value'))
            w.uint32(8).int32(m.value);
          return w;
        };

        /**
         * Decodes an AccessTypeParam message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.AccessTypeParam
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.AccessTypeParam} AccessTypeParam
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AccessTypeParam.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.AccessTypeParam();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.value = r.int32();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return AccessTypeParam;
      })();

      v1beta1.AccessConfig = (function () {
        /**
         * Properties of an AccessConfig.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IAccessConfig
         * @property {cosmwasm.wasm.v1beta1.AccessType|null} [permission] AccessConfig permission
         * @property {string|null} [address] AccessConfig address
         */

        /**
         * Constructs a new AccessConfig.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents an AccessConfig.
         * @implements IAccessConfig
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IAccessConfig=} [p] Properties to set
         */
        function AccessConfig(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * AccessConfig permission.
         * @member {cosmwasm.wasm.v1beta1.AccessType} permission
         * @memberof cosmwasm.wasm.v1beta1.AccessConfig
         * @instance
         */
        AccessConfig.prototype.permission = 0;

        /**
         * AccessConfig address.
         * @member {string} address
         * @memberof cosmwasm.wasm.v1beta1.AccessConfig
         * @instance
         */
        AccessConfig.prototype.address = '';

        /**
         * Encodes the specified AccessConfig message. Does not implicitly {@link cosmwasm.wasm.v1beta1.AccessConfig.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.AccessConfig
         * @static
         * @param {cosmwasm.wasm.v1beta1.IAccessConfig} m AccessConfig message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AccessConfig.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.permission != null &&
            Object.hasOwnProperty.call(m, 'permission')
          )
            w.uint32(8).int32(m.permission);
          if (m.address != null && Object.hasOwnProperty.call(m, 'address'))
            w.uint32(18).string(m.address);
          return w;
        };

        /**
         * Decodes an AccessConfig message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.AccessConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.AccessConfig} AccessConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AccessConfig.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.AccessConfig();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.permission = r.int32();
                break;
              case 2:
                m.address = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return AccessConfig;
      })();

      v1beta1.Params = (function () {
        /**
         * Properties of a Params.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IParams
         * @property {cosmwasm.wasm.v1beta1.IAccessConfig|null} [code_upload_access] Params code_upload_access
         * @property {cosmwasm.wasm.v1beta1.AccessType|null} [instantiate_default_permission] Params instantiate_default_permission
         * @property {Long|null} [max_wasm_code_size] Params max_wasm_code_size
         */

        /**
         * Constructs a new Params.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a Params.
         * @implements IParams
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IParams=} [p] Properties to set
         */
        function Params(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * Params code_upload_access.
         * @member {cosmwasm.wasm.v1beta1.IAccessConfig|null|undefined} code_upload_access
         * @memberof cosmwasm.wasm.v1beta1.Params
         * @instance
         */
        Params.prototype.code_upload_access = null;

        /**
         * Params instantiate_default_permission.
         * @member {cosmwasm.wasm.v1beta1.AccessType} instantiate_default_permission
         * @memberof cosmwasm.wasm.v1beta1.Params
         * @instance
         */
        Params.prototype.instantiate_default_permission = 0;

        /**
         * Params max_wasm_code_size.
         * @member {Long} max_wasm_code_size
         * @memberof cosmwasm.wasm.v1beta1.Params
         * @instance
         */
        Params.prototype.max_wasm_code_size = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * Encodes the specified Params message. Does not implicitly {@link cosmwasm.wasm.v1beta1.Params.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.Params
         * @static
         * @param {cosmwasm.wasm.v1beta1.IParams} m Params message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Params.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.code_upload_access != null &&
            Object.hasOwnProperty.call(m, 'code_upload_access')
          )
            $root.cosmwasm.wasm.v1beta1.AccessConfig.encode(
              m.code_upload_access,
              w.uint32(10).fork()
            ).ldelim();
          if (
            m.instantiate_default_permission != null &&
            Object.hasOwnProperty.call(m, 'instantiate_default_permission')
          )
            w.uint32(16).int32(m.instantiate_default_permission);
          if (
            m.max_wasm_code_size != null &&
            Object.hasOwnProperty.call(m, 'max_wasm_code_size')
          )
            w.uint32(24).uint64(m.max_wasm_code_size);
          return w;
        };

        /**
         * Decodes a Params message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.Params
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.Params} Params
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Params.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.Params();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_upload_access = $root.cosmwasm.wasm.v1beta1.AccessConfig.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.instantiate_default_permission = r.int32();
                break;
              case 3:
                m.max_wasm_code_size = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return Params;
      })();

      v1beta1.CodeInfo = (function () {
        /**
         * Properties of a CodeInfo.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface ICodeInfo
         * @property {Uint8Array|null} [code_hash] CodeInfo code_hash
         * @property {string|null} [creator] CodeInfo creator
         * @property {string|null} [source] CodeInfo source
         * @property {string|null} [builder] CodeInfo builder
         * @property {cosmwasm.wasm.v1beta1.IAccessConfig|null} [instantiate_config] CodeInfo instantiate_config
         */

        /**
         * Constructs a new CodeInfo.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a CodeInfo.
         * @implements ICodeInfo
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.ICodeInfo=} [p] Properties to set
         */
        function CodeInfo(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * CodeInfo code_hash.
         * @member {Uint8Array} code_hash
         * @memberof cosmwasm.wasm.v1beta1.CodeInfo
         * @instance
         */
        CodeInfo.prototype.code_hash = $util.newBuffer([]);

        /**
         * CodeInfo creator.
         * @member {string} creator
         * @memberof cosmwasm.wasm.v1beta1.CodeInfo
         * @instance
         */
        CodeInfo.prototype.creator = '';

        /**
         * CodeInfo source.
         * @member {string} source
         * @memberof cosmwasm.wasm.v1beta1.CodeInfo
         * @instance
         */
        CodeInfo.prototype.source = '';

        /**
         * CodeInfo builder.
         * @member {string} builder
         * @memberof cosmwasm.wasm.v1beta1.CodeInfo
         * @instance
         */
        CodeInfo.prototype.builder = '';

        /**
         * CodeInfo instantiate_config.
         * @member {cosmwasm.wasm.v1beta1.IAccessConfig|null|undefined} instantiate_config
         * @memberof cosmwasm.wasm.v1beta1.CodeInfo
         * @instance
         */
        CodeInfo.prototype.instantiate_config = null;

        /**
         * Encodes the specified CodeInfo message. Does not implicitly {@link cosmwasm.wasm.v1beta1.CodeInfo.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.CodeInfo
         * @static
         * @param {cosmwasm.wasm.v1beta1.ICodeInfo} m CodeInfo message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CodeInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_hash != null && Object.hasOwnProperty.call(m, 'code_hash'))
            w.uint32(10).bytes(m.code_hash);
          if (m.creator != null && Object.hasOwnProperty.call(m, 'creator'))
            w.uint32(18).string(m.creator);
          if (m.source != null && Object.hasOwnProperty.call(m, 'source'))
            w.uint32(26).string(m.source);
          if (m.builder != null && Object.hasOwnProperty.call(m, 'builder'))
            w.uint32(34).string(m.builder);
          if (
            m.instantiate_config != null &&
            Object.hasOwnProperty.call(m, 'instantiate_config')
          )
            $root.cosmwasm.wasm.v1beta1.AccessConfig.encode(
              m.instantiate_config,
              w.uint32(42).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a CodeInfo message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.CodeInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.CodeInfo} CodeInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CodeInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.CodeInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_hash = r.bytes();
                break;
              case 2:
                m.creator = r.string();
                break;
              case 3:
                m.source = r.string();
                break;
              case 4:
                m.builder = r.string();
                break;
              case 5:
                m.instantiate_config = $root.cosmwasm.wasm.v1beta1.AccessConfig.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return CodeInfo;
      })();

      v1beta1.ContractInfo = (function () {
        /**
         * Properties of a ContractInfo.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IContractInfo
         * @property {Long|null} [code_id] ContractInfo code_id
         * @property {string|null} [creator] ContractInfo creator
         * @property {string|null} [admin] ContractInfo admin
         * @property {string|null} [label] ContractInfo label
         * @property {cosmwasm.wasm.v1beta1.IAbsoluteTxPosition|null} [created] ContractInfo created
         */

        /**
         * Constructs a new ContractInfo.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a ContractInfo.
         * @implements IContractInfo
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IContractInfo=} [p] Properties to set
         */
        function ContractInfo(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * ContractInfo code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.ContractInfo
         * @instance
         */
        ContractInfo.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * ContractInfo creator.
         * @member {string} creator
         * @memberof cosmwasm.wasm.v1beta1.ContractInfo
         * @instance
         */
        ContractInfo.prototype.creator = '';

        /**
         * ContractInfo admin.
         * @member {string} admin
         * @memberof cosmwasm.wasm.v1beta1.ContractInfo
         * @instance
         */
        ContractInfo.prototype.admin = '';

        /**
         * ContractInfo label.
         * @member {string} label
         * @memberof cosmwasm.wasm.v1beta1.ContractInfo
         * @instance
         */
        ContractInfo.prototype.label = '';

        /**
         * ContractInfo created.
         * @member {cosmwasm.wasm.v1beta1.IAbsoluteTxPosition|null|undefined} created
         * @memberof cosmwasm.wasm.v1beta1.ContractInfo
         * @instance
         */
        ContractInfo.prototype.created = null;

        /**
         * Encodes the specified ContractInfo message. Does not implicitly {@link cosmwasm.wasm.v1beta1.ContractInfo.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.ContractInfo
         * @static
         * @param {cosmwasm.wasm.v1beta1.IContractInfo} m ContractInfo message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ContractInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(8).uint64(m.code_id);
          if (m.creator != null && Object.hasOwnProperty.call(m, 'creator'))
            w.uint32(18).string(m.creator);
          if (m.admin != null && Object.hasOwnProperty.call(m, 'admin'))
            w.uint32(26).string(m.admin);
          if (m.label != null && Object.hasOwnProperty.call(m, 'label'))
            w.uint32(34).string(m.label);
          if (m.created != null && Object.hasOwnProperty.call(m, 'created'))
            $root.cosmwasm.wasm.v1beta1.AbsoluteTxPosition.encode(
              m.created,
              w.uint32(42).fork()
            ).ldelim();
          return w;
        };

        /**
         * Decodes a ContractInfo message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.ContractInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.ContractInfo} ContractInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ContractInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.ContractInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.code_id = r.uint64();
                break;
              case 2:
                m.creator = r.string();
                break;
              case 3:
                m.admin = r.string();
                break;
              case 4:
                m.label = r.string();
                break;
              case 5:
                m.created = $root.cosmwasm.wasm.v1beta1.AbsoluteTxPosition.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return ContractInfo;
      })();

      /**
       * ContractCodeHistoryOperationType enum.
       * @name cosmwasm.wasm.v1beta1.ContractCodeHistoryOperationType
       * @enum {number}
       * @property {number} CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED=0 CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED value
       * @property {number} CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT=1 CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT value
       * @property {number} CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE=2 CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE value
       * @property {number} CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS=3 CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS value
       */
      v1beta1.ContractCodeHistoryOperationType = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[
          (valuesById[0] = 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED')
        ] = 0;
        values[
          (valuesById[1] = 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT')
        ] = 1;
        values[
          (valuesById[2] = 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE')
        ] = 2;
        values[
          (valuesById[3] = 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS')
        ] = 3;
        return values;
      })();

      v1beta1.ContractCodeHistoryEntry = (function () {
        /**
         * Properties of a ContractCodeHistoryEntry.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IContractCodeHistoryEntry
         * @property {cosmwasm.wasm.v1beta1.ContractCodeHistoryOperationType|null} [operation] ContractCodeHistoryEntry operation
         * @property {Long|null} [code_id] ContractCodeHistoryEntry code_id
         * @property {cosmwasm.wasm.v1beta1.IAbsoluteTxPosition|null} [updated] ContractCodeHistoryEntry updated
         * @property {Uint8Array|null} [msg] ContractCodeHistoryEntry msg
         */

        /**
         * Constructs a new ContractCodeHistoryEntry.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a ContractCodeHistoryEntry.
         * @implements IContractCodeHistoryEntry
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IContractCodeHistoryEntry=} [p] Properties to set
         */
        function ContractCodeHistoryEntry(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * ContractCodeHistoryEntry operation.
         * @member {cosmwasm.wasm.v1beta1.ContractCodeHistoryOperationType} operation
         * @memberof cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry
         * @instance
         */
        ContractCodeHistoryEntry.prototype.operation = 0;

        /**
         * ContractCodeHistoryEntry code_id.
         * @member {Long} code_id
         * @memberof cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry
         * @instance
         */
        ContractCodeHistoryEntry.prototype.code_id = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * ContractCodeHistoryEntry updated.
         * @member {cosmwasm.wasm.v1beta1.IAbsoluteTxPosition|null|undefined} updated
         * @memberof cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry
         * @instance
         */
        ContractCodeHistoryEntry.prototype.updated = null;

        /**
         * ContractCodeHistoryEntry msg.
         * @member {Uint8Array} msg
         * @memberof cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry
         * @instance
         */
        ContractCodeHistoryEntry.prototype.msg = $util.newBuffer([]);

        /**
         * Encodes the specified ContractCodeHistoryEntry message. Does not implicitly {@link cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry
         * @static
         * @param {cosmwasm.wasm.v1beta1.IContractCodeHistoryEntry} m ContractCodeHistoryEntry message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ContractCodeHistoryEntry.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.operation != null && Object.hasOwnProperty.call(m, 'operation'))
            w.uint32(8).int32(m.operation);
          if (m.code_id != null && Object.hasOwnProperty.call(m, 'code_id'))
            w.uint32(16).uint64(m.code_id);
          if (m.updated != null && Object.hasOwnProperty.call(m, 'updated'))
            $root.cosmwasm.wasm.v1beta1.AbsoluteTxPosition.encode(
              m.updated,
              w.uint32(26).fork()
            ).ldelim();
          if (m.msg != null && Object.hasOwnProperty.call(m, 'msg'))
            w.uint32(34).bytes(m.msg);
          return w;
        };

        /**
         * Decodes a ContractCodeHistoryEntry message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry} ContractCodeHistoryEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ContractCodeHistoryEntry.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.ContractCodeHistoryEntry();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.operation = r.int32();
                break;
              case 2:
                m.code_id = r.uint64();
                break;
              case 3:
                m.updated = $root.cosmwasm.wasm.v1beta1.AbsoluteTxPosition.decode(
                  r,
                  r.uint32()
                );
                break;
              case 4:
                m.msg = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return ContractCodeHistoryEntry;
      })();

      v1beta1.AbsoluteTxPosition = (function () {
        /**
         * Properties of an AbsoluteTxPosition.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IAbsoluteTxPosition
         * @property {Long|null} [block_height] AbsoluteTxPosition block_height
         * @property {Long|null} [tx_index] AbsoluteTxPosition tx_index
         */

        /**
         * Constructs a new AbsoluteTxPosition.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents an AbsoluteTxPosition.
         * @implements IAbsoluteTxPosition
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IAbsoluteTxPosition=} [p] Properties to set
         */
        function AbsoluteTxPosition(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * AbsoluteTxPosition block_height.
         * @member {Long} block_height
         * @memberof cosmwasm.wasm.v1beta1.AbsoluteTxPosition
         * @instance
         */
        AbsoluteTxPosition.prototype.block_height = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * AbsoluteTxPosition tx_index.
         * @member {Long} tx_index
         * @memberof cosmwasm.wasm.v1beta1.AbsoluteTxPosition
         * @instance
         */
        AbsoluteTxPosition.prototype.tx_index = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;

        /**
         * Encodes the specified AbsoluteTxPosition message. Does not implicitly {@link cosmwasm.wasm.v1beta1.AbsoluteTxPosition.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.AbsoluteTxPosition
         * @static
         * @param {cosmwasm.wasm.v1beta1.IAbsoluteTxPosition} m AbsoluteTxPosition message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AbsoluteTxPosition.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.block_height != null &&
            Object.hasOwnProperty.call(m, 'block_height')
          )
            w.uint32(8).uint64(m.block_height);
          if (m.tx_index != null && Object.hasOwnProperty.call(m, 'tx_index'))
            w.uint32(16).uint64(m.tx_index);
          return w;
        };

        /**
         * Decodes an AbsoluteTxPosition message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.AbsoluteTxPosition
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.AbsoluteTxPosition} AbsoluteTxPosition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AbsoluteTxPosition.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.AbsoluteTxPosition();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.block_height = r.uint64();
                break;
              case 2:
                m.tx_index = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return AbsoluteTxPosition;
      })();

      v1beta1.Model = (function () {
        /**
         * Properties of a Model.
         * @memberof cosmwasm.wasm.v1beta1
         * @interface IModel
         * @property {Uint8Array|null} [key] Model key
         * @property {Uint8Array|null} [value] Model value
         */

        /**
         * Constructs a new Model.
         * @memberof cosmwasm.wasm.v1beta1
         * @classdesc Represents a Model.
         * @implements IModel
         * @constructor
         * @param {cosmwasm.wasm.v1beta1.IModel=} [p] Properties to set
         */
        function Model(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }

        /**
         * Model key.
         * @member {Uint8Array} key
         * @memberof cosmwasm.wasm.v1beta1.Model
         * @instance
         */
        Model.prototype.key = $util.newBuffer([]);

        /**
         * Model value.
         * @member {Uint8Array} value
         * @memberof cosmwasm.wasm.v1beta1.Model
         * @instance
         */
        Model.prototype.value = $util.newBuffer([]);

        /**
         * Encodes the specified Model message. Does not implicitly {@link cosmwasm.wasm.v1beta1.Model.verify|verify} messages.
         * @function encode
         * @memberof cosmwasm.wasm.v1beta1.Model
         * @static
         * @param {cosmwasm.wasm.v1beta1.IModel} m Model message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Model.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.key != null && Object.hasOwnProperty.call(m, 'key'))
            w.uint32(10).bytes(m.key);
          if (m.value != null && Object.hasOwnProperty.call(m, 'value'))
            w.uint32(18).bytes(m.value);
          return w;
        };

        /**
         * Decodes a Model message from the specified reader or buffer.
         * @function decode
         * @memberof cosmwasm.wasm.v1beta1.Model
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {cosmwasm.wasm.v1beta1.Model} Model
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Model.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1beta1.Model();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.key = r.bytes();
                break;
              case 2:
                m.value = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };

        return Model;
      })();

      return v1beta1;
    })();
    wasm.v1 = (function () {
      const v1 = {};
      v1.MsgExecuteContract = (function () {
        function MsgExecuteContract(p) {
          this.funds = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExecuteContract.prototype.sender = '';
        MsgExecuteContract.prototype.contract = '';
        MsgExecuteContract.prototype.msg = $util.newBuffer([]);
        MsgExecuteContract.prototype.funds = $util.emptyArray;
        MsgExecuteContract.create = function create(properties) {
          return new MsgExecuteContract(properties);
        };
        MsgExecuteContract.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, 'sender'))
            w.uint32(10).string(m.sender);
          if (m.contract != null && Object.hasOwnProperty.call(m, 'contract'))
            w.uint32(18).string(m.contract);
          if (m.msg != null && Object.hasOwnProperty.call(m, 'msg'))
            w.uint32(26).bytes(m.msg);
          if (m.funds != null && m.funds.length) {
            for (var i = 0; i < m.funds.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.funds[i],
                w.uint32(42).fork()
              ).ldelim();
          }
          return w;
        };
        MsgExecuteContract.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1.MsgExecuteContract();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.contract = r.string();
                break;
              case 3:
                m.msg = r.bytes();
                break;
              case 5:
                if (!(m.funds && m.funds.length)) m.funds = [];
                m.funds.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExecuteContract.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmwasm.wasm.v1.MsgExecuteContract) return d;
          var m = new $root.cosmwasm.wasm.v1.MsgExecuteContract();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.contract != null) {
            m.contract = String(d.contract);
          }
          if (d.msg != null) {
            if (typeof d.msg === 'string')
              $util.base64.decode(
                d.msg,
                (m.msg = $util.newBuffer($util.base64.length(d.msg))),
                0
              );
            else if (d.msg.length) m.msg = d.msg;
          }
          if (d.funds) {
            if (!Array.isArray(d.funds))
              throw TypeError(
                '.cosmwasm.wasm.v1.MsgExecuteContract.funds: array expected'
              );
            m.funds = [];
            for (var i = 0; i < d.funds.length; ++i) {
              if (typeof d.funds[i] !== 'object')
                throw TypeError(
                  '.cosmwasm.wasm.v1.MsgExecuteContract.funds: object expected'
                );
              m.funds[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.funds[i]
              );
            }
          }
          return m;
        };
        MsgExecuteContract.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.funds = [];
          }
          if (o.defaults) {
            d.sender = '';
            d.contract = '';
            if (o.bytes === String) d.msg = '';
            else {
              d.msg = [];
              if (o.bytes !== Array) d.msg = $util.newBuffer(d.msg);
            }
          }
          if (m.sender != null && m.hasOwnProperty('sender')) {
            d.sender = m.sender;
          }
          if (m.contract != null && m.hasOwnProperty('contract')) {
            d.contract = m.contract;
          }
          if (m.msg != null && m.hasOwnProperty('msg')) {
            d.msg =
              o.bytes === String
                ? $util.base64.encode(m.msg, 0, m.msg.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.msg)
                : m.msg;
          }
          if (m.funds && m.funds.length) {
            d.funds = [];
            for (var j = 0; j < m.funds.length; ++j) {
              d.funds[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.funds[j],
                o
              );
            }
          }
          return d;
        };
        MsgExecuteContract.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgExecuteContract;
      })();
      v1.MsgExecuteContractResponse = (function () {
        function MsgExecuteContractResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExecuteContractResponse.prototype.data = $util.newBuffer([]);
        MsgExecuteContractResponse.create = function create(properties) {
          return new MsgExecuteContractResponse(properties);
        };
        MsgExecuteContractResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.data != null && Object.hasOwnProperty.call(m, 'data'))
            w.uint32(10).bytes(m.data);
          return w;
        };
        MsgExecuteContractResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmwasm.wasm.v1.MsgExecuteContractResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.data = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExecuteContractResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmwasm.wasm.v1.MsgExecuteContractResponse)
            return d;
          var m = new $root.cosmwasm.wasm.v1.MsgExecuteContractResponse();
          if (d.data != null) {
            if (typeof d.data === 'string')
              $util.base64.decode(
                d.data,
                (m.data = $util.newBuffer($util.base64.length(d.data))),
                0
              );
            else if (d.data.length) m.data = d.data;
          }
          return m;
        };
        MsgExecuteContractResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if (o.bytes === String) d.data = '';
            else {
              d.data = [];
              if (o.bytes !== Array) d.data = $util.newBuffer(d.data);
            }
          }
          if (m.data != null && m.hasOwnProperty('data')) {
            d.data =
              o.bytes === String
                ? $util.base64.encode(m.data, 0, m.data.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.data)
                : m.data;
          }
          return d;
        };
        MsgExecuteContractResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgExecuteContractResponse;
      })();
      return v1;
    })();
    return wasm;
  })();
  return cosmwasm;
})();
exports.tendermint = $root.tendermint = (() => {
  const tendermint = {};
  tendermint.crypto = (function () {
    const crypto = {};
    crypto.PublicKey = (function () {
      function PublicKey(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      PublicKey.prototype.ed25519 = $util.newBuffer([]);
      PublicKey.prototype.secp256k1 = $util.newBuffer([]);
      let $oneOfFields;
      Object.defineProperty(PublicKey.prototype, 'sum', {
        get: $util.oneOfGetter(($oneOfFields = ['ed25519', 'secp256k1'])),
        set: $util.oneOfSetter($oneOfFields)
      });
      PublicKey.create = function create(properties) {
        return new PublicKey(properties);
      };
      PublicKey.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.ed25519 != null && Object.hasOwnProperty.call(m, 'ed25519'))
          w.uint32(10).bytes(m.ed25519);
        if (m.secp256k1 != null && Object.hasOwnProperty.call(m, 'secp256k1'))
          w.uint32(18).bytes(m.secp256k1);
        return w;
      };
      PublicKey.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.crypto.PublicKey();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.ed25519 = r.bytes();
              break;
            case 2:
              m.secp256k1 = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      PublicKey.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.crypto.PublicKey) return d;
        var m = new $root.tendermint.crypto.PublicKey();
        if (d.ed25519 != null) {
          if (typeof d.ed25519 === 'string')
            $util.base64.decode(
              d.ed25519,
              (m.ed25519 = $util.newBuffer($util.base64.length(d.ed25519))),
              0
            );
          else if (d.ed25519.length) m.ed25519 = d.ed25519;
        }
        if (d.secp256k1 != null) {
          if (typeof d.secp256k1 === 'string')
            $util.base64.decode(
              d.secp256k1,
              (m.secp256k1 = $util.newBuffer($util.base64.length(d.secp256k1))),
              0
            );
          else if (d.secp256k1.length) m.secp256k1 = d.secp256k1;
        }
        return m;
      };
      PublicKey.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (m.ed25519 != null && m.hasOwnProperty('ed25519')) {
          d.ed25519 =
            o.bytes === String
              ? $util.base64.encode(m.ed25519, 0, m.ed25519.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.ed25519)
              : m.ed25519;
          if (o.oneofs) d.sum = 'ed25519';
        }
        if (m.secp256k1 != null && m.hasOwnProperty('secp256k1')) {
          d.secp256k1 =
            o.bytes === String
              ? $util.base64.encode(m.secp256k1, 0, m.secp256k1.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.secp256k1)
              : m.secp256k1;
          if (o.oneofs) d.sum = 'secp256k1';
        }
        return d;
      };
      PublicKey.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return PublicKey;
    })();
    return crypto;
  })();
  return tendermint;
})();
module.exports = $root;
