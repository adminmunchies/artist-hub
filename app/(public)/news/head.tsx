export default function Head() {
  const og = "/api/og/news"  // relativ; Next/Browser löst mit aktuellem Host auf
  return (
    <>
      <meta property="og:image" content={og} />
      <meta name="twitter:image" content={og} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  )
}
