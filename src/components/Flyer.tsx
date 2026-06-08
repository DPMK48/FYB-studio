  "use client";

  import { forwardRef } from "react";
  import PixelLogo25 from "./PixelLogo25";

  export const FLYER_WIDTH = 1080;
  export const FLYER_HEIGHT = 1150;

  export type FlyerData = {
    fullName?: string | null;
    nickname?: string | null;
    photoUrl?: string | null;
    favoriteQuote?: string | null;
    hobbies?: string | null;
    skillset?: string | null;
    toughestSemester?: string | null;
    mostDifficultCourse?: string | null;
    favoriteCourse?: string | null;
    messageToFamily?: string | null;
    socialIg?: string | null;
    socialFb?: string | null;
    dateOfBirth?: string | null;
    stateOfOrigin?: string | null;
    relationshipStatus?: string | null;
    department?: string | null;
  };

  type Props = {
    data: FlyerData;
    watermark?: boolean;
  };

  const GREEN = "#1aa84a";
const DARK_GREEN = "#0f8a3a";
const YELLOW = "#e6f01f";
const BLACK = "#0a0a0a";
const PAPER = "#f3f3ee";

  const Flyer = forwardRef<HTMLDivElement, Props>(function Flyer(
    { data, watermark = false },
    ref,
  ) {
    const d = data;
    const dept =
      d.department || "Faculty of Computing, ATBU, Bauchi State.";

    return (
      <div
        ref={ref}
        className="bg-paper relative mx-auto"
        style={{
          width: FLYER_WIDTH,
          height: FLYER_HEIGHT,
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#0c0c0c",
          position: "relative",
        }}
      >
        {/* Subtle graduation cap watermark */}
        <svg
          className="pointer-events-none absolute"
          style={{ right: 40, top: 220, opacity: 0.12 }}
          width="520"
          height="520"
          viewBox="0 0 200 200"
          fill="none"
          stroke="#009444"
          strokeWidth="1.2"
        >
          <path d="M20 80 L100 50 L180 80 L100 110 Z" />
          <path d="M100 110 L100 150" />
          <path d="M60 95 L60 130 Q100 150 140 130 L140 95" />
          <circle cx="180" cy="80" r="3" />
          <path d="M180 80 L180 130" />
        </svg>

        {/* HEADER */}
        <div
          style={{
            padding: "44px 50px 18px",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 28,
          }}
        >
          {/* Logo */}
          <div>
            <PixelLogo25 size={18} color="#0c0c0c" />
          </div>

          {/* Title green block */}
          <div
            style={{
              background: "#009444",
              padding: "20px",
              borderRadius: 2,
              textAlign: "center",
              color: "white",
              boxShadow: "0 4px 0 rgba(0,0,0,0.05)",
            }}
          >
            <div
              className="font-display"
              style={{
                fontSize: 30,
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              PROFILE OF THE DAY
            </div>
            <div
              className="font-display"
              style={{
                fontSize: 24,
                color: "#d3de2c",
                letterSpacing: "0.08em",
                marginTop: 8,
              }}
            >
              FYB CLASS OF 2025
            </div>
          </div>

          {/* Beyond Binary tag */}
        <div
          style={{
            position: "relative",
            height: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <div
          className="font-display"
            style={{
              transform: "rotate(-10deg)",
              textAlign: "left",
              fontSize: 34,
              lineHeight: 1.05,
              letterSpacing: "0.01em",
              color: GREEN,
            }}
          >
            <div>BEYOND</div>
            <div style={{ display: "inline-block" }}>
              <span>BIN</span>
              <span
                style={{
                  background: YELLOW,
                  color: GREEN,
                  padding: "2px 4px",
                  display: "inline-block",
                }}
              >
                ARY.
              </span>
            </div>
          </div>
        </div>
      </div>

        {/* Thin divider */}
        <div
          style={{
            margin: "0 50px",
            height: 2,
            background:
              "linear-gradient(90deg, #009444 0%, #009444 60%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        {/* BODY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "420px 1fr",
            gap: 32,
            padding: "26px 50px 0",
          }}
        >
          {/* LEFT: photo + name block */}
          <div>
            <div
              style={{
                border: "5px solid #009444",
                padding: 4,
                background: "white",
                width: 420,
                height: 460,
                overflow: "hidden",
              }}
            >
              {d.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.photoUrl ?? undefined}
                  alt={d.fullName || "Student"}
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "repeating-linear-gradient(45deg, #e6e6dc, #e6e6dc 12px, #f4f4ee 12px, #f4f4ee 24px)",
                    color: "#9a9a8e",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  YOUR PHOTO HERE
                </div>
              )}
            </div>

            {/* Name banner */}
            <div
              style={{
                background: "#009444",
                padding: "20px 10px",
                margin: "16px 0px",
                color: "white",
                textAlign: "center",
              }}
              className="font-display"
            >
              <div
                style={{
                  fontSize: 30,
                  letterSpacing: "0.05em",
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                }}
              >
                {d.fullName || "YOUR FULL NAME"}
              </div>
            </div>

            {/* Black info card */}
            <div
              style={{
                background: "#0c0c0c",
                color: "white",
                padding: "18px 20px",
                fontSize: 20,
                lineHeight: 1.5,
              }}
            >
              <InfoLine label="DATE OF BIRTH:" value={d.dateOfBirth} />
              <InfoLine label="STATE OF ORIGIN:" value={d.stateOfOrigin} />
              <div
                className="font-display"
                style={{ color: "#d3de2c", marginTop: 6, fontSize: 18 }}
              >
                RELATIONSHIP STATUS:
              </div>
              <div style={{ color: "white", marginTop: 2 }}>
                {d.relationshipStatus || "—"}
              </div>
            </div>
          </div>

          {/* RIGHT: details */}
          <div>
            {/* Favorite quote */}
            <div
              style={{
                background: "#009444",
                color: "white",
                padding: "18px 22px",
                textAlign: "center",
              }}
            >
              <div
                className="font-display"
                style={{ fontSize: 22, letterSpacing: "0.04em" }}
              >
                FAVORITE QUOTE:
              </div>
              <div
                style={{
                  fontSize: 22,
                  marginTop: 4,
                  fontStyle: "italic",
                  lineHeight: 1.35,
                }}
              >
                {d.favoriteQuote ? `"${d.favoriteQuote}"` : '"Your quote here."'}
              </div>
            </div>

            {/* Field list */}
            <div style={{ marginTop: 16, display: "grid", rowGap: 8, fontSize: 22, }}>
              <Field label="NICKNAME:" value={d.nickname} />
              <Field label="HOBBIES:" value={d.hobbies} />
              <Field label="SKILLSET" value={d.skillset} />
              <Field label="TOUGHEST SEMESTER" value={d.toughestSemester} />
              <Field
                label="MOST DIFFICULT COURSE"
                value={d.mostDifficultCourse}
              />
              <Field label="FAVORITE COURSE" value={d.favoriteCourse} />
              <Field
                label="MESSAGE TO THE 25BITS FAMILY"
                value={d.messageToFamily}
                multiline
              />
              <div>
                <div
                  className="font-display"
                  style={{
                    color: "#009444",
                    fontSize: 19,
                    letterSpacing: "0.03em",
                  }}
                >
                  SOCIAL MEDIA HANDLE
                </div>
                <div style={{ fontSize: 22, marginTop: 2 }}>
                  {d.socialIg ? `IG,X,TT: ${d.socialIg}` : "IG,X,TT: —"}
                </div>
                <div style={{ fontSize: 22, marginTop: 2 }}>
                  {d.socialFb ? `Fb/LinkedIn: ${d.socialFb}` : "Fb/LinkedIn: —"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <BinaryStrip />
          <div
            style={{
              background: "#009444",
              // margin: "0 50px",
              color: "white",
              padding: "12px",
              textAlign: "center",
            }}
            className="font-display"
          >
            <div style={{ fontSize: 22, letterSpacing: "0.08em" }}>
              {dept.toUpperCase()}
            </div>
          </div>
          <BinaryStrip />
        </div>

        {watermark && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-22deg)",
              pointerEvents: "none",
              color: "rgba(31,158,58,0.18)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 900,
              fontSize: 86,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            PREVIEW • 25BITS
          </div>
        )}
      </div>
    );
  });

  function InfoLine({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) {
    return (
      <div style={{ marginTop: 4 }}>
        <span
          className="font-display"
          style={{ color: "#d3de2c", fontSize: 18, marginRight: 6 }}
        >
          {label}
        </span>
        <span style={{ color: "white", fontSize: 22 }}>{value || "—"}</span>
      </div>
    );
  }

  function Field({
    label,
    value,
    multiline,
  }: {
    label: string;
    value?: string | null;
    multiline?: boolean;
  }) {
    return (
      <div>
        <div
          className="font-display"
          style={{
            color: "#009444",
            fontSize: 19,
            letterSpacing: "0.03em",
            lineHeight: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 22,
            marginTop: 2,
            color: "#0c0c0c",
            whiteSpace: multiline ? "pre-wrap" : "normal",
            lineHeight: 1.35,
          }}
        >
          {value || "—"}
        </div>
      </div>
    );
  }

  function BinaryStrip() {
    const text =
      "00001 01011010 10010110 01010110 10100101 01011010 10010110 01010110 10100101 00001 01011010 10010110 01010110 10100101 01011010 10010110 01010110 10100101 ";
    return (
      <div
        style={{
          background: "#009444",
          color: "white",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 14,
          letterSpacing: "0.18em",
          padding: "4px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {text.repeat(12)}
      </div>
    );
  }

  export default Flyer;
