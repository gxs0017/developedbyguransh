// useEffect runs code AFTER the component appears on screen.
// useRef lets us store a value that persists between renders
// without causing the component to re-render when it changes.
// useState stores values that SHOULD cause a re-render when changed.
import { useEffect, useRef, useState } from 'react'

// LightRays is a canvas-based animated component.
// It draws light ray beams that follow your mouse.
// The .jsx extension is omitted — TypeScript/Vite finds it automatically.
import LightRays from '@/components/ui/LightRays/LightRays'

import './WorkInProgress.css'

// ─── NeonText Component ──────────────────────────────────────────────────────
// This component takes a word and animates it like a flickering neon sign.
// Each letter is independent — any one of them can randomly flicker off.
//
// Props explained:
// - text: the word to display (e.g. "ERROR" or "404")
// - className: CSS class to apply (controls color/glow style)
// - offCount: how many letters can be "off" (dimmed) at once
// - flickerChance: 0-1 probability that any letter flickers per interval

interface NeonTextProps {
  text: string
  className: string
  offCount?: number
  flickerChance?: number
}

function NeonText({ text, className, offCount = 1, flickerChance = 0.3 }: NeonTextProps) {
  // letters state is an array of booleans — true means "on" (glowing), false means "off" (dim)
  // We initialize it with all letters on: Array.from fills an array using a function,
  // here it creates [true, true, true, true, true] for "ERROR"
  const [letters, setLetters] = useState<boolean[]>(
    Array.from({ length: text.length }, () => true)
  )

  // useRef stores which letters are currently "off" without causing re-renders.
  // We use a ref here because we need to read it inside setInterval,
  // and state inside setInterval gets "stale" (it captures the value at
  // the time the interval was created, never updating). A ref always
  // gives you the current value.
  const offLettersRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    // setInterval runs our function every 150 milliseconds forever.
    // This is what creates the continuous flickering effect.
    const interval = setInterval(() => {

      // Math.random() returns a number between 0 and 1.
      // If it's above flickerChance, skip this tick — no change happens.
      // This makes the flickering feel random and natural rather than
      // happening on every single tick.
      if (Math.random() > flickerChance) return

      // Copy the current set of off letters so we can modify it
      const currentOff = new Set(offLettersRef.current)

      // Randomly decide: turn a letter off, or turn one back on?
      // If we already have enough letters off, always turn one back on.
      if (currentOff.size >= offCount) {
        // Pick a random letter from the "off" set to turn back on
        const offArray = Array.from(currentOff)
        const toTurnOn = offArray[Math.floor(Math.random() * offArray.length)]
        currentOff.delete(toTurnOn)
      } else {
        // Pick a random letter index from the whole word
        const randomIndex = Math.floor(Math.random() * text.length)
        // Don't turn off spaces — they have no glow anyway
        if (text[randomIndex] !== ' ') {
          currentOff.add(randomIndex)
        }
      }

      // Update the ref with the new set
      offLettersRef.current = currentOff

      // Update state — this triggers a re-render so the visual updates.
      // We map over each letter index: if it's in the "off" set → false, else → true
      setLetters(
        Array.from({ length: text.length }, (_, i) => !currentOff.has(i))
      )

    }, 150)

    // This "cleanup function" runs when the component is removed from the page.
    // Without it, the interval keeps running in the background forever,
    // which is a memory leak. Always clean up intervals and timeouts.
    return () => clearInterval(interval)

  // The dependency array [text, offCount, flickerChance] tells React:
  // "only re-run this effect if one of these values changes."
  // If it were empty [], it runs once on mount. If omitted, it runs every render.
  }, [text, offCount, flickerChance])

  return (
    <span className={`neon-word ${className}`}>
      {/* text.split('') turns "ERROR" into ['E','R','R','O','R']
          then we map each letter to its own <span>.
          The key prop is required by React when rendering lists —
          it helps React track which item is which when the list updates.
          We use index as key here because the letters never reorder. */}
      {text.split('').map((letter, index) => (
        <span
          key={index}
          // Conditionally apply 'off' class — this dims the letter
          // when letters[index] is false
          className={`neon-letter ${!letters[index] ? 'off' : ''}`}
        >
          {/* Spaces need to be preserved visually — &nbsp; is a
              "non-breaking space" that HTML actually renders.
              A regular space would be collapsed and ignored. */}
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </span>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function WorkInProgress() {
  return (
    // wip-root covers the entire viewport.
    // position: fixed means it stays put even if the page scrolls.
    <div className="wip-root">

      {/* ── BACKGROUND ────────────────────────────────────────────────
          LightRays fills the entire background with animated light beams.
          It sits at z-index 0 (behind everything).
          These props control the ray behavior — values pulled from
          the react-bits documentation you shared earlier. */}
      <div className="wip-bg">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={1}
          rayLength={2}
          pulsating={false}
          fadeDistance={1}
          saturation={1}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
        />
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────
          Centered on screen, stacked vertically.
          z-index 10 puts it in front of the LightRays background. */}
      <div className="wip-content">

        {/* ERROR — white/green glow, multiple letters can flicker */}
        <NeonText
          text="ERROR"
          className="neon-white"
          offCount={2}
          flickerChance={0.25}
        />

        {/* 404 — red glow, only 1 letter off at a time, flickers more often */}
        <NeonText
          text="404"
          className="neon-red"
          offCount={1}
          flickerChance={0.4}
        />

        {/* Static text — no flicker, just styled subtly */}
        <p className="wip-message">Developer is working on the site!</p>
        <p className="wip-sub">See you Soon</p>

      </div>
    </div>
  )
}