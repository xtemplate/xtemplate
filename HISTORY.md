# History
----
## 4.6.0 (2016-08-18)

`new` [#83](https://github.com/xtemplate/xtemplate/pull/83/files) support conditional expression

## 4.5.0 (2015-12-23)

`new` [#75](https://github.com/xtemplate/xtemplate/pull/75/files) support includeOnce

## 4.4.0 (2015-12-03)

`improved` [#71](https://github.com/xtemplate/xtemplate/issues/71) use faster escapeHtml

## 4.3.0 (2015-05-19)

`new` [#62](https://github.com/xtemplate/xtemplate/pull/67) support whitespace control
`new` [#66](https://github.com/xtemplate/xtemplate/issues/66) add void command

## 4.2.4 (2015-05-05)

`improved` [#64](https://github.com/xtemplate/xtemplate/issues/64) reset global variable (lastLine)

## 4.2.3 (2015-05-04)

`improved` [#65](https://github.com/xtemplate/xtemplate/issues/65) resolve don't throw when value is null or undefined

## 4.2.2 (2015-04-20)

`improved` [#63](https://github.com/xtemplate/xtemplate/issues/63) fix call function when null or undefined

## 4.2.1 (2015-04-08)

`improved` [#60](https://github.com/xtemplate/xtemplate/issues/60) add build dir to npm

## 4.2.0 (2015-03-26)

`new` [#57](https://github.com/xtemplate/xtemplate/issues/57) support json parameter for include

## 4.1.2 (2015-01-26)

`fixed` [#56](https://github.com/xtemplate/xtemplate/pull/56) try catch runtime function call error


## 4.1.0 (2015-01-26)

`fixed` [#54](https://github.com/xtemplate/xtemplate/pull/54) support set array/object member


## 4.0.5 (2015-01-22)

`fixed` [#55](https://github.com/xtemplate/xtemplate/pull/55) fix variable is null


## 4.0.4 (2015-01-13)

`fixed` [#53](https://github.com/xtemplate/xtemplate/issues/53) fix set empty array and object


## 4.0.2 (2014-12-22)

`improved` [#48](https://github.com/xtemplate/xtemplate/pull/48) Compile error   ([@dead-horse](https://github.com/dead-horse))

## 4.0.0 (2014-12-10)

[#28](https://github.com/xtemplate/xtemplate/issues/28) 支持链式调用数据中的方法   ([@dead-horse](https://github.com/dead-horse))

## 3.7.1 (2014-12-02)

`improved` [#39](https://github.com/xtemplate/xtemplate/pull/39) detect include/extend/parse paramerter error   ([@dead-horse](https://github.com/dead-horse))

`improved` [#37](https://github.com/xtemplate/xtemplate/issues/37) extend 的参数不能为变量   ([@dead-horse](https://github.com/dead-horse))

## 3.7.0 (2014-11-26)

[#35](https://github.com/xtemplate/xtemplate/pull/35) 修改了render方法，支持接受Scope实例作为参数   ([@zincli](https://github.com/zincli))

[#34](https://github.com/xtemplate/xtemplate/issues/34) 是否考虑让render方法接受Scope实例作为参数，这样可使类似{{#childView}}这种子视图模板命令的实现更加优雅   ([@zincli](https://github.com/zincli))

## 3.6.0 (2014-11-24)

[#33](https://github.com/xtemplate/xtemplate/pull/33) add parentName property in TplWrap   ([@dead-horse](https://github.com/dead-horse))

[#32](https://github.com/xtemplate/xtemplate/pull/32) add filename into error message in compile   ([@dead-horse](https://github.com/dead-horse))

[#31](https://github.com/xtemplate/xtemplate/issues/31) ast.js 中 throw Error 没有出错的文件名的信息   ([@dead-horse](https://github.com/dead-horse))

[#29](https://github.com/xtemplate/xtemplate/issues/29) support access root in macro   ([@yiminghe](https://github.com/yiminghe))

[#25](https://github.com/xtemplate/xtemplate/pull/25) avoid visit property of undefined   ([@dead-horse](https://github.com/dead-horse))

[#23](https://github.com/xtemplate/xtemplate/issues/23) include 空模版会报错？   ([@dead-horse](https://github.com/dead-horse))

[#22](https://github.com/xtemplate/xtemplate/issues/22) 所有的错误都统一处理   ([@dead-horse](https://github.com/dead-horse))

[#21](https://github.com/xtemplate/xtemplate/pull/21) add missing comma   ([@dead-horse](https://github.com/dead-horse))

## 3.5.0 (2014-11-05)

[#20](https://github.com/xtemplate/xtemplate/issues/20) extended page misbehavior   ([@yiminghe](https://github.com/yiminghe))

## 3.4.1 (2014-10-20)

[#19](https://github.com/xtemplate/xtemplate/issues/19) NPM 3.3.1 的发布 直接改动 kissy.add  =&gt; modulex.add  导致modulex not define   ([@noyobo](https://github.com/noyobo))

## 3.3.0 (2014-09-30)

[#16](https://github.com/xtemplate/xtemplate/issues/16) support set globalConfig and remove default loader   ([@yiminghe](https://github.com/yiminghe))

## 3.2.0 (2014-09-25)

[#15](https://github.com/xtemplate/xtemplate/issues/15) support strict   ([@yiminghe](https://github.com/yiminghe))

## 3.1.1 (2014-09-23)

[#14](https://github.com/xtemplate/xtemplate/issues/14) support use loader on start   ([@yiminghe](https://github.com/yiminghe))

## 3.0.0 (2014-09-22)

[#12](https://github.com/xtemplate/xtemplate/issues/12) optimize include speed   ([@yiminghe](https://github.com/yiminghe))

## 2.3.0 (2014-09-19)

[#11](https://github.com/xtemplate/xtemplate/issues/11) remove nested function from generate code   ([@yiminghe](https://github.com/yiminghe))

## 2.2.0 (2014-09-18)

[#10](https://github.com/xtemplate/xtemplate/issues/10) catch runtime error   ([@yiminghe](https://github.com/yiminghe))

## 2.0.0 (2014-09-17)

[#9](https://github.com/xtemplate/xtemplate/issues/9) speed boost by optimizing data read   ([@yiminghe](https://github.com/yiminghe))

## 1.4.0 (2014-09-05)

[#6](https://github.com/xtemplate/xtemplate/issues/6) support foreach and forin for performance   ([@yiminghe](https://github.com/yiminghe))

## 1.3.0 (2014-09-04)

[#5](https://github.com/xtemplate/xtemplate/issues/5) support requirejs   ([@yiminghe](https://github.com/yiminghe))

## 1.2.4 (2014-08-28)

[#4](https://github.com/xtemplate/xtemplate/issues/4) Node下报错   ([@yuanyan](https://github.com/yuanyan))

[#2](https://github.com/xtemplate/xtemplate/issues/2) optimize sub template include logic in compiled code   ([@yiminghe](https://github.com/yiminghe))
