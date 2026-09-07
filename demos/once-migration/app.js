const statusEl = document.getElementById('status')
const statsEl = document.getElementById('stats')
const jobsEl = document.getElementById('jobs')
let lastJobId = null

async function api(path, options) {
  const res = await fetch(`/api/demos/once${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }
  return res.json()
}

function renderStatus(data) {
  const h = data.hotels || {}
  statsEl.innerHTML = `
    <div class="stat"><strong>${h.total ?? 0}</strong><span>hotels</span></div>
    <div class="stat"><strong>${h.invalid ?? 0}</strong><span>invalid</span></div>
    <div class="stat"><strong>${h.fixed ?? 0}</strong><span>fixed</span></div>
  `

  jobsEl.innerHTML = ''
  ;(data.jobs || []).forEach((job) => {
    if (!lastJobId) lastJobId = job.id
    const log = Array.isArray(job.log) ? job.log : []
    const el = document.createElement('article')
    el.className = 'job'
    el.innerHTML = `
      <header>
        <span>#${job.id} · ${job.mode}</span>
        <span class="badge ${job.status}">${job.status}</span>
      </header>
      <p>cursor hotel_id=${job.cursor_hotel_id} · processed=${job.processed} · fixed=${job.fixed_count}</p>
      <ul>${log.slice(-8).map((line) => `<li>${line}</li>`).join('')}</ul>
    `
    jobsEl.appendChild(el)
  })
}

async function refresh() {
  const data = await api('/status')
  if (data.jobs?.[0]) lastJobId = data.jobs[0].id
  renderStatus(data)
}

document.getElementById('reset').addEventListener('click', async () => {
  statusEl.textContent = 'Reset…'
  await api('/reset', { method: 'POST', body: '{}' })
  lastJobId = null
  await refresh()
  statusEl.textContent = 'Seed восстановлен'
})

document.getElementById('dry').addEventListener('click', async () => {
  statusEl.textContent = 'Dry-run with simulated fail…'
  const data = await api('/jobs', {
    method: 'POST',
    body: JSON.stringify({
      mode: 'dry_run',
      start_hotel_id: 1,
      simulate_fail: true,
      chunk_size: 5,
      max_chunks: 3,
    }),
  })
  lastJobId = data.job?.id
  statusEl.textContent = data.resume_hint
    ? `Paused. Resume with ${data.resume_hint}`
    : 'Dry-run done'
  await refresh()
})

document.getElementById('apply').addEventListener('click', async () => {
  statusEl.textContent = 'Apply…'
  const data = await api('/jobs', {
    method: 'POST',
    body: JSON.stringify({
      mode: 'apply',
      start_hotel_id: 1,
      simulate_fail: false,
      chunk_size: 8,
      max_chunks: 10,
    }),
  })
  lastJobId = data.job?.id
  statusEl.textContent = `Apply ${data.job?.status}`
  await refresh()
})

document.getElementById('resume').addEventListener('click', async () => {
  if (!lastJobId) {
    statusEl.textContent = 'Нет job для resume — сначала dry-run'
    return
  }
  statusEl.textContent = `Resume #${lastJobId}…`
  await api(`/jobs/${lastJobId}/resume`, { method: 'POST', body: '{}' })
  statusEl.textContent = 'Resume complete'
  await refresh()
})

refresh().catch((err) => {
  statusEl.textContent = String(err.message || err)
})
