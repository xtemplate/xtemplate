## page

http://localhost:8002/benchmark/index.html

chrome 37.0.2062.120 m

## common benchmark:

loading: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

benchmarking: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

common/dust x 152,457 ops/sec ±1.81% (82 runs sampled)

common/jade x 28,300 ops/sec ±1.93% (89 runs sampled)

common/nunjucks x 87,474 ops/sec ±2.25% (81 runs sampled)

common/xtpl x 379,041 ops/sec ±1.09% (90 runs sampled)

common/handlebars x 312,821 ops/sec ±0.92% (96 runs sampled)

common/ejs x 54,399 ops/sec ±0.89% (94 runs sampled)

## include benchmark:

loading: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

benchmarking: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

includes/dust x 72,169 ops/sec ±1.10% (92 runs sampled)

includes/nunjucks x 41,060 ops/sec ±0.84% (91 runs sampled)

includes/main.xtpl x 53,228 ops/sec ±2.83% (91 runs sampled)

includes/handlebars x 120,978 ops/sec ±1.08% (82 runs sampled)

all is over