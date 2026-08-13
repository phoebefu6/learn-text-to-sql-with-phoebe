<!-- phoebe header -->

[![Open the live course](https://img.shields.io/badge/%E2%96%B6%20open%20the%20live%20course-1f6feb?style=for-the-badge)](https://phoebefu6.github.io/learn-text-to-sql-with-phoebe/)
[![Star this repo](https://img.shields.io/github/stars/phoebefu6/learn-text-to-sql-with-phoebe?style=for-the-badge&label=star%20this%20repo&color=444444)](https://github.com/phoebefu6/learn-text-to-sql-with-phoebe/stargazers)
[![Free courses](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fphoebefu6.github.io%2Flearn-with-phoebe%2Fstats.json&query=%24.courses_live&label=free%20courses&style=for-the-badge&color=111111)](https://phoebefu6.github.io/learn-with-phoebe/)

### ▶︎ [Open the live course →](https://phoebefu6.github.io/learn-text-to-sql-with-phoebe/)

Free, runs in your browser. No install, no login.

> 📚 Part of **[Learn with Phoebe](https://phoebefu6.github.io/learn-with-phoebe/)** - free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**

<!-- /phoebe header -->
# learn-text-to-sql-with-phoebe

Ask your data in plain English - a two-track course on text-to-SQL (natural language to SQL
with LLMs), by Phoebe Fu.

**Live site:** https://phoebefu6.github.io/learn-text-to-sql-with-phoebe/

The sequel to [learn-sql-with-phoebe](https://phoebefu6.github.io/learn-sql-with-phoebe/) -
same Daybreak coffee warehouse, now queried by an AI. The through-line of the whole course:
**the model is not the product, context is.** Every accuracy lever that works is a
context-engineering move, not a bigger model.

## Two tracks, 16 sessions

**Leader track (a1-a6)** - for executives and data leaders, no code required:
the self-serve dream, the accuracy cliff, the vendor landscape, the curation tax,
governance and trust, and an adoption playbook you can take to Monday's meeting.

**Builder track (b1-b10)** - hands-on, builds **DaybreakGPT** one accuracy rung per session,
measured on a 12-question golden set: baseline (8%) -> schema linking -> few-shot examples ->
RAG over metadata -> semantic layer (92%) -> self-correction (100%) -> multi-candidate ->
evaluation -> framework tour -> capstone + production reality.

## Interactive layer

Everything runs in your browser, no install and no API keys:

- **Real SQLite** via `sql.js` (WebAssembly) over the Daybreak database
- **`t2sql-live.js`** - a deterministic, teaching-only text-to-SQL simulator. Each golden
  question carries the characteristic failure a real LLM makes when a context lever is
  missing; the generated SQL genuinely executes and its result set is compared to gold
  (execution accuracy, the same metric Spider and BIRD use). Toggle levers, watch the
  accuracy bar climb from 8% to 100%.

The simulated model is for teaching - real LLMs are noisier, but they fail in these shapes at
the rates the course documents. Every playground page says so.

## Built with

Static HTML/CSS/JS, no build step. Part of [Learn with Phoebe](https://phoebefu6.github.io/learn-with-phoebe/).
