import { useState, useEffect } from "react";
import dataAr from "./data/prayer_four_madhhabs.json";
import dataDe from "./data/prayer_four_madhhabs.de.json";
import wuduAr from "./data/wudu.json";
import wuduDe from "./data/wudu.de.json";
import { UI, MADHHABS } from "./i18n.js";

const TAB_IDS = ["wudu", "conditions", "prayer", "adhkar", "more", "sources", "quiz"];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

function initialLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "ar" || saved === "de") return saved;
  } catch {}
  return navigator.language && navigator.language.startsWith("de") ? "de" : "ar";
}

function MadhhabPicker({ value, onChange, lang }) {
  const t = UI[lang];
  return (
    <div className="picker" role="group" aria-label={t.madhhabLabel}>
      <button className={value === "all" ? "on" : ""} onClick={() => onChange("all")}>
        {t.all}
      </button>
      {MADHHABS.map((m) => (
        <button key={m.key} className={value === m.key ? "on" : ""} onClick={() => onChange(m.key)}>
          {m[lang]}
        </button>
      ))}
    </div>
  );
}

function RulingCard({ item, sel, lang }) {
  const list = sel === "all" ? MADHHABS : MADHHABS.filter((m) => m.key === sel);
  return (
    <article className="card">
      <h3>
        {item.topic}
        {lang === "de" && item.topic_latin && item.topic_ar && (
          <small className="ar" dir="rtl">{item.topic_ar}</small>
        )}
        {item.topic_latin && <small dir="ltr">{item.topic_latin}</small>}
      </h3>
      <dl>
        {list.map(
          (m) =>
            item[m.key] && (
              <div key={m.key}>
                <dt>{m[lang]}</dt>
                <dd>{item[m.key]}</dd>
              </div>
            )
        )}
      </dl>
      {item.notes && <p className="note">{item.notes}</p>}
    </article>
  );
}

function RulingList({ items, lang }) {
  const t = UI[lang];
  const [sel, setSel] = useState("all");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = items.filter(
    (i) =>
      !needle ||
      i.topic.toLowerCase().includes(needle) ||
      (i.topic_ar || "").includes(needle) ||
      (i.topic_latin || "").toLowerCase().includes(needle)
  );
  return (
    <>
      <MadhhabPicker value={sel} onChange={setSel} lang={lang} />
      <input className="search" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid">
        {shown.map((i) => (
          <RulingCard key={i.topic} item={i} sel={sel} lang={lang} />
        ))}
        {!shown.length && <p>{t.noResults}</p>}
      </div>
    </>
  );
}

function Wudu({ w, lang }) {
  const t = UI[lang];
  const [done, setDone] = useState({});
  const [sel, setSel] = useState("all");
  const count = Object.values(done).filter(Boolean).length;
  return (
    <>
      <p className="basis">{w.basis}</p>
      <h2>{t.wuduSteps}</h2>
      <p className="progress">{t.progress(count, w.steps.length)}</p>
      <ol className="steps">
        {w.steps.map((s, i) => (
          <li key={i} className={done[i] ? "done" : ""}>
            <label>
              <input type="checkbox" checked={!!done[i]} onChange={() => setDone({ ...done, [i]: !done[i] })} />
              <span className="stepbody">
                <strong>{lang === "de" ? s.title : s.ar}</strong>
                <em className={/فرض|Fard/.test(s.kind) ? "fard" : ""}>{s.kind}</em>
                {lang === "de" && <small className="ar" dir="rtl">{s.ar}</small>}
                <small dir="ltr">{s.latin}</small>
                <span>{s.detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ol>
      <h2>{t.diffs}</h2>
      <MadhhabPicker value={sel} onChange={setSel} lang={lang} />
      <div className="grid">
        {w.differences.map((d) => (
          <RulingCard key={d.topic} item={d} sel={sel} lang={lang} />
        ))}
      </div>
      <h2>{t.nullifiers}</h2>
      <ul>{w.nullifiers.map((n) => <li key={n}>{n}</li>)}</ul>
    </>
  );
}

function SimpleCards({ items, titleKey, textKey }) {
  return (
    <div className="grid">
      {items.map((x) => (
        <article className="card" key={x[titleKey]}>
          <h3>{x[titleKey]}</h3>
          <p>{x[textKey]}</p>
        </article>
      ))}
    </div>
  );
}

function More({ data, lang }) {
  const t = UI[lang];
  const s = data.sujud_sahw;
  return (
    <>
      <h2>{t.terminology}</h2>
      <SimpleCards items={data.terminology} titleKey="term" textKey="definition" />
      <h2>{t.qunut}</h2>
      <SimpleCards items={data.qunut} titleKey="madhhab" textKey="summary" />
      <h2>{t.sahw}</h2>
      <p>{s.general_note}</p>
      <SimpleCards items={s.madhhabs} titleKey="madhhab" textKey="summary" />
      <h3>{t.examples}</h3>
      <ul>{s.examples.map((e) => <li key={e}>{e}</li>)}</ul>
      <p className="note">{s.important_rule}</p>
    </>
  );
}

function Sources({ data, lang }) {
  const t = UI[lang];
  return (
    <>
      <h2>{t.sourcesTitle}</h2>
      <div className="grid">
        {data.sources_for_further_expansion.map((s) => (
          <article className="card" key={s.url}>
            <h3>{s.title}</h3>
            <p className="note">{s.type}</p>
            <p>{s.status}</p>
            <a href={s.url} target="_blank" rel="noreferrer">{t.openLink}</a>
          </article>
        ))}
      </div>
      <h2>{t.refsTitle}</h2>
      <div className="grid">
        {data.recommended_primary_references.map((r) => (
          <article className="card" key={r.madhhab}>
            <h3>{r.madhhab}</h3>
            <ul>{r.works.map((w) => <li key={w}>{w}</li>)}</ul>
          </article>
        ))}
      </div>
    </>
  );
}

function makeQuestion(pool) {
  const item = pool[Math.floor(Math.random() * pool.length)];
  const m = MADHHABS[Math.floor(Math.random() * MADHHABS.length)];
  const answer = item[m.key];
  const others = [...new Set(pool.flatMap((i) => MADHHABS.map((x) => i[x.key])))].filter((v) => v && v !== answer);
  return { item, m, answer, opts: shuffle([answer, ...shuffle(others).slice(0, 3)]) };
}

function Quiz({ pool, lang }) {
  const t = UI[lang];
  const [q, setQ] = useState(() => makeQuestion(pool));
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const choose = (o) => {
    if (picked !== null) return;
    setPicked(o);
    setScore((s) => ({ ok: s.ok + (o === q.answer ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    setQ(makeQuestion(pool));
    setPicked(null);
  };
  return (
    <div className="quiz">
      <p className="progress">{t.score}: {score.ok} / {score.total}</p>
      <h3>{q.item.topic}</h3>
      <p>{t.question(q.m[lang])}</p>
      <div className="opts">
        {q.opts.map((o) => (
          <button
            key={o}
            onClick={() => choose(o)}
            className={picked === null ? "" : o === q.answer ? "right" : o === picked ? "wrong" : ""}
          >
            {o}
          </button>
        ))}
      </div>
      {picked !== null && <button className="next" onClick={next}>{t.next}</button>}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState(initialLang);
  const [tab, setTab] = useState("wudu");
  const t = UI[lang];
  const data = lang === "de" ? dataDe : dataAr;
  const wudu = lang === "de" ? wuduDe : wuduAr;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t.appTitle;
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang, t.appTitle]);

  return (
    <div className="app">
      <header>
        <button className="lang" onClick={() => setLang(lang === "ar" ? "de" : "ar")}>{t.langBtn}</button>
        <h1>{t.appTitle}</h1>
        <p>{t.tagline}</p>
      </header>
      <nav>
        {TAB_IDS.map((id) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            {t.tabs[id]}
          </button>
        ))}
      </nav>
      <main>
        {tab === "wudu" && <Wudu key={lang} w={wudu} lang={lang} />}
        {tab === "conditions" && <RulingList key={lang} items={data.conditions} lang={lang} />}
        {tab === "prayer" && <RulingList key={lang} items={data.prayer_components} lang={lang} />}
        {tab === "adhkar" && <RulingList key={lang} items={data.adhkar_and_sunan} lang={lang} />}
        {tab === "more" && <More data={data} lang={lang} />}
        {tab === "sources" && <Sources data={data} lang={lang} />}
        {tab === "quiz" && <Quiz key={lang} pool={data.adhkar_and_sunan} lang={lang} />}
      </main>
      <footer>
        {data.editorial_notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
        <p>{data.purpose}</p>
      </footer>
    </div>
  );
}
