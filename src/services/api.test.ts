import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, ApiError } from './api'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('api', () => {
  describe('get', () => {
    it('returns JSON on success', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: 'ok' }) })
      const result = await api.get('/test')
      expect(result).toEqual({ data: 'ok' })
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.any(Object))
    })

    it('throws ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })
      await expect(api.get('/missing')).rejects.toThrow(ApiError)
    })
  })

  describe('post', () => {
    it('sends JSON body', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 1 }) })
      const result = await api.post('/items', { name: 'test' })
      expect(result).toEqual({ id: 1 })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/items'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'test' }) }),
      )
    })
  })

  describe('put', () => {
    it('sends JSON body with PUT method', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ updated: true }) })
      const result = await api.put('/items/1', { name: 'updated' })
      expect(result).toEqual({ updated: true })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/1'),
        expect.objectContaining({ method: 'PUT' }),
      )
    })
  })

  describe('delete', () => {
    it('calls DELETE', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
      await api.delete('/items/1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })
})

describe('ApiError', () => {
  it('captures status and message', () => {
    const err = new ApiError('Not Found', 404)
    expect(err.message).toBe('Not Found')
    expect(err.status).toBe(404)
    expect(err.name).toBe('ApiError')
  })
})
