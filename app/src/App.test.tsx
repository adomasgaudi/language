import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

describe('<App />', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('mounts and shows the course and a French card', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      createRoot(container).render(<App />)
    })

    const text = container.textContent ?? ''
    expect(text).toContain('French · Stromae')
    expect(text).toContain('Qui dit') // first line card is shown
    expect(text).toContain('due') // the due counter rendered
    expect(text).toContain('Memory map')
  })
})
