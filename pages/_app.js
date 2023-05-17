import '../styles/tailwind.css'
import 'focus-visible'
import { Analytics } from '@vercel/analytics/react'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ChordCraft: Create Unique Chord Progressions with AI</title>
        <meta
          name="title"
          content="ChordCraft: Create Unique Chord Progressions with AI"
        />
        <meta
          name="description"
          content="Discover new chord progressions for your music with our AI-powered tool. Choose your style, mood, and instrument and let our AI create unique progressions for you."
        />
        <meta
          name="keywords"
          content="Chord generator, chord progression, AI music generator, guitar chords, piano chords, music creation, songwriting tool"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chordcraft.io" />
        <meta
          property="og:title"
          content="ChordCraft: Create Unique Chord Progressions with AI"
        />
        <meta
          property="og:description"
          content="Discover new chord progressions for your music with our AI-powered tool. Choose your style, mood, and instrument and let our AI create unique progressions for you."
        />
        <meta
          property="og:image"
          content="https://www.chordcraft.io/chord.png"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://chordcraft.io" />
        <meta
          property="twitter:title"
          content="ChordCraft: Create Unique Chord Progressions with AI"
        />
        <meta
          property="twitter:description"
          content="Discover new chord progressions for your music with our AI-powered tool. Choose your style, mood, and instrument and let our AI create unique progressions for you."
        />
        <meta
          property="twitter:image"
          content="https://www.chordcraft.io/chord.png"
        />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
