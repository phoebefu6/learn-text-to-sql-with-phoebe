# Text-to-SQL Market Landscape (researched 2026-07-22)

Source research for learn-text-to-sql-with-phoebe. Built from a deep-research workflow
(5 search angles, ~15 sources fetched, claims extracted from primary sources).
Verification status per item: [V] = adversarially verified 3-vote, [P] = primary source,
unverified (session limit cut verification), [B] = vendor/blog claim - treat with caution.

## The one-line market thesis

The model is not the product - context is. Raw schema-dump text-to-SQL scores ~3-10% on
real enterprise schemas; every accuracy lever that works (RAG over metadata, example
retrieval, semantic layers, agentic self-correction) is a context-engineering technique,
not a bigger model. This is the spine of both course tracks.

## 1. Commercial products (leader track material)

### Warehouse-native flagships
| Product | Approach | Key facts |
|---|---|---|
| **Databricks AI/BI Genie** | Curated "rooms": Unity Catalog metadata + plain-text curator instructions + example SQL + benchmark questions (RAG-over-metadata) | [P] Limits: max 30 UC tables/space, rec 5 or fewer; 20 q/min/workspace; nondeterministic. [B] Vendor claim: 32% -> 90%+ on internal benchmark (May 2026). No per-question AI charge (pay for SQL warehouse). Genie Research multi-step beta. Fresh space scored 8/15 before curation -> 15/15 after. |
| **Snowflake Cortex Analyst** | Semantic views/YAML semantic model ("the magic is in the YAML") | [B] Vendor claim: 90%+ accuracy vs 51% single-shot GPT-4o on internal 150-question benchmark (Aug 2024). Per-message pricing + warehouse. Data never leaves Snowflake; RLS/governance intact. |

Both require substantial human curation of semantic metadata - neither works out of the box. [P]

### Wider commercial field (12+ platforms)
- **ThoughtSpot Spotter** (search-based self-serve + SpotIQ insights engine)
- **Power BI + Copilot**, **Tableau Pulse/Next**, **Google Looker + Gemini**, **Qlik Sense**
- **Amazon Q** (in QuickSight)
- AI-analyst category (adjacent): **Hex Magic** (indexes warehouse schema + notebook context; [B] still hallucinates JOIN keys on messy schemas), **Julius** (CSV/Python sandbox, no governance/RLS), **Mode**, **Deepnote**, **Tellius**, **TextQL**, **Querio** ([B] $14k/yr, 4k prompts/mo - useful pricing datapoint)
- Market split: notebook-based tools for technical analysts vs chat-based for business users. [B]

### Adoption stats (leader track hooks)
- [B] LangChain 2026 survey: 57% of orgs run AI agents in production; 24.4% name data analysis as primary agent use case.
- [B] Gartner: 40% of enterprise apps will include task-specific agents by end 2026. Watch for "agent washing" - relabeled features.
- [B] Salesforce production text-to-SQL: ~50% efficacy at launch; 10-candidate generation + scoring to reach ~80%.

## 2. Open-source frameworks (builder track material)

| Framework | Stars | Thesis | Status |
|---|---|---|---|
| **Vanna** (vanna-ai/vanna) | [V] 23.8k, MIT | RAG-over-metadata: train on DDL + docs + question-SQL pairs, retrieve at query time. v2.0 (late 2025) became production agent framework w/ identity flow + row-level security | [V] **ARCHIVED Mar 29, 2026, read-only.** Last release v2.0.2 (Feb 2, 2026). Pivot to commercial Vanna Cloud; community forks (e.g. DataChat) carry OSS torch. Teach as "most-starred OSS framework, now archived" - a market-moves lesson in itself |
| **WrenAI** | ~12k | Semantic-layer-first: MDL (JSON modeling definition language) encodes business concepts/joins/metrics. Full GenBI platform: RBAC, RLS, column-level permissions, 20+ connectors | Active |
| **DB-GPT** | large | Full LLM+DB interaction: AWEL declarative DAG workflow engine, SMMF local-model management (50+ LLMs). [B] QLoRA CodeLlama-13B hit 82.5% Spider EX | Active |
| **Dataherald** | ~3.6k | API-first, embed text-to-SQL into SaaS | Largely dormant |
| **defog/sqlcoder** | - | Fine-tuned open-weights model family (7B/15B/34B/70B on HuggingFace). Apache-2 code, CC BY-SA weights (share-alike for commercial). [P] Trained on 20k+ curated pairs; claims beat GPT-4 on own sql-eval (NOT Spider/BIRD) | Dormant (Defog pivoted) |
| **langchain-ai/text-to-sql-agent** | [P] 24 (reference repo) | Official LangChain agentic reference: discover tables -> inspect schema -> generate -> validate -> execute -> retry on error. Chinook demo DB, LangSmith tracing | Tutorial-scale, not framework |
| **MindsDB** + long tail | - | See github.com/topics/text-to-sql for live star ranking | - |

**Key OSS teaching number** [B, Vanna's own research]: schema-only prompting ~3% accuracy;
static SQL examples 20-60%; RAG-retrieved contextual examples ~80%. Context strategy
dominates model choice.

**Architecture axes to teach**: RAG-retrieval (Vanna) vs semantic-layer (WrenAI) vs
fine-tuned model (SQLCoder) vs DIY agent (LangChain). Plus build-vs-buy vs warehouse-native.

## 3. Benchmarks (the difficulty ladder - both tracks)

Lineage: **WikiSQL -> Spider -> BIRD -> Spider 2.0** = ready-made difficulty ladder. [P]

| Benchmark | Scale | Headline numbers |
|---|---|---|
| **WikiSQL** (2017) | 80,654 examples, single-table Wikipedia | Solved; historical |
| **Spider 1.0** (2018) | 10,181 questions, 200 DBs, 138 domains, multi-table | [P] Frontier models ~86-91% EX. Introduced Execution Accuracy + Exact Match metrics |
| **BIRD** (NeurIPS 2023) | 12,751 pairs, 95 DBs, 33.4 GB, 37 domains; dirty data + external knowledge + efficiency | [P] Human 92.96%; ChatGPT 40.08% at launch; GPT-4 54.89%. Adding 1 sentence of "evidence" per question: +20pp for GPT-4 (34.88 -> 54.89) - nearly identical to the human gap w/wo evidence. bird-bench.github.io leaderboard |
| **Spider 2.0** (ICLR 2025 oral, XLANG Lab) | 632 real enterprise workflow problems; 1,000+ column DBs; 100+ line SQL; BigQuery/Snowflake/DuckDB/SQLite. 3 settings: Snow (547), Lite (547), DBT (68) | [P] GPT-4o 10.1% vs 86.6% on Spider 1.0; o1-preview 17.1-21.3%. THE academic-vs-enterprise cliff. [P] Mid-2026 leaderboard: agents dominate - Snow top ~96.7, Lite ~73.7, DBT ~65.6 |
| **BEAVER** | Real enterprise warehouses | [P] GPT-4o close to 0% end-to-end |
| **BIRD-Interact** | Interactive/agentic | [B] GPT-5 completes 29% agentic |
| **LiveSQLBench-Large** | ~1,000 cols, 54 tables | [B] Popular LLMs 30-36% |

### The benchmarks-are-broken twist (critical-thinking module - gold for the course)
[P] UIUC audit, CIDR 2026 (vldb.org/cidrdb/papers/2026/p5-jin.pdf):
- BIRD Mini-Dev: **52.8% annotation error rate**; Spider 2.0-Snow: **66.1%**
- Most common error: gold query vs data/schema mismatch (E2, ~56-58%)
- Re-scoring on corrected subset: CHESS jumped 62% -> 81% EX, 4th place -> 1st
- Lesson: leaderboard rankings unreliable; read SOTA claims skeptically
- Companion repo: github.com/uiuc-kang-lab/text_to_sql_benchmarks

## 4. Techniques (builder track spine)

Canonical architecture [P, survey 2408.05109]: **Pre-processing -> Translation -> Post-processing**
- **Schema linking** (pre): map question phrases to tables/columns. THE dominant failure mode: [P] 81.2% of 4,602 analyzed failures were schema errors. Methods: C3, DIN-SQL, CHESS, PET-SQL, RSL-SQL, embedding retrieval
- **Generation** (translate): prompt engineering (zero/few-shot, CoT, decomposition) vs fine-tuning (SQLCoder, CodeS) - the two mainstream paradigms [P, ACM Computing Surveys 10.1145/3737873]
- **Self-correction** (post): origin = DIN-SQL zero-shot correction module [P]. Agentic: MAC-SQL (3 agents: schema linking / decompose+generate / execution-guided refine), CHASE-SQL (divide-and-conquer multi-candidate), Refiner agents catching runtime errors -> regenerate

### The accuracy-lever evidence stack (course's teaching arc)
1. Raw schema dump: ~3% (Vanna research [B]) to 10% (enterprise case study [B]) to ~0% (BEAVER [P])
2. + External knowledge/evidence: +20pp (BIRD [P])
3. + RAG-retrieved examples: ~80% (Vanna [B])
4. + Semantic layer: [P] arXiv 2604.25149 paired benchmark: +17-23pp across Claude Opus 4.7 / Sonnet 4.6 / GPT-5.4 from a 4KB semantic doc (45-50% -> 67-69%). [B] dbt 2026 benchmark (dbt-labs/dbt-llm-sl-bench, open source): raw text-to-SQL 84-90% vs semantic layer 98-100%; within-scope questions 100%. Failure modes differ: text-to-SQL fails SILENTLY (plausible wrong answer), semantic layer fails LOUDLY (error). [B] Ontology/OWL grounding: GPT-4 on 199-table insurance schema: 16.7% raw SQL -> 54.2% SPARQL-over-ontology -> ~72% with ontology-based query checking
5. + Agentic loop + multi-candidate: Salesforce 50% -> 80% w/ 10 candidates [B]; Spider 2.0 agents 96.7 vs bare LLM 10-17 [P]

## 5. Backbone references (surveys)

1. arXiv 2408.05109 - "A Survey of Text-to-SQL in the Era of LLMs" - lifecycle framing, most course-friendly
2. ACM Computing Surveys DOI 10.1145/3737873 (2025) - peer-reviewed techniques taxonomy
3. IEEE TKDE 2025 "Next-Generation Database Interfaces" - ICL 5-category taxonomy, benchmark stats table
4. arXiv 2410.06011 - pipeline-stage organization (maps to session arc)
5. CIDR 2026 p5-jin - benchmarks-are-broken audit
6. Spider 2.0 paper arXiv 2411.07763; BIRD paper arXiv 2305.03111
7. dbt-labs/dbt-llm-sl-bench - runnable semantic-layer benchmark (Pydantic AI + DuckDB)

## 6. Gaps still to research

- Amazon Q coverage thin (one mention) - fetch AWS docs during build
- Learning-resources angle died at session limit - platform scan (DeepLearning.AI etc.) pending
- Star counts / archived statuses to re-verify at build time (fast-moving)
- Most [P] claims unverified by adversarial pass (session limit) - spot-check the load-bearing
  numbers (Spider 2.0 scores, BIRD stats, CIDR error rates) against primary sources during build
