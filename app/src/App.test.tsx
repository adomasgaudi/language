import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

describe('<App />', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear()
    document.body.innerHTML = ''
  })

  it('mounts and shows the AI model benchmark deck', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      createRoot(container).render(<App />)
    })

    const text = container.textContent ?? ''
    expect(text).toContain('AI Model Benchmarks')
    expect(text).toContain('benchmark properties')
    expect(text).toContain('due')
    expect(text).toContain('Memory map')
  })
})
