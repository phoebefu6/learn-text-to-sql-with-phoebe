/* learn-text-to-sql-with-phoebe - text-to-SQL simulator + golden-set scorecard
   Every .t2s block simulates a text-to-SQL "model" over the Daybreak database.
   The model is DETERMINISTIC and SIMULATED: each golden question carries the
   characteristic failure a real LLM makes when a context lever is missing
   (hallucinated column, wrong join, ambiguous metric...) and the correct SQL
   once the right levers are on. Generated SQL is then REALLY executed against
   Daybreak via sql.js and compared to the gold result - so right/wrong is
   measured by execution, not asserted.

   Levers (the course's accuracy ladder, one per builder session):
     schema      b2 - schema linking (right tables/columns in context)
     examples    b3 - few-shot example pairs
     rag         b4 - RAG-retrieved metadata + docs
     semantic    b5 - semantic layer (metric + filter definitions)
     selfcorrect b6 - execute, catch errors, retry

   Markup:
     <div class="t2s" data-mode="playground"
          data-levers="schema,examples"     levers shown (default: all five)
          data-on="schema"                  levers ON at load
          data-q="1,2,3"></div>             question subset (default: all 12)
     <div class="t2s" data-mode="scorecard" data-levers="..." data-on="..."></div>
   data-mode="playground": pick one question, run, inspect SQL + result + verdict.
   data-mode="scorecard": run the whole golden set, show accuracy bar. */

(function () {
  var LEVERS = [
    { key: "schema",      label: "Schema linking" },
    { key: "examples",    label: "Few-shot examples" },
    { key: "rag",         label: "RAG over metadata" },
    { key: "semantic",    label: "Semantic layer" },
    { key: "selfcorrect", label: "Self-correction" }
  ];

  /* The golden set. fails[] is checked in order: the first entry whose lever
     is OFF is what the simulated model produces. err:true fails raise a real
     SQLite error - those are the ONLY ones self-correction can catch (it
     retries on the error message). Silent-wrong SQL sails straight through:
     the core lesson. */
  var GOLDEN = [
    { id: 1, q: "How many customers do we have?",
      gold: "SELECT COUNT(*) AS customers FROM customers;",
      fails: [] },

    { id: 2, q: "How many customers are on the Pro plan?",
      gold: "SELECT COUNT(*) AS pro_customers FROM customers WHERE plan = 'Pro';",
      fails: [
        { lever: "schema", err: true,
          sql: "SELECT COUNT(*) FROM customers WHERE subscription_tier = 'Pro';",
          why: "Without schema linking the model guesses a plausible column name - subscription_tier does not exist, so the database throws an error." }
      ] },

    { id: 3, q: "Which city has the most customers?",
      gold: "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC LIMIT 1;",
      fails: [
        { lever: "schema", err: true,
          sql: "SELECT city, COUNT(*) AS n FROM users GROUP BY city ORDER BY n DESC LIMIT 1;",
          why: "The model invents a users table - a classic hallucination when the real table list is not in context." }
      ] },

    { id: 4, q: "What is our total revenue from delivered orders?",
      gold: "SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id\nWHERE o.status = 'delivered';",
      fails: [
        { lever: "schema", err: true,
          sql: "SELECT SUM(amount) AS revenue FROM orders WHERE status = 'delivered';",
          why: "No amount column exists on orders - revenue lives in order_items. Schema linking would have surfaced that." },
        { lever: "semantic", err: false,
          sql: "SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi;",
          why: "Plausible and runs fine - but it counts cancelled and pending orders too. Only a semantic layer defines revenue = delivered orders only." }
      ] },

    { id: 5, q: "Top 3 products by units sold",
      gold: "SELECT p.name, SUM(oi.quantity) AS units\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.name ORDER BY units DESC LIMIT 3;",
      fails: [
        { lever: "examples", err: false,
          sql: "SELECT p.name, COUNT(*) AS units\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY p.name ORDER BY units DESC LIMIT 3;",
          why: "COUNT(*) counts order lines, not units - a 5-bag line counts as 1. A few-shot example of a correct quantity query teaches SUM(quantity)." }
      ] },

    { id: 6, q: "What is our average order value?",
      gold: "SELECT ROUND(AVG(order_total), 2) AS avg_order_value FROM (\n  SELECT SUM(quantity * unit_price) AS order_total\n  FROM order_items GROUP BY order_id\n);",
      fails: [
        { lever: "examples", err: false,
          sql: "SELECT ROUND(AVG(quantity * unit_price), 2) AS avg_order_value FROM order_items;",
          why: "Averages line items, not orders - a multi-item order gets split. Example pairs showing the group-then-average pattern fix this." }
      ] },

    { id: 7, q: "How many active subscriptions do we have?",
      gold: "SELECT COUNT(*) AS active_subs FROM subscriptions WHERE cancel_date IS NULL;",
      fails: [
        { lever: "rag", err: false,
          sql: "SELECT COUNT(*) AS active_subs FROM subscriptions;",
          why: "Counts every subscription ever - the model cannot know that active means cancel_date IS NULL unless retrieved docs say so." }
      ] },

    { id: 8, q: "Monthly order counts for Q1 2026",
      gold: "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders\nFROM orders\nWHERE order_date >= '2026-01-01' AND order_date < '2026-04-01'\nGROUP BY month ORDER BY month;",
      fails: [
        { lever: "rag", err: false,
          sql: "SELECT order_date, COUNT(*) AS orders\nFROM orders\nWHERE order_date >= '2026-01-01' AND order_date < '2026-04-01'\nGROUP BY order_date ORDER BY order_date;",
          why: "Groups by day, not month - retrieved docs noting dates are stored as TEXT and monthly rollups use strftime('%Y-%m', ...) prevent this." }
      ] },

    { id: 9, q: "How many subscriptions were cancelled in March 2026?",
      gold: "SELECT COUNT(*) AS churned FROM subscriptions\nWHERE cancel_date >= '2026-03-01' AND cancel_date < '2026-04-01';",
      fails: [
        { lever: "schema", err: true,
          sql: "SELECT COUNT(*) AS churned FROM churn WHERE month = '2026-03';",
          why: "There is no churn table - the model invents one because churn is business vocabulary, not schema vocabulary." },
        { lever: "semantic", err: false,
          sql: "SELECT COUNT(*) AS churned FROM orders\nWHERE status = 'cancelled'\n  AND order_date >= '2026-03-01' AND order_date < '2026-04-01';",
          why: "Runs fine, looks right - but cancelled ORDERS are not cancelled SUBSCRIPTIONS. Only a semantic definition of churn disambiguates." }
      ] },

    { id: 10, q: "Revenue per customer - top 5",
      gold: "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY c.name ORDER BY revenue DESC LIMIT 5;",
      fails: [
        { lever: "examples", err: true,
          sql: "SELECT c.name, SUM(o.total) AS revenue\nFROM customers c JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.name ORDER BY revenue DESC LIMIT 5;",
          why: "Assumes an order total column instead of walking the two-join path through order_items - example queries teach the join path." },
        { lever: "semantic", err: false,
          sql: "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY c.name ORDER BY revenue DESC LIMIT 5;",
          why: "Silently includes cancelled orders in each customer's revenue - the delivered-only rule is a metric definition, not schema knowledge." }
      ] },

    { id: 11, q: "Which sales channel drives the most revenue?",
      gold: "SELECT o.channel, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM orders o JOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'delivered'\nGROUP BY o.channel ORDER BY revenue DESC;",
      fails: [
        { lever: "semantic", err: false,
          sql: "SELECT channel, COUNT(*) AS orders FROM orders\nGROUP BY channel ORDER BY orders DESC;",
          why: "Answers most orders when the question asked most revenue - metric ambiguity a semantic layer resolves." }
      ] },

    { id: 12, q: "What share of January 2026 signups placed an order within 30 days?",
      gold: "SELECT ROUND(100.0 * COUNT(DISTINCT o.customer_id) / COUNT(DISTINCT c.customer_id), 1) AS pct\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\n  AND o.order_date <= date(c.signup_date, '+30 days')\nWHERE c.signup_date >= '2026-01-01' AND c.signup_date < '2026-02-01';",
      fails: [
        { lever: "rag", err: true,
          sql: "SELECT ROUND(100.0 * COUNT(DISTINCT o.customer_id) / COUNT(DISTINCT c.customer_id), 1) AS pct\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\n  AND o.order_date <= c.first_order_deadline\nWHERE c.signup_date >= '2026-01-01' AND c.signup_date < '2026-02-01';",
          why: "Hallucinates a helper column instead of SQLite date arithmetic - retrieved docs on date functions prevent it." },
        { lever: "dialect", err: true,
          sql: "SELECT ROUND(100.0 * COUNT(DISTINCT o.customer_id) / COUNT(DISTINCT c.customer_id), 1) AS pct\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\n  AND DATEDIFF(day, c.signup_date, o.order_date) <= 30\nWHERE c.signup_date >= '2026-01-01' AND c.signup_date < '2026-02-01';",
          why: "DATEDIFF is T-SQL, not SQLite - a dialect slip even a fully-contexted model makes. Only the self-correction loop catches the database error and retries with date()." }
      ] }
  ];

  var SQLReady = null;
  function loadEngine() {
    if (SQLReady) return SQLReady;
    SQLReady = new Promise(function (resolve, reject) {
      if (typeof initSqlJs !== "function") { reject(new Error("sql-wasm.js did not load")); return; }
      initSqlJs({ locateFile: function (f) { return "../assets/" + f; } }).then(resolve, reject);
    });
    return SQLReady;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* the simulated model: returns {sql, wrong, why, corrected[]} */
  function generate(question, on) {
    var corrected = [];
    for (var i = 0; i < question.fails.length; i++) {
      var f = question.fails[i];
      if (on[f.lever]) continue;
      if (f.err && on.selfcorrect) { corrected.push(f); continue; }
      return { sql: f.sql, wrong: true, err: f.err, why: f.why, corrected: corrected };
    }
    return { sql: question.gold, wrong: false, corrected: corrected };
  }

  function exec(SQL, sql) {
    var db = new SQL.Database();
    try {
      db.run(window.DAYBREAK_SEED || "");
      var res = db.exec(sql);
      return { ok: true, res: res };
    } catch (e) {
      return { ok: false, msg: e.message };
    } finally { db.close(); }
  }

  function sameResult(a, b) {
    return JSON.stringify(a.res) === JSON.stringify(b.res);
  }

  function renderTable(res) {
    if (!res || !res.length) return '<p class="t2s-note">Query ran. No rows returned.</p>';
    var html = "";
    res.forEach(function (r) {
      html += '<div class="t2s-table"><table><thead><tr>';
      r.columns.forEach(function (c) { html += "<th>" + esc(c) + "</th>"; });
      html += "</tr></thead><tbody>";
      r.values.slice(0, 12).forEach(function (row) {
        html += "<tr>";
        row.forEach(function (v) { html += "<td>" + (v === null ? "NULL" : esc(v)) + "</td>"; });
        html += "</tr>";
      });
      html += "</tbody></table></div>";
    });
    return html;
  }

  function leverState(block) {
    var attr = block.getAttribute("data-levers");
    if (attr === null) attr = "schema,examples,rag,semantic,selfcorrect";
    var shown = attr.split(",").filter(Boolean);
    var start = (block.getAttribute("data-on") || "").split(",").filter(Boolean);
    var on = {};
    LEVERS.forEach(function (l) { on[l.key] = start.indexOf(l.key) !== -1; });
    return { shown: shown, on: on };
  }

  function buildLevers(block, state, onChange) {
    var wrap = document.createElement("div");
    wrap.className = "t2s-levers";
    LEVERS.forEach(function (l) {
      if (state.shown.indexOf(l.key) === -1) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "t2s-lever" + (state.on[l.key] ? " on" : "");
      b.textContent = (state.on[l.key] ? "● " : "○ ") + l.label;
      b.addEventListener("click", function () {
        state.on[l.key] = !state.on[l.key];
        b.className = "t2s-lever" + (state.on[l.key] ? " on" : "");
        b.textContent = (state.on[l.key] ? "● " : "○ ") + l.label;
        onChange();
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function questionSubset(block) {
    var attr = block.getAttribute("data-q");
    if (!attr) return GOLDEN;
    var ids = attr.split(",").map(function (s) { return parseInt(s, 10); });
    return GOLDEN.filter(function (g) { return ids.indexOf(g.id) !== -1; });
  }

  function wirePlayground(block) {
    var state = leverState(block);
    var qs = questionSubset(block);

    block.innerHTML = "";
    block.classList.add("t2s-panel");
    var title = document.createElement("div");
    title.className = "t2s-title";
    title.textContent = "🤖 DaybreakGPT - simulated text-to-SQL model";
    block.appendChild(title);

    var sel = document.createElement("select");
    sel.className = "t2s-q";
    qs.forEach(function (g, i) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = "Q" + g.id + " · " + g.q;
      sel.appendChild(o);
    });
    block.appendChild(sel);

    var out = document.createElement("div");
    var run = document.createElement("button");
    run.type = "button"; run.className = "t2s-run"; run.textContent = "▶ Ask the model";
    var row = document.createElement("div");
    row.className = "t2s-row";
    row.appendChild(run);
    block.appendChild(buildLevers(block, state, function () {}));
    block.appendChild(row);
    block.appendChild(out);

    var note = document.createElement("p");
    note.className = "t2s-note";
    note.textContent = "Simulated model: deterministic, built for teaching - each missing lever produces the characteristic real-world failure. The SQL genuinely executes against Daybreak in your browser.";
    block.appendChild(note);

    run.addEventListener("click", function () {
      var g = qs[parseInt(sel.value, 10)];
      out.innerHTML = '<p class="t2s-note">Generating + executing...</p>';
      loadEngine().then(function (SQL) {
        var gen = generate(g, state.on);
        var got = exec(SQL, gen.sql);
        var gold = exec(SQL, g.gold);
        var html = "";
        gen.corrected.forEach(function (c) {
          html += '<div class="t2s-note">↻ 1st attempt errored (' + esc(c.sql.split("\n")[0]) + "...) - self-correction caught the database error and retried.</div>";
        });
        html += '<div class="t2s-sql">' + esc(gen.sql) + "</div>";
        if (!got.ok) {
          html += '<span class="t2s-verdict bad">✗ Database error (a LOUD failure)</span>';
          html += '<p class="t2s-note">' + esc(got.msg) + "</p>";
        } else {
          html += renderTable(got.res);
          if (sameResult(got, gold)) {
            html += '<span class="t2s-verdict ok">✓ Matches the gold answer</span>';
          } else {
            html += '<span class="t2s-verdict bad">✗ Plausible but WRONG (a SILENT failure)</span>';
          }
        }
        if (gen.wrong && gen.why) html += '<p class="t2s-note"><b>Why:</b> ' + esc(gen.why) + "</p>";
        out.innerHTML = html;
      }, function (err) {
        out.innerHTML = '<p class="t2s-note">Engine failed to load: ' + esc(err.message) + "</p>";
      });
    });
  }

  function wireScorecard(block) {
    var state = leverState(block);
    var qs = questionSubset(block);

    block.innerHTML = "";
    block.classList.add("t2s-panel");
    var title = document.createElement("div");
    title.className = "t2s-title";
    title.textContent = "📊 Golden-set scorecard - " + qs.length + " questions, execution accuracy";
    block.appendChild(title);

    var out = document.createElement("div");
    var score = document.createElement("div");
    score.className = "t2s-score";
    score.innerHTML = '<div class="bar"><div class="fill" style="width:0%"></div></div><span class="num">- / ' + qs.length + "</span>";
    var run = document.createElement("button");
    run.type = "button"; run.className = "t2s-run"; run.textContent = "▶ Run the golden set";
    var row = document.createElement("div"); row.className = "t2s-row"; row.appendChild(run);

    block.appendChild(buildLevers(block, state, function () {}));
    block.appendChild(row);
    block.appendChild(score);
    block.appendChild(out);

    var note = document.createElement("p");
    note.className = "t2s-note";
    note.textContent = "Execution accuracy: generated SQL runs against Daybreak and its result set is compared to the gold query's result. Same idea as Spider/BIRD EX - on a 12-question set you fully control.";
    block.appendChild(note);

    run.addEventListener("click", function () {
      out.innerHTML = "";
      loadEngine().then(function (SQL) {
        var right = 0, rows = "";
        qs.forEach(function (g) {
          var gen = generate(g, state.on);
          var got = exec(SQL, gen.sql);
          var gold = exec(SQL, g.gold);
          var ok = got.ok && sameResult(got, gold);
          if (ok) right++;
          var mark = ok ? "✓" : (got.ok ? "✗ silent" : "✗ error");
          rows += '<div class="covered-row"><span class="status pill ' + (ok ? "solid" : "light") + '">' + mark +
                  '</span><span class="name">Q' + g.id + "</span><span class=\"note\">" + esc(g.q) + "</span></div>";
        });
        var pct = Math.round(100 * right / qs.length);
        score.querySelector(".fill").style.width = pct + "%";
        score.querySelector(".num").textContent = right + " / " + qs.length + " · " + pct + "%";
        out.innerHTML = '<div class="covered">' + rows + "</div>";
      }, function (err) {
        out.innerHTML = '<p class="t2s-note">Engine failed to load: ' + esc(err.message) + "</p>";
      });
    });
  }

  function init() {
    Array.prototype.slice.call(document.querySelectorAll(".t2s")).forEach(function (block) {
      if ((block.getAttribute("data-mode") || "playground") === "scorecard") wireScorecard(block);
      else wirePlayground(block);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
