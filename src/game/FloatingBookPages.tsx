// Two flanking columns of country pages — left and right of the briefing panel

const LEFT_PAGES = [
  "/book-pages/book3/page-06.jpg",  // USA – dark night blue
  "/book-pages/book3/page-08.jpg",  // Jamaica – tropical blue
  "/book-pages/book3/page-10.jpg",  // Peru – mountain green
  "/book-pages/book3/page-12.jpg",  // Antarctica – ice blue
  "/book-pages/book3/page-14.jpg",  // Spain – purple/red
  "/book-pages/book3/page-16.jpg",  // Italy – warm stone
  "/book-pages/book3/page-18.jpg",  // Sri Lanka – market purples
  "/book-pages/book3/page-20.jpg",  // Switzerland – snow/colourful skis
  "/book-pages/book3/page-22.jpg",  // South Africa – rainbow
  "/book-pages/book3/page-24.jpg",  // South Korea – blue masks
  "/book-pages/book3/page-26.jpg",  // Indonesia – blue sea/cave
];

const RIGHT_PAGES = [
  "/book-pages/book3/page-07.jpg",  // Mexico – warm green beach
  "/book-pages/book3/page-09.jpg",  // Barbados – sky blue
  "/book-pages/book3/page-11.jpg",  // Argentina – blue & white
  "/book-pages/book3/page-13.jpg",  // England – warm brick/red
  "/book-pages/book3/page-15.jpg",  // France – gold/blue Eiffel
  "/book-pages/book3/page-19.jpg",  // Japan – teal sushi bar
  "/book-pages/book3/page-21.jpg",  // Kenya – green savanna
  "/book-pages/book3/page-23.jpg",  // Ghana – vibrant fabrics
  "/book-pages/book3/page-25.jpg",  // Nepal – blue mountain
  "/book-pages/book3/page-27.jpg",  // Australia – blue tennis
];

function Column({ pages, side }: { pages: string[]; side: "left" | "right" }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: "29%",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: 5,
        overflow: "hidden",
      }}
    >
      {pages.map((src, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            borderRadius: 7,
            overflow: "hidden",
            boxShadow: "0 3px 12px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12)",
            outline: "3px solid #fff",
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      ))}
    </div>
  );
}

export function FloatingBookPages() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <Column pages={LEFT_PAGES} side="left" />
      <Column pages={RIGHT_PAGES} side="right" />
    </div>
  );
}
