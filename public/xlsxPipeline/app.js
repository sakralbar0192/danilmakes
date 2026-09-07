const daysInput = document.getElementById('days')
const statusEl = document.getElementById('status')

function renderStages(targetId, peakId, stages) {
  const list = document.getElementById(targetId)
  const peak = document.getElementById(peakId)
  list.innerHTML = ''
  stages.forEach((stage) => {
    const li = document.createElement('li')
    li.textContent = `${stage.label} — ~${stage.memoryMb} MB`
    list.appendChild(li)
  })
  const last = stages[stages.length - 1]
  peak.textContent = last ? `Peak ≈ ${last.memoryMb} MB` : ''
}

async function loadPipeline() {
  const days = Number(daysInput.value || 90)
  statusEl.textContent = 'Считаем pipeline…'
  const res = await fetch(`/api/demos/xlsx/pipeline?days=${days}`)
  if (!res.ok) throw new Error('pipeline failed')
  const data = await res.json()
  renderStages('streamStages', 'streamPeak', data.stream)
  renderStages('naiveStages', 'naivePeak', data.naive)
  statusEl.textContent = data.note || 'Готово'
}

async function exportFile() {
  const days = Number(daysInput.value || 90)
  statusEl.textContent = 'Собираем XLSX потоково…'
  const res = await fetch('/api/demos/xlsx/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  })
  if (!res.ok) throw new Error('export failed')
  const pipelineHeader = res.headers.get('X-Demo-Pipeline')
  if (pipelineHeader) {
    try {
      renderStages('streamStages', 'streamPeak', JSON.parse(pipelineHeader))
    } catch {
      // ignore
    }
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tariff-prices-demo.xlsx'
  a.click()
  URL.revokeObjectURL(url)
  statusEl.textContent = 'Файл скачан'
}

document.getElementById('preview').addEventListener('click', () => {
  loadPipeline().catch((err) => {
    statusEl.textContent = String(err.message || err)
  })
})

document.getElementById('export').addEventListener('click', () => {
  exportFile().catch((err) => {
    statusEl.textContent = String(err.message || err)
  })
})

loadPipeline().catch((err) => {
  statusEl.textContent = String(err.message || err)
})
