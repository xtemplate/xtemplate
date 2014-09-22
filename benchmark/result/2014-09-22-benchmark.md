## page

http://localhost:8002/benchmark/index.html

chrome 37.0.2062.120 m

## common benchmark:

loading: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

benchmarking: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

common/dust x 128,641 ops/sec ±13.66% (84 runs sampled)

common/jade x 26,393 ops/sec ±2.47% (55 runs sampled)

common/nunjucks x 77,452 ops/sec ±1.08% (86 runs sampled)

common/xtpl x 306,066 ops/sec ±1.70% (87 runs sampled)

common/handlebars x 258,013 ops/sec ±1.08% (90 runs sampled)

common/ejs x 45,627 ops/sec ±1.29% (90 runs sampled)

## include benchmark:

loading: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

benchmarking: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

includes/dust x 112,875 ops/sec ±1.57% (87 runs sampled)

includes/nunjucks x 53,543 ops/sec ±1.27% (91 runs sampled)

includes/main.xtpl x 241,558 ops/sec ±1.30% (88 runs sampled)

includes/handlebars x 233,297 ops/sec ±1.32% (89 runs sampled)

all is over