# include benchmark:

loading: includes/xtpl,includes/xtpl_part,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

benchmarking: includes/xtpl,includes/xtpl_part,includes/dust,includes/dust_part,includes/nunjucks,includes/handlebars,includes/handlebars_part

includes/dust x 77,352 ops/sec ±0.91% (95 runs sampled)

includes/nunjucks x 36,937 ops/sec ±1.52% (92 runs sampled)

includes/xtpl x 38,469 ops/sec ±3.04% (84 runs sampled)

includes/handlebars x 90,580 ops/sec ±3.28% (80 runs sampled)

# common benchmark:

loading: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

benchmarking: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

common/dust x 80,391 ops/sec ±2.35% (61 runs sampled)

common/jade x 28,699 ops/sec ±4.24% (84 runs sampled)

common/nunjucks x 83,528 ops/sec ±1.87% (93 runs sampled)

common/xtpl x 141,022 ops/sec ±2.40% (92 runs sampled)

common/handlebars x 330,407 ops/sec ±1.03% (90 runs sampled)