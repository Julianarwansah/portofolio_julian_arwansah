import { useState, useEffect } from "react"
import CountUp from "./CountUp/CountUp"

const PreLoader = () => {
  const [loading, setLoading] = useState(true)
  const [countDone, setCountDone] = useState(false)
  const [fadeText, setFadeText] = useState(false)
  const [fadeScreen, setFadeScreen] = useState(false)

  useEffect(() => {
    if (countDone) {
      // Fade teks
      const fadeTextTimer = setTimeout(() => setFadeText(true), 400)

      // Fade seluruh screen
      const fadeScreenTimer = setTimeout(() => setFadeScreen(true), 600)

      // Unmount preloader setelah animasi fade selesai
      const hideTimer = setTimeout(() => setLoading(false), 1200)

      return () => {
        clearTimeout(fadeTextTimer)
        clearTimeout(fadeScreenTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [countDone])

  return (
    loading && (
      <div
        className={`w-screen h-screen fixed inset-0 flex flex-col items-center justify-center bg-[#0d0d11] z-[10000] overflow-hidden transition-opacity duration-500 ${
          fadeScreen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}
      >
        <div
          className={`flex flex-col items-center gap-6 transition-all duration-500 ${
            fadeText ? "opacity-0 -translate-y-10" : "opacity-100 translate-y-0"
          }`}
        >
          {/* Badge indicator */}
          <div className="neo-badge neo-shadow-cyan">PORTFOLIO LOADING</div>

          {/* Large percentage display */}
          <h1 className="text-7xl md:text-8xl font-black text-white select-none tracking-tighter flex items-center justify-center">
            <CountUp
              from={0}
              to={100}
              separator=","
              direction="up"
              duration={1.2}
              className="font-mono tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-cyan-300"
              onEnd={() => setCountDone(true)}
            />
            <span className="text-yellow-400 font-bold ml-1">%</span>
          </h1>

          {/* Chunky Loading Bar */}
          <div className="w-72 h-8 bg-zinc-950 border-3 border-black neo-shadow-pink relative overflow-hidden rounded-md">
            <div 
              className="h-full bg-[#ffe600] border-r-3 border-black"
              style={{
                width: '0%',
                animation: 'loaderFill 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            />
          </div>
          
          <span className="text-zinc-500 text-sm tracking-wider uppercase font-semibold">Preparing experience...</span>
        </div>

        {/* Loading Keyframe Animation */}
        <style>{`
          @keyframes loaderFill {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    )
  )
}

export default PreLoader

