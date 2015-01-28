# introduce xtemplate
---

最近随着 nodejs 的流行，各个团队都在进行着探索，其中虽然不是最优，但是最传统，最流行的架构仍然是 mvc，而 v(template) 作为选型的重要一环在前端为主的团队中受到了格外的关注。
大家或许还在迷茫，或许已经坚定得做出了选择，希望这里有机会让我给大家介绍一个 kissy 团队自主研发并得到广泛应用的前后端通用模板引擎 xtemplate(eXtensible template).

## 起源

xtemplate 首次提交在 [2012 年 9 月](https://github.com/kissyteam/kissy/commit/de15b33803530ba9fa7a4100795dea6598a043a1) ，当时由于原有的 template 模块功能太弱，
特别是扩展不便，于是决定做一款功能全面，方便扩展的前端模板引擎，之后随着 [kissy 1.3](https://github.com/kissyteam/kissy/releases/tag/v1.3.0) 的发布而得到了广泛使用，
当然有各种各样的[抱怨和反馈](https://github.com/kissyteam/kissy/search?q=xtemplate&type=Issues&utf8=%E2%9C%93)，不过在大家的齐心协力下我相信大部分都得到了完善的解决。

## nodejs

时间很快就到了 2014 年，今年对于前端是一个不同寻常的年份，各个团队终于可以通过 nodejs 对后端施加实实在在的影响，而模板便作为选型的重要一环而备受关注。
在淘宝 [midway](http://node.taobao.net/) 团队中也遇到了同样的问题，虽然可以抛弃 vm 落后的语法而选择真正适合前端的语法，但要取代 vm 那么就要求这个模板引擎必须足够全面强大，
同时除了服务器端外我们还要兼顾客户端渲染，那么就要求这个模板引擎在能够无缝得应用于浏览器端和服务器端。

一直以来，淘宝浏览器端都是使用跨终端（包括 nodejs）的前端框架 kissy，自然模板引擎也是大多使用自带的 xtemplate，团队的第一个想法就是为何不将 xtemplate 应用于 nodejs 端，
于是就开始了 kissy xtemplate 的 nodejs [探索之旅](https://github.com/xtemplate/xtpl/commits?page=3)，之后又是漫长的优化，
最终发现 xtemplate 特别是在服务器端的重要性已经超过了 kissy，那么为什么不能独立呢！

## 独立

8 月份以来经过仔细思考，最终决定 [xtemplate 独立出 kissy](https://github.com/xtemplate/xtemplate/commits?page=2)，完全去除 kissy 的依赖，
上个星期完善了 [build 机制](https://github.com/xtemplate/xtemplate/commit/ef51f274e0e60c2413178a0c66593569ed99fc9d)后，
xtemplate 终于成为了一个独立的跨平台库： https://github.com/xtemplate/xtemplate

## 特性

xtemplate 的功能基本涵盖了业界类库的常用功能，并根据集团的实际使用情况做了不少微创新。包括对等的 vm 功能，模板继承，异步模板，灵活的扩展机制，完善的工具链支持，方便的前后端共享方案等。
性能上经过 [淘宝 v8 团队](http://gitlab.alibaba-inc.com/groups/v8) 的指点的更是不输于其他类库，
在 [midway](http://node.taobao.net/) 以及 [wormhole](http://www.atatech.org/articles/18264) 方案中得到了良好的反馈.

## 期望

最后希望大家能够对 [xtemplate](https://github.com/xtemplate/xtemplate) 项目多多关注，无论是提 bug 还是建议都十分感谢，如果能够参与使用改进就更好了，
kissy 团队随时恭候，愿景是能把 xtemplate 做成一个集团前端团队能够拿得出手的开源项目。

## 后记

YUI 已经成为了[过去时](http://yahooeng.tumblr.com/post/96098168666/important-announcement-regarding-yui)，KISSY 也即将迎来第四个年份以及版本 V5，
为了避免 KISSY 重蹈 YUI 的覆辙以及未来更好得为集团服务，V5 随着 xtemplate 的独立也标志着一个新的开始，请大家拭目以待。

## xtemplate 资料

xtemplate 类库： https://github.com/xtemplate/xtemplate

api： https://github.com/xtemplate/xtemplate/blob/master/docs/api.md

语法： https://github.com/xtemplate/xtemplate/blob/master/docs/syntax.md

nodejs 端使用： https://github.com/xtemplate/xtpl

浏览器服务器共享模板方案： https://github.com/xtemplate/xtemplate/blob/master/docs/use-on-browser.md

benchmark: https://github.com/xtemplate/xtemplate/blob/master/benchmark/result/2014-08-21-benchmark.md

实现文档： https://github.com/xtemplate/xtemplate/blob/master/docs/impl.md

实现讲解 ppt： http://speakerdeck.com/yiminghe/xtemplate-internal

