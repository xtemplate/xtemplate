## common benchmark:

loading: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

benchmarking: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

common/dust x 141,098 ops/sec ±1.81% (89 runs sampled)

common/jade x 24,371 ops/sec ±1.89% (89 runs sampled)

common/nunjucks x 70,341 ops/sec ±0.82% (90 runs sampled)

common/xtpl x 120,624 ops/sec ±4.68% (88 runs sampled)

common/handlebars x 280,674 ops/sec ±3.08% (91 runs sampled)

common/ejs x 47,916 ops/sec ±1.40% (97 runs sampled)

## include benchmark:

loading: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

benchmarking: includes/main.xtpl,includes/part.xtpl,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

includes/dust x 68,923 ops/sec ±2.77% (95 runs sampled)

includes/nunjucks x 32,191 ops/sec ±0.91% (92 runs sampled)

includes/main.xtpl x 32,433 ops/sec ±3.10% (82 runs sampled)

includes/handlebars x 67,425 ops/sec ±3.06% (62 runs sampled)

