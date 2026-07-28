import { createSignal } from 'solid-js'
import { db } from '@/services/db'

export interface BranchOption {
  id: number
  name: string
}

function getInitialBranch(): number {
  try {
    return Number(localStorage.getItem('currentBranchId')) || 1
  } catch {
    return 1
  }
}

const [currentBranchId, setCurrentBranchId] = createSignal<number>(getInitialBranch())
const [branches, setBranches] = createSignal<BranchOption[]>([])

async function loadBranches() {
  const all = await db.branches.toArray()
  const opts = all.map((b) => ({ id: b.id!, name: b.name }))
  setBranches(opts)
  const cur = currentBranchId()
  if (cur === 0 && opts.length > 0) {
    selectBranch(opts[0].id)
  }
}

function selectBranch(id: number) {
  localStorage.setItem('currentBranchId', String(id))
  setCurrentBranchId(id)
}

export { currentBranchId, branches, loadBranches, selectBranch }