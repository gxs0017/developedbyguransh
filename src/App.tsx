// useState is a React "hook" — it lets your component remember things.
// We're not using it yet but keeping it because you'll need it soon
// when you start adding interactive elements to your portfolio.
import { useState } from 'react'
import './App.css'

function App() {
  // This is how you declare state in React.
  // count = the current value, setCount = the function that changes it.
  // useState(0) means the starting value is 0.
  // Again, not using this yet — just keeping the pattern visible so you
  // start getting familiar with it.
  const [count, setCount] = useState(0)

  return (
    // The <> and </> are called a Fragment — React requires every component
    // to return a single parent element. A Fragment is an invisible wrapper
    // that satisfies that rule without adding an extra <div> to the page.
    <>
      <div style={{
        // These inline styles are temporary — once we build the real
        // portfolio we'll use proper CSS classes. But for a test page,
        // inline styles are fine and fast.
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',        // 100vh = 100% of the viewport height
        gap: '1rem',            // space between the elements
        fontFamily: 'sans-serif'
      }}>
        <h1>developedbyguransh.dev</h1>
        <p>Auto-deploy is working. Pipeline test successful ✅</p>

        {/* This button still works — clicking it increments the count.
            It's here so you can see state in action in the browser. */}
        <button onClick={() => setCount((count) => count + 1)}>
          Clicked {count} times
        </button>
      </div>
    </>
  )
}

// Every component file needs a default export so other files can import it.
// main.tsx imports App and renders it into the page.
export default App