import solidLogo from '@/assets/solid.svg'
import viteLogo from '@/assets/vite.svg'
import heroImg from '@/assets/hero.png'
import './Hero.css'

export function Hero() {
  return (
    <div class="hero">
      <img src={heroImg} class="base" width="170" height="179" alt="" />
      <img src={solidLogo} class="framework" alt="Solid logo" />
      <img src={viteLogo} class="vite" alt="Vite logo" />
    </div>
  )
}
