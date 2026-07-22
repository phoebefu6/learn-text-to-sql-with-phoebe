# learn-text-to-sql-with-phoebe - course arc + coverage map

Two-track course. Sequel to learn-sql (same Daybreak coffee DB, same SQLite-blue family
+ violet AI accent). Core thesis both tracks share: **the model is not the product -
context is.** Source research: materials/market-landscape.md (deep-research run 2026-07-22).

## Leader track (a1-a6) - exec thinking-mode, 45 min each

| # | File | Session | Teaches | Key sources |
|---|------|---------|---------|-------------|
| a1 | a1-self-serve-dream.html | The self-serve dream | Why NL-to-data is the oldest BI promise; 2026 adoption stats (57% orgs w/ agents in prod, 24.4% data analysis top use case); the demo-vs-production gap; "agent washing" | Tellius/LangChain survey, Gartner |
| a2 | a2-accuracy-cliff.html | The accuracy cliff | Benchmark ladder WikiSQL->Spider->BIRD->Spider 2.0; 86% -> 10% cliff; silent vs loud failure; why demos always look perfect | Spider 2.0 paper, BIRD paper, dbt failure-mode framing |
| a3 | a3-vendor-landscape.html | The vendor landscape | Warehouse-native (Genie, Cortex Analyst) vs BI copilots (Power BI, Tableau, Looker, ThoughtSpot) vs AI analysts (Hex, Julius); build-vs-buy axes; vendor-benchmark skepticism (both claim 90%+, non-comparable) | Genie/Cortex head-to-heads, 12-platform comparison |
| a4 | a4-curation-tax.html | The curation tax | Nothing works out of the box: Genie rooms (rec <=5 tables, 2-week iteration), Cortex YAML semantic models; the semantic layer as accuracy lever (+17-23pp; dbt 100% in-scope); who pays the tax (data team) | dbt benchmark, semantic-layer paper, Genie curation recipes |
| a5 | a5-governance-trust.html | Governance + trust | RLS/permissions with an LLM in the loop; audit trails; hallucinated-but-plausible answers as the #1 risk; benchmarks-are-broken (52.8%/66.1% annotation errors) -> how to read vendor claims | CIDR 2026 audit, Vanna v2 RLS, Genie limits |
| a6 | a6-adoption-playbook.html | The adoption playbook | Scope small (5 tables, 20 golden questions); measure with your own golden set; curate metadata first; pilot -> expand loop; when to say no | Salesforce 50->80% case, Genie 8/15->15/15 case, all of the above |

## Builder track (b1-b10) - hands-on, Daybreak DB, 45 min each

Running project: build **DaybreakGPT** - a text-to-SQL agent over the Daybreak coffee
warehouse - one accuracy rung per session, measured on a 12-question golden set in the
in-browser playground (t2sql-live.js: simulated deterministic model + real SQLite via sql.js).

| # | File | Session | Rung / technique | Key sources |
|---|------|---------|------------------|-------------|
| b1 | b1-baseline-agent.html | Meet the problem | Naive schema-dump prompt; watch it fail (~3-10% real-world analog); anatomy of a text-to-SQL system; golden set introduced | Vanna accuracy research, survey 2408.05109 |
| b2 | b2-schema-linking.html | Schema linking | Map question terms -> tables/columns; why 81% of failures are schema errors; retrieval vs prompt-all | ACM CSUR taxonomy, error-analysis paper |
| b3 | b3-few-shot-examples.html | Few-shot examples | Static example pairs in prompt; 20-60% band; example quality > quantity | Vanna research, ICL taxonomy (TKDE survey) |
| b4 | b4-rag-over-metadata.html | RAG over metadata | Retrieve relevant DDL/docs/example pairs per question (the Vanna pattern, ~80%); ties to learn-rag | Vanna docs/architecture, learn-rag course |
| b5 | b5-semantic-layer.html | The semantic layer | Metric/join definitions as contract (WrenAI MDL, dbt SL, Cortex YAML); loud vs silent failure; +17-23pp evidence | dbt benchmark repo, WrenAI MDL, semantic-layer paper |
| b6 | b6-self-correction.html | Self-correction | Execute -> catch error -> regenerate (DIN-SQL origin, Refiner agents); agentic loop on Daybreak | DIN-SQL, MAC-SQL, LangChain agent flow |
| b7 | b7-multi-candidate.html | Multi-candidate + selection | Generate N candidates, execute + score, pick (Salesforce 10-candidate 50->80%; CHASE-SQL) | Salesforce case, CHASE-SQL |
| b8 | b8-evaluation.html | Evaluating your agent | Execution accuracy vs exact match; golden sets; benchmark annotation errors; eval as the real deliverable (bridges learn-evals) | Spider metrics, CIDR 2026 audit, learn-evals course |
| b9 | b9-framework-tour.html | The framework tour | Vanna (archived - market lesson), WrenAI, DB-GPT, SQLCoder, LangChain SQL agent; which-when decision tree; four architecture axes | GitHub repos, comparative teardowns |
| b10 | b10-capstone-production.html | Capstone + production reality | Full-stack DaybreakGPT run; production concerns (governance, cost, drift, schema evolution); Spider 2.0 agents story; where the field is going | Spider 2.0 leaderboard, production-failure taxonomy |

## Honesty rails

- The playground "model" is a deterministic SIMULATION of LLM behavior at each context
  level - real LLMs vary. Say so on every playground page.
- Vendor accuracy claims ([B] tags in market-landscape.md) always presented as
  vendor-claimed, never as fact.
- Unverified numbers ([P] tags) spot-checked against primary sources before final publish.
- Not covered by design: fine-tuning your own SQLCoder-style model (pointer only),
  vendor-specific admin setup (Genie/Cortex click-through), conversational/multi-turn BI.

## Reused layers

- sql-live.js + daybreak-seed.js + sql-wasm (from learn-sql) - real SQLite in browser
- NEW t2sql-live.js - lever-toggle text-to-SQL simulator + golden-set scorecard
  (levers: schema linking / examples / RAG / semantic layer / self-correction)
- eval scorecard pattern from learn-evals, mindmap.js homepage layer
- Difficulty colors universal: green/yellow/orange/red
