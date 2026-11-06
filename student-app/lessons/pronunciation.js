/* Verified pronunciations for lesson terms (shared by every lesson; no network use, so it works offline once cached).
 *
 * Source: Merriam-Webster (merriam-webster.com), Medical Dictionary where it has an entry, otherwise the general
 * dictionary. Each source keeps MW's own notation exactly as the entry shows it, its URL and the date it was read,
 * so any line can be audited. Each notation was read from the live entry twice, with two differently worded requests,
 * and both reads agreed character for character. Rules:
 *   - Only a word whose pronunciation MW gives in full is shown. No pronunciation is ever made up or pieced together.
 *     (MW sometimes gives a shortened form like "-ˌspī-ˈnāt-əs" that depends on another entry; those are not used.)
 *   - The first pronunciation MW lists is used. Sounds MW marks as optional, in parentheses, are left out of the simple
 *     spelling; the original notation stays in the source line.
 *   - A word inside a multi-word entry (for example "-ab-ˈdäm-ə-nəs" in "rectus abdominis") comes from that entry,
 *     and a term's own entry beats any other.
 *   - The simple spelling is computed from MW's notation by respell() below (one fixed key, tested). Only the main
 *     stressed syllable of each word is in capitals.
 *   - A term shows a pronunciation only if every word in it is verified or an everyday English word.
 * No dictionary audio is copied. "Hear it" opens the Merriam-Webster entry, which has its own audio, when online.
 */
(function (global) {
  "use strict";
  var CHECKED = "2026-11-06";
  var MED = "Merriam-Webster Medical Dictionary", GEN = "Merriam-Webster (general dictionary)";
  var MW = "https://www.merriam-webster.com/";
  // Each source: the entry as MW names it, which dictionary, the page read, and MW's notation exactly as shown there.
  var SOURCES = {
    masseter: { entry: "masseter", dict: MED, url: MW + "dictionary/masseter", notation: "mə-ˈsēt-ər, ma-" },
    buccinator: { entry: "buccinator", dict: MED, url: MW + "dictionary/buccinator%20muscle", notation: "ˈbək-sə-ˌnāt-ər" },
    temporalis: { entry: "temporalis", dict: MED, url: MW + "dictionary/temporalis%20muscle", notation: "ˌtem-pə-ˈrā-ˌləs" },
    sternocleidomastoid: { entry: "sternocleidomastoid", dict: MED, url: MW + "dictionary/sternocleidomastoid%20muscle", notation: "ˌstər-nō-ˌklīd-ə-ˈmas-ˌtȯid" },
    occipitofrontalis: { entry: "occipitofrontalis", dict: MED, url: MW + "dictionary/occipitofrontalis", notation: "äk-ˌsip-ət-ō-frən-ˈtā-ləs" },
    oculi: { entry: "oculus, plural oculi", dict: GEN, url: MW + "dictionary/oculi", notation: "ˈä-kyə-ˌlī, -ˌlē" },
    orbicularisOris: { entry: "orbicularis oris", dict: MED, url: MW + "medical/orbicularis%20oris", notation: "-ˈōr-əs" },
    rectus: { entry: "rectus", dict: MED, url: MW + "medical/rectus", notation: "ˈrek-təs" },
    rectusAbdominis: { entry: "rectus abdominis", dict: MED, url: MW + "medical/rectus%20abdominis", notation: "-ab-ˈdäm-ə-nəs" },
    oblique: { entry: "oblique", dict: MED, url: MW + "medical/oblique", notation: "ō-ˈblēk, ə-, -ˈblīk" },
    transversusAbdominis: { entry: "transversus abdominis", dict: MED, url: MW + "dictionary/transversus%20abdominis", notation: "tran(t)s-ˈvər-səs-əb-ˈdäm-ə-nəs" },
    diaphragm: { entry: "diaphragm", dict: MED, url: MW + "dictionary/diaphragm", notation: "ˈdī-ə-ˌfram" },
    intercostal: { entry: "intercostal", dict: MED, url: MW + "medical/intercostal", notation: "ˌint-ər-ˈkäs-tᵊl" },
    pronatorQuadratus: { entry: "pronator quadratus", dict: MED, url: MW + "medical/pronator%20quadratus", notation: "-kwä-ˈdrāt-əs" },
    quadratusLumborum: { entry: "quadratus lumborum", dict: MED, url: MW + "dictionary/quadratus%20lumborum", notation: "-ləm-ˈbȯr-əm" },
    trapezius: { entry: "trapezius", dict: MED, url: MW + "dictionary/trapezius", notation: "trə-ˈpē-zē-əs, tra-" },
    deltoid: { entry: "deltoid", dict: MED, url: MW + "dictionary/deltoid%20muscle", notation: "ˈdel-ˌtȯid" },
    pectoralis: { entry: "pectoralis", dict: MED, url: MW + "medical/pectoralis", notation: "ˌpek-tə-ˈrā-ləs" },
    serratus: { entry: "serratus", dict: MED, url: MW + "medical/serratus", notation: "se-ˈrāt-əs" },
    latissimusDorsi: { entry: "latissimus dorsi", dict: MED, url: MW + "medical/latissimus%20dorsi", notation: "lə-ˈtis-ə-məs-ˈdȯr-ˌsī" },
    infraspinatus: { entry: "infraspinatus", dict: MED, url: MW + "medical/infraspinati", notation: "ˌin-frə-spī-ˈnāt-əs" },
    teresMajor: { entry: "teres major", dict: MED, url: MW + "medical/teres%20major", notation: "ˈter-ēz-, ˈtir-" },
    subscapularis: { entry: "subscapularis", dict: MED, url: MW + "medical/subscapularis", notation: "ˌsəb-ˌskap-yə-ˈlar-əs" },
    biceps: { entry: "biceps", dict: MED, url: MW + "dictionary/biceps%20brachii", notation: "ˈbī-ˌseps" },
    bicepsBrachii: { entry: "biceps brachii", dict: MED, url: MW + "dictionary/biceps%20brachii", notation: "-ˈbrā-kē-ˌē, -ˌī" },
    brachialis: { entry: "brachialis", dict: MED, url: MW + "medical/brachialis", notation: "ˌbrā-kē-ˈal-əs, -ˈāl-, -ˈäl-" },
    brachioradialis: { entry: "brachioradialis", dict: MED, url: MW + "medical/brachioradialis", notation: "ˌbrā-kē-ō-ˌrād-ē-ˈal-əs, -ˈāl-, -ˈäl-" },
    triceps: { entry: "triceps", dict: MED, url: MW + "medical/triceps", notation: "ˈtrī-ˌseps" },
    tricepsBrachii: { entry: "triceps brachii", dict: MED, url: MW + "dictionary/triceps%20brachii", notation: "-ˈbrā-kē-ˌī" },
    pronator: { entry: "pronator", dict: MED, url: MW + "medical/pronator", notation: "ˈprō-ˌnāt-ər" },
    pronatorTeres: { entry: "pronator teres", dict: MED, url: MW + "dictionary/pronator%20teres", notation: "-ˈtir-ˌēz" },
    supinator: { entry: "supinator", dict: MED, url: MW + "medical/supinator", notation: "ˈsü-pə-ˌnāt-ər" },
    flexor: { entry: "flexor", dict: MED, url: MW + "medical/flexor", notation: "ˈflek-sər, -ˌsȯ(ə)r" },
    flexorCarpiRadialis: { entry: "flexor carpi radialis", dict: MED, url: MW + "dictionary/flexor%20carpi%20radialis", notation: "-ˈkär-ˌpī-ˌrā-dē-ˈā-ləs, -ˈkär-ˌpē-" },
    flexorCarpiUlnaris: { entry: "flexor carpi ulnaris", dict: MED, url: MW + "dictionary/flexor%20carpi%20ulnaris", notation: "-ˌəl-ˈnar-əs" },
    extensorCarpiUlnaris: { entry: "extensor carpi ulnaris", dict: MED, url: MW + "medical/extensor%20carpi%20ulnaris", notation: "-ˌəl-ˈnar-əs" },
    palmaris: { entry: "palmaris", dict: MED, url: MW + "medical/palmaris", notation: "pal-ˈmar-əs" },
    palmarisLongus: { entry: "palmaris longus", dict: MED, url: MW + "dictionary/palmaris%20longus", notation: "-ˈlȯŋ-gəs" },
    extensorCarpiRadialisLongus: { entry: "extensor carpi radialis longus", dict: MED, url: MW + "medical/extensor%20carpi%20radialis%20longus", notation: "-ˈlȯŋ-gəs" },
    extensorDigitorumBrevis: { entry: "extensor digitorum brevis", dict: MED, url: MW + "medical/extensor%20digitorum%20brevis", notation: "-ˌdij-ə-ˈtōr-əm-ˈbrev-əs" },
    flexorDigitorumSuperficialis: { entry: "flexor digitorum superficialis", dict: MED, url: MW + "dictionary/flexor%20digitorum%20superficialis", notation: "-ˌsü-pər-ˌfish-ē-ˈā-ləs" },
    extensor: { entry: "extensor", dict: MED, url: MW + "dictionary/extensor%20muscle", notation: "ik-ˈsten(t)-sər, -sȯ(ə)r" }
  };
  // word: [the part of the source notation for this word (first listed pronunciation), source key]
  var WORDS = {
    masseter: ["mə-ˈsēt-ər", "masseter"], buccinator: ["ˈbək-sə-ˌnāt-ər", "buccinator"], temporalis: ["ˌtem-pə-ˈrā-ˌləs", "temporalis"],
    sternocleidomastoid: ["ˌstər-nō-ˌklīd-ə-ˈmas-ˌtȯid", "sternocleidomastoid"], occipitofrontalis: ["äk-ˌsip-ət-ō-frən-ˈtā-ləs", "occipitofrontalis"],
    oculi: ["ˈä-kyə-ˌlī", "oculi"], oris: ["ˈōr-əs", "orbicularisOris"],
    rectus: ["ˈrek-təs", "rectus"], abdominis: ["ab-ˈdäm-ə-nəs", "rectusAbdominis"], oblique: ["ō-ˈblēk", "oblique"],
    transversus: ["tran(t)s-ˈvər-səs", "transversusAbdominis"], diaphragm: ["ˈdī-ə-ˌfram", "diaphragm"], intercostal: ["ˌint-ər-ˈkäs-tᵊl", "intercostal"],
    quadratus: ["kwä-ˈdrāt-əs", "pronatorQuadratus"], lumborum: ["ləm-ˈbȯr-əm", "quadratusLumborum"],
    trapezius: ["trə-ˈpē-zē-əs", "trapezius"], deltoid: ["ˈdel-ˌtȯid", "deltoid"], pectoralis: ["ˌpek-tə-ˈrā-ləs", "pectoralis"],
    serratus: ["se-ˈrāt-əs", "serratus"], latissimus: ["lə-ˈtis-ə-məs", "latissimusDorsi"], dorsi: ["ˈdȯr-ˌsī", "latissimusDorsi"],
    infraspinatus: ["ˌin-frə-spī-ˈnāt-əs", "infraspinatus"], teres: ["ˈter-ēz", "teresMajor"], subscapularis: ["ˌsəb-ˌskap-yə-ˈlar-əs", "subscapularis"],
    biceps: ["ˈbī-ˌseps", "biceps"], brachii: ["ˈbrā-kē-ˌē", "bicepsBrachii"], brachialis: ["ˌbrā-kē-ˈal-əs", "brachialis"],
    brachioradialis: ["ˌbrā-kē-ō-ˌrād-ē-ˈal-əs", "brachioradialis"], triceps: ["ˈtrī-ˌseps", "triceps"],
    pronator: ["ˈprō-ˌnāt-ər", "pronator"], supinator: ["ˈsü-pə-ˌnāt-ər", "supinator"], flexor: ["ˈflek-sər", "flexor"],
    carpi: ["ˈkär-ˌpī", "flexorCarpiRadialis"], radialis: ["ˌrā-dē-ˈā-ləs", "flexorCarpiRadialis"], ulnaris: ["ˌəl-ˈnar-əs", "flexorCarpiUlnaris"],
    palmaris: ["pal-ˈmar-əs", "palmaris"], longus: ["ˈlȯŋ-gəs", "palmarisLongus"], digitorum: ["ˌdij-ə-ˈtōr-əm", "extensorDigitorumBrevis"],
    superficialis: ["ˌsü-pər-ˌfish-ē-ˈā-ləs", "flexorDigitorumSuperficialis"], extensor: ["ik-ˈsten(t)-sər", "extensor"]
  };
  // A term's own entry beats the default source for a word.
  var IN_TERM = {
    "transversus abdominis": { abdominis: ["əb-ˈdäm-ə-nəs", "transversusAbdominis"] },
    "triceps brachii": { brachii: ["ˈbrā-kē-ˌī", "tricepsBrachii"] },
    "pronator teres": { teres: ["ˈtir-ˌēz", "pronatorTeres"] },
    "extensor carpi radialis longus": { longus: ["ˈlȯŋ-gəs", "extensorCarpiRadialisLongus"] },
    "extensor carpi ulnaris": { ulnaris: ["ˌəl-ˈnar-əs", "extensorCarpiUlnaris"] }
  };
  // Everyday English words: shown as written, never looked up.
  var EVERYDAY = ["external", "internal", "major", "minor", "anterior", "frontal", "belly"];
  // MW gives the singular only; the term shows it with a note rather than adding a sound.
  var SINGULAR = { intercostals: "intercostal" };
  // Checked and not shown, with the reason (also listed in docs/PRONUNCIATION_REPORT.md).
  var NOT_VERIFIED = {
    orbicularis: "Merriam-Webster has no entry for orbicularis by itself. Its orbicularis oris entry gives a pronunciation only for oris, and its orbicularis oculi entry gives none.",
    supraspinatus: "Merriam-Webster gives only a shortened form, -ˌspī-ˈnāt-əs, that depends on a neighboring entry, so there is no full pronunciation to show."
  };

  // ---- MW notation -> simple spelling (one fixed key; see KEY) ----
  var VOWEL_END = { e: "eh", i: "ih" };
  function respellSyllable(s) {
    var primary = s.indexOf("ˈ") >= 0, stressed = primary || s.indexOf("ˌ") >= 0;
    s = s.replace(/[ˈˌ]/g, "");
    var out = "", i = 0;
    function at(t) { return s.substr(i, t.length) === t; }
    while (i < s.length) {
      if (at("ər")) { out += stressed ? "ur" : "er"; i += 2; }
      else if (at("au̇")) { out += "ow"; i += 3; }
      else if (at("ȯi")) { out += "oy"; i += 2; }
      else if (at("ȯr") || at("ōr")) { out += "or"; i += 2; }
      else if (at("är")) { out += "ar"; i += 2; }
      else if (at("ar")) { out += "arr"; i += 2; }
      else if (at("er")) { out += "err"; i += 2; }
      else if (at("ir")) { out += "eer"; i += 2; }
      else if (at("yü")) { out += "yoo"; i += 2; }
      else if (at("u̇")) { out += "uu"; i += 2; }
      else if (at("t͟h")) { out += "th"; i += 3; }
      else {
        var c = s[i], map = { "ā": "ay", "ä": "ah", "ē": "ee", "ō": "oh", "ȯ": "aw", "ü": "oo", "ə": "uh", "ᵊ": "uh", "ŋ": "ng" };
        if (c === "ī") out += out === "" ? "eye" : "y";
        else if (map[c]) out += map[c];
        else if (VOWEL_END[c] && i === s.length - 1) out += VOWEL_END[c];
        else out += c;
        i++;
      }
    }
    return primary ? out.toUpperCase() : out;
  }
  function respell(mw) {
    var first = mw.split(",")[0].trim().replace(/\([^)]*\)/g, "").replace(/^-+|-+$/g, "");
    return first.split("-").filter(Boolean).map(respellSyllable).join("-");
  }
  var KEY = "CAPITALS = the syllable to stress · uh = a in about · ay = say · ee = see · ah = father · oh = go · aw = law · oo = food · " +
    "y or eye = the i in kite · er = butter · ur = fur · arr = carry · err = merry · eer = deer";

  // ---- terms ----
  function termWords(name) { return name.replace(/\([^)]*\)/g, " ").trim().toLowerCase().split(/\s+/); }
  function lookup(termLower, w) {
    var own = IN_TERM[termLower] && IN_TERM[termLower][w];
    var single = SINGULAR[w], hit = own || WORDS[single || w];
    if (!hit) return null;
    return { word: w, singular: single || null, say: respell(hit[0]), mw: hit[0], source: hit[1] };
  }
  // { ok, text, parts, sources, missing }; ok is false when any word is unverified or the name has only everyday words.
  function forTerm(name) {
    var words = termWords(name), t = words.join(" "), parts = [], missing = [];
    words.forEach(function (w) {
      if (EVERYDAY.indexOf(w) >= 0) { parts.push({ word: w, plain: true }); return; }
      var p = lookup(t, w); if (p) parts.push(p); else missing.push(w);
    });
    var looked = parts.filter(function (p) { return !p.plain; });
    if (missing.length || !looked.length) return { ok: false, missing: missing, parts: parts };
    var srcs = []; looked.forEach(function (p) { if (srcs.indexOf(p.source) < 0) srcs.push(p.source); });
    return { ok: true, missing: [], parts: parts, text: parts.map(function (p) { return p.plain ? p.word : p.say; }).join(" "),
      singular: looked.filter(function (p) { return p.singular; }).map(function (p) { return p.singular; }),
      sources: srcs.map(function (k) { var s = SOURCES[k]; return { key: k, entry: s.entry, dict: s.dict, url: s.url, notation: s.notation, checked: CHECKED }; }) };
  }
  global.Pronunciations = { SOURCES: SOURCES, WORDS: WORDS, IN_TERM: IN_TERM, EVERYDAY: EVERYDAY, SINGULAR: SINGULAR, NOT_VERIFIED: NOT_VERIFIED,
    CHECKED: CHECKED, KEY: KEY, respell: respell, forTerm: forTerm };
})(typeof window !== "undefined" ? window : globalThis);
