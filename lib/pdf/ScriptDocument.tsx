import React from "react";
import {
  Circle,
  Document,
  Font,
  Image,
  Line,
  Page,
  StyleSheet,
  Svg,
  Text,
  View
} from "@react-pdf/renderer";
import { mix } from "@/lib/brandColors";
import type {
  BookletPage,
  FrameRow,
  FrameSection,
  Para
} from "@/lib/pdf/frame";
import type { PdfImage } from "@/lib/pdf/images";

/**
 * The speaking test on paper, laid out after Cambridge's own speaking papers:
 * a cover, then for each part the interlocutor frame — a tab with the part and
 * its timing, and a boxed script with the speaker and timing on the left and
 * the words on the right — followed by the candidate booklet pages it hands
 * out: photographs under their question, a mind map for the collaborative
 * task, or a C2 long-turn card.
 *
 * The school's name and logo stand where the paper has its publisher's, and
 * the accent tints the tabs. Nothing of Cambridge's own identity is used.
 */

type PhotoPage = Extract<BookletPage, { kind: "photos" }>;

export type RenderedBooklet =
  Exclude<BookletPage, PhotoPage> | (PhotoPage & { photos: PdfImage[] });

export type ScriptBranding = {
  name: string;
  accentColor: string | null;
  logo: PdfImage | null;
};

export type ScriptInput = {
  /** The cover's stacked lines: "B2 FIRST", "SPEAKING", "TERM 1 MOCK". */
  cover: string[];
  /** A line under the cover, such as when a practice's set was drawn. */
  note: string | null;
  /** The running header: "B2 First Speaking · Term 1 mock". */
  header: string;
  groups: { frames: FrameSection[]; booklet: RenderedBooklet[] }[];
  branding: ScriptBranding | null;
  /** The document title, for the PDF's own metadata. */
  title: string;
};

/* No hyphenation. The renderer breaks words by default, which splits a
   four-word mind-map prompt into "speak-" and "ers" for no gain in a box
   wide enough to hold it whole. */
Font.registerHyphenationCallback((word) => [word]);

const HOUSE_ACCENT = "#1f6e3c";

/* On every paper, branded or not: a school's name replaces ours in the
   header, but the paper still says where it came from. */
const PRODUCT = "SpeakGen";
// TODO: once the app's public URL is confirmed, credit it here instead, e.g.
// `Generated using speakgen.app`, so a printed paper tells a teacher where to
// find it. This one constant feeds the cover and every footer.
const CREDIT = `Generated using ${PRODUCT}`;
const INK = "#1d1d1d";
const RULE = "#6b6b6b";

// A4 in points, and the measure inside the margins.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 44;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

/* The header and footer are placed from the top. A render-prop Text placed
   with `bottom` has no height when bottom is resolved and silently lands off
   the page. */
const HEADER_TOP = 24;
const FOOTER_TOP = PAGE_H - 34;

function styles(accent: string) {
  const tab = mix(accent, 0.86);
  const topic = mix(accent, 0.7);

  return StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 52,
      paddingHorizontal: MARGIN_X,
      fontFamily: "Helvetica",
      fontSize: 10.5,
      color: INK,
      lineHeight: 1.4
    },
    running: {
      position: "absolute",
      top: HEADER_TOP,
      width: 320,
      fontSize: 9,
      color: "#444"
    },
    footerPage: {
      position: "absolute",
      top: FOOTER_TOP,
      left: MARGIN_X,
      width: CONTENT_W,
      textAlign: "center",
      fontSize: 9,
      color: "#444"
    },
    footerBrand: {
      position: "absolute",
      top: FOOTER_TOP,
      width: 200,
      fontSize: 9,
      color: "#444"
    },

    // Cover
    coverBrand: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    coverLogo: {
      height: 44,
      maxWidth: 200,
      objectFit: "contain",
      marginRight: 12
    },
    coverName: { fontFamily: "Helvetica-Bold", fontSize: 20 },
    coverLines: { marginTop: 170 },
    coverRule: {
      width: 56,
      height: 4,
      backgroundColor: accent,
      marginBottom: 22
    },
    coverLine: {
      fontFamily: "Helvetica-Bold",
      fontSize: 16,
      marginBottom: 12,
      lineHeight: 1.2
    },
    coverNote: { marginTop: 18, fontSize: 10, color: "#555", maxWidth: 360 },
    coverCredit: {
      position: "absolute",
      top: FOOTER_TOP - 6,
      left: MARGIN_X,
      width: CONTENT_W,
      fontSize: 10,
      color: "#444"
    },

    // Frame
    section: { marginBottom: 22 },
    partTab: {
      alignSelf: "flex-start",
      minWidth: 210,
      paddingVertical: 5,
      paddingHorizontal: 9,
      borderWidth: 1,
      borderColor: INK,
      backgroundColor: tab,
      marginBottom: 12
    },
    partTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
    topicTab: {
      alignSelf: "flex-start",
      minWidth: 150,
      paddingVertical: 6,
      paddingHorizontal: 9,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: INK,
      backgroundColor: topic
    },
    topic: { fontFamily: "Helvetica-Bold", fontSize: 10 },
    frame: {
      borderWidth: 1,
      borderColor: RULE,
      paddingTop: 14,
      paddingBottom: 2,
      paddingHorizontal: 14
    },
    row: { flexDirection: "row", marginBottom: 6 },
    who: { width: 108, paddingRight: 8 },
    speaker: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
    timing: { flexDirection: "row", alignItems: "flex-start", marginTop: 2 },
    timingText: { fontFamily: "Helvetica-Oblique", fontSize: 10, flex: 1 },
    words: { flex: 1 },
    para: { marginBottom: 5 },
    bulletRow: { flexDirection: "row", marginBottom: 4 },
    bulletDot: { width: 16 },
    response: {
      marginTop: 12,
      marginRight: 30,
      borderBottomWidth: 1,
      borderBottomColor: "#555",
      borderBottomStyle: "dotted"
    },
    aside: {
      width: 170,
      marginLeft: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: RULE,
      alignSelf: "flex-start"
    },
    asideTitle: {
      fontFamily: "Helvetica-Oblique",
      fontSize: 10,
      marginBottom: 6
    },

    // Booklet
    taskRow: { flexDirection: "row", alignItems: "stretch", marginBottom: 16 },
    question: {
      flex: 1,
      borderWidth: 1,
      borderColor: INK,
      paddingVertical: 7,
      paddingHorizontal: 12,
      justifyContent: "center"
    },
    questionText: {
      fontFamily: "Helvetica-Bold",
      fontSize: 11,
      textAlign: "center"
    },
    taskNumber: {
      width: 36,
      minHeight: 34,
      marginLeft: 14,
      borderWidth: 1,
      borderColor: INK,
      backgroundColor: tab,
      alignItems: "center",
      justifyContent: "center"
    },
    taskNumberAlone: { marginLeft: "auto" },
    taskNumberText: { fontFamily: "Helvetica-Bold", fontSize: 11 },
    photo: { objectFit: "cover" },
    photoBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      width: 20,
      height: 20,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center"
    },
    photoBadgeText: { fontFamily: "Helvetica-Bold", fontSize: 10 },
    mapFrame: { borderWidth: 1, borderColor: RULE },
    mapBox: {
      position: "absolute",
      backgroundColor: "#ffffff",
      borderWidth: 1.2,
      borderColor: INK,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8
    },
    mapPrompt: { fontSize: 11.5, textAlign: "center", lineHeight: 1.25 },
    mapCentre: { fontSize: 10.5, textAlign: "center", lineHeight: 1.3 },
    card: {
      marginTop: 30,
      marginHorizontal: 40,
      borderWidth: 1.2,
      borderColor: INK,
      paddingVertical: 26,
      paddingHorizontal: 30
    },
    cardQuestion: {
      fontFamily: "Helvetica-Bold",
      fontSize: 14,
      lineHeight: 1.35,
      marginBottom: 16
    },
    cardPrompt: { fontSize: 12.5, marginBottom: 6 }
  });
}

type S = ReturnType<typeof styles>;

// Frame pieces ------------------------------------------------------------------

function Clock() {
  return (
    <Svg
      width={9}
      height={9}
      viewBox="0 0 10 10"
      style={{ marginTop: 2.5, marginRight: 3 }}
    >
      <Circle
        cx={5}
        cy={5}
        r={4.2}
        stroke={INK}
        strokeWidth={0.9}
        fill="none"
      />
      <Line x1={5} y1={5} x2={5} y2={2.3} stroke={INK} strokeWidth={0.9} />
      <Line x1={5} y1={5} x2={7} y2={5} stroke={INK} strokeWidth={0.9} />
    </Svg>
  );
}

function fontFor(bold?: boolean, italic?: boolean) {
  if (bold) return italic ? "Helvetica-BoldOblique" : "Helvetica-Bold";
  return italic ? "Helvetica-Oblique" : "Helvetica";
}

function Rich({ para }: { para: Para }) {
  return (
    <Text>
      {para.runs.map((run, i) => (
        <Text key={i} style={{ fontFamily: fontFor(run.bold, run.italic) }}>
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

function Paras({ paras, s }: { paras: Para[]; s: S }) {
  return (
    <>
      {paras.map((para, i) =>
        para.bullet ? (
          <View key={i} style={s.bulletRow}>
            <Text style={s.bulletDot}>•</Text>
            <View style={{ flex: 1 }}>
              <Rich para={para} />
            </View>
          </View>
        ) : (
          <View key={i} style={s.para}>
            <Rich para={para} />
          </View>
        )
      )}
    </>
  );
}

/* Rows are never split across a page: a speaker's label on one page and their
   words on the next is the one layout fault an examiner cannot work around. */
function Row({ row, s }: { row: FrameRow; s: S }) {
  return (
    <View style={s.row} wrap={false}>
      <View style={s.who}>
        {row.speaker ? <Text style={s.speaker}>{row.speaker}</Text> : null}
        {row.timing ? (
          <View style={s.timing}>
            <Clock />
            <Text style={s.timingText}>{row.timing}</Text>
          </View>
        ) : null}
      </View>
      <View style={s.words}>
        {row.response ? <View style={s.response} /> : null}
        {row.aside ? (
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Paras paras={row.paras} s={s} />
            </View>
            <View style={s.aside}>
              <Text style={s.asideTitle}>{row.aside.title}</Text>
              {row.aside.items.map((item, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletDot}>•</Text>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Paras paras={row.paras} s={s} />
        )}
      </View>
    </View>
  );
}

function Frame({ section, s }: { section: FrameSection; s: S }) {
  return (
    <View style={s.section}>
      <View style={s.partTab} wrap={false}>
        <Text style={s.partTitle}>{`Part ${section.part}`}</Text>
        <Text>{section.timing}</Text>
      </View>
      {section.topics.length ? (
        <View style={s.topicTab} wrap={false}>
          {section.topics.map((topic, i) => (
            <Text key={i} style={s.topic}>
              {section.topics.length > 1 ? `${i + 1}  ${topic}` : topic}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={s.frame}>
        {section.rows.map((row, i) => (
          <Row key={i} row={row} s={s} />
        ))}
      </View>
    </View>
  );
}

// Booklet pieces ----------------------------------------------------------------

function TaskRow({
  task,
  question,
  s
}: {
  task: number;
  question: string[];
  s: S;
}) {
  return (
    <View style={s.taskRow}>
      {question.length ? (
        <View style={s.question}>
          {question.map((line, i) => (
            <Text key={i} style={s.questionText}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
      <View
        style={
          question.length ? s.taskNumber : [s.taskNumber, s.taskNumberAlone]
        }
      >
        <Text style={s.taskNumberText}>{task}</Text>
      </View>
    </View>
  );
}

/**
 * Photographs as large as the page allows, since they are what the candidate
 * talks about: stacked full width for one or two, the paper's usual pair; two
 * over one for C1's three; a grid for C2's four. Numbered from three up,
 * because those are the levels whose instructions refer to them by number.
 */
function Photos({ photos, s }: { photos: PdfImage[]; s: S }) {
  const gap = 14;
  const half = (CONTENT_W - gap) / 2;
  const numbered = photos.length >= 3;

  const photo = (image: PdfImage, n: number, width: number, height: number) => (
    <View key={n} style={{ width, height }}>
      <Image src={image} style={[s.photo, { width, height }]} />
      {numbered ? (
        <View style={s.photoBadge}>
          <Text style={s.photoBadgeText}>{n + 1}</Text>
        </View>
      ) : null}
    </View>
  );

  if (photos.length <= 2) {
    const height = photos.length === 1 ? 430 : 318;
    return (
      <View style={{ gap: 18 }}>
        {photos.map((image, n) => photo(image, n, CONTENT_W, height))}
      </View>
    );
  }

  if (photos.length === 3) {
    return (
      <View style={{ gap }}>
        <View style={{ flexDirection: "row", gap }}>
          {photos.slice(0, 2).map((image, n) => photo(image, n, half, 215))}
        </View>
        <View style={{ alignItems: "center" }}>
          {photo(photos[2], 2, 330, 250)}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
      {photos.map((image, n) => photo(image, n, half, 250))}
    </View>
  );
}

/* The mind map, drawn as the paper draws it: the task in the middle, the
   prompts around it, joined by lines. The lines run centre to centre beneath
   the boxes, whose white fill hides the part inside them. */
const MAP_H = 300;
/* Sized so the top prompts sit beside the centre box with clear space between,
   as the paper's do, rather than tucked under its corners. */
const CENTRE = { w: 190, h: 96, x: (CONTENT_W - 190) / 2, y: 22 };
const PROMPT = { w: 124, h: 58 };
const SLOTS = {
  tl: { x: 14, y: 41 },
  tr: { x: CONTENT_W - 14 - PROMPT.w, y: 41 },
  ml: { x: 14, y: 146 },
  mr: { x: CONTENT_W - 14 - PROMPT.w, y: 146 },
  bc: { x: (CONTENT_W - PROMPT.w) / 2, y: 222 }
};
const LAYOUTS: Record<number, (keyof typeof SLOTS)[]> = {
  1: ["bc"],
  2: ["tl", "tr"],
  3: ["tl", "tr", "bc"],
  4: ["tl", "tr", "ml", "mr"],
  5: ["tl", "tr", "ml", "mr", "bc"]
};

function MindMap({
  centre,
  prompts,
  s
}: {
  centre: string;
  prompts: string[];
  s: S;
}) {
  const shown = prompts.slice(0, 5);
  const slots = (LAYOUTS[shown.length] ?? []).map((key) => SLOTS[key]);
  const cx = CENTRE.x + CENTRE.w / 2;
  const cy = CENTRE.y + CENTRE.h / 2;
  // As tall as the lowest box needs, so four prompts leave no empty band.
  const height = Math.min(
    MAP_H,
    Math.max(CENTRE.y + CENTRE.h, ...slots.map((slot) => slot.y + PROMPT.h)) +
      24
  );

  return (
    <View style={[s.mapFrame, { width: CONTENT_W, height }]}>
      <Svg
        width={CONTENT_W}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {slots.map((slot, i) => (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={slot.x + PROMPT.w / 2}
            y2={slot.y + PROMPT.h / 2}
            stroke={INK}
            strokeWidth={1.4}
          />
        ))}
      </Svg>
      {shown.map((prompt, i) => (
        <View
          key={i}
          style={[
            s.mapBox,
            {
              left: slots[i].x,
              top: slots[i].y,
              width: PROMPT.w,
              height: PROMPT.h
            }
          ]}
        >
          <Text style={s.mapPrompt}>{prompt}</Text>
        </View>
      ))}
      <View
        style={[
          s.mapBox,
          {
            left: CENTRE.x,
            top: CENTRE.y,
            width: CENTRE.w,
            height: CENTRE.h,
            borderWidth: 2
          }
        ]}
      >
        <Text style={s.mapCentre}>{centre}</Text>
      </View>
    </View>
  );
}

function Booklet({ page, s }: { page: RenderedBooklet; s: S }) {
  if (page.kind === "photos") {
    return (
      <>
        <TaskRow task={page.task} question={page.question} s={s} />
        <Photos photos={page.photos} s={s} />
      </>
    );
  }

  if (page.kind === "mindmap") {
    return (
      <>
        <TaskRow task={page.task} question={[]} s={s} />
        <MindMap centre={page.centre} prompts={page.prompts} s={s} />
      </>
    );
  }

  return (
    <>
      <TaskRow task={page.task} question={[]} s={s} />
      <View style={s.card}>
        <Text style={s.cardQuestion}>{page.question}</Text>
        {page.prompts.map((prompt, i) => (
          <View key={i} style={s.bulletRow}>
            <Text style={[s.bulletDot, { fontSize: 12.5 }]}>•</Text>
            <Text style={s.cardPrompt}>{prompt}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

/* A running header and footer that mirror, as a printed booklet's do: on the
   outside edge of each page, so they sit away from the binding however the
   sheets are stapled. The cover carries neither.

   The footer's outer edge is the school's name when there is one, and the
   credit takes the inner edge; unbranded, the credit takes the outer edge
   alone rather than appearing twice. */
function Chrome({ input, s }: { input: ScriptInput; s: S }) {
  const brand = input.branding?.name ?? CREDIT;
  const inner = input.branding ? CREDIT : "";
  const showOn = (odd: boolean) => (n: number) =>
    n > 1 && n % 2 === (odd ? 1 : 0);
  const side = (odd: boolean) =>
    odd ? { right: MARGIN_X, textAlign: "right" as const } : { left: MARGIN_X };

  return (
    <>
      {[true, false].map((odd) => (
        <React.Fragment key={String(odd)}>
          <Text
            fixed
            style={[s.running, side(odd)]}
            render={({ pageNumber }) =>
              showOn(odd)(pageNumber) ? input.header : ""
            }
          />
          <Text
            fixed
            style={[s.footerBrand, side(odd)]}
            render={({ pageNumber }) => (showOn(odd)(pageNumber) ? brand : "")}
          />
          <Text
            fixed
            style={[s.footerBrand, side(!odd)]}
            render={({ pageNumber }) => (showOn(odd)(pageNumber) ? inner : "")}
          />
        </React.Fragment>
      ))}
      <Text
        fixed
        style={s.footerPage}
        render={({ pageNumber }) => (pageNumber > 1 ? String(pageNumber) : "")}
      />
    </>
  );
}

export default function ScriptDocument({ input }: { input: ScriptInput }) {
  const s = styles(input.branding?.accentColor ?? HOUSE_ACCENT);
  const brandName = input.branding?.name ?? PRODUCT;

  return (
    <Document
      title={input.title}
      author={brandName}
      creator={PRODUCT}
      producer={PRODUCT}
    >
      <Page size="A4" style={s.page}>
        <View style={s.coverBrand}>
          {input.branding?.logo ? (
            <Image style={s.coverLogo} src={input.branding.logo} />
          ) : null}
          <Text style={s.coverName}>{brandName}</Text>
        </View>
        <View style={s.coverLines}>
          <View style={s.coverRule} />
          {input.cover.map((line, i) => (
            <Text key={i} style={s.coverLine}>
              {line}
            </Text>
          ))}
          {input.note ? <Text style={s.coverNote}>{input.note}</Text> : null}
        </View>
        {/* fixed, like the footers: it sits below the page's bottom padding,
            and an element there that is not fixed makes the renderer add
            pages to fit it, forever — it hung the server. */}
        <Text style={s.coverCredit} fixed>
          {CREDIT}
        </Text>
      </Page>

      {input.groups.flatMap((group, g) => [
        <Page key={`f${g}`} size="A4" style={s.page}>
          <Chrome input={input} s={s} />
          {group.frames.map((section, i) => (
            <Frame key={i} section={section} s={s} />
          ))}
        </Page>,
        ...group.booklet.map((page, b) => (
          <Page key={`b${g}-${b}`} size="A4" style={s.page}>
            <Chrome input={input} s={s} />
            <Booklet page={page} s={s} />
          </Page>
        ))
      ])}
    </Document>
  );
}
