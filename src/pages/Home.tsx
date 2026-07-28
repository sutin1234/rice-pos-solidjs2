import { Hero } from '@/components/features/Hero'
import { NextSteps } from '@/components/features/NextSteps'
import { Counter } from '@/components/ui/Counter'
import './Home.css'

export function Home() {
  return (
    <>
      <section id="center">
        <Hero />
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/pages/Home.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <Counter />
      </section>

      <div class="ticks" />
      <NextSteps />
      <div class="ticks" />
      <section id="spacer" />
    </>
  )
}
