## page

http://localhost:8002/benchmark/index.html

## common benchmark:

loading: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

benchmarking: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

common/dust x 146,903 ops/sec ±1.51% (93 runs sampled)

common/jade x 26,056 ops/sec ±2.18% (89 runs sampled)

common/nunjucks x 71,679 ops/sec ±1.26% (94 runs sampled)

common/xtpl x 189,501 ops/sec ±1.90% (90 runs sampled)

common/handlebars x 303,725 ops/sec ±1.65% (94 runs sampled)

common/ejs x 60,283 ops/sec ±2.18% (91 runs sampled)

## include benchmark:

loading: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

benchmarking: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

includes/dust x 71,475 ops/sec ±1.50% (91 runs sampled)

includes/nunjucks x 33,392 ops/sec ±1.52% (93 runs sampled)

includes/main.xtpl x 43,853 ops/sec ±2.71% (92 runs sampled)

includes/handlebars x 136,897 ops/sec ±2.00% (91 runs sampled)

all is over