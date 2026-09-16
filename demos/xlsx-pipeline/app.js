const daysInput = document.getElementById('days')
const statusEl = document.getElementById('status')

function renderStages(targetId, peakId, stages) {
  const list = document.getElementById(targetId)
  const peak = document.getElementById(peakId)
  list.innerHTML = ''
  stages.forEach((stage) => {
    const li = document.createElement('li')
    li.innerHTML = `<span>${stage.label} — ~${stage.memoryMb} MB</span><span class="ram">что в RAM: ${ramHint(stage.id)}</span>`
    list.appendChild(li)
  })
  const last = stages[stages.length - 1]
  peak.textContent = last ? `Peak ≈ ${last.memoryMb} MB` : ''
  return last?.memoryMb ?? 0
}

function ramHint(id) {
  const map = {
    load: 'полная матрица цен периода',
    celldto: 'CellDto на каждую ячейку',
    write: 'матрица + workbook buffer',
    peak: 'удержанный пик',
    window: 'окно prices на день/колонку',
    dayVector: 'компактный вектор дня',
    discard: 'после сброса dayVector',
  }
  return map[id] || 'промежуточные буферы'
}

function renderBars(streamPeak, naivePeak) {
  const max = Math.max(streamPeak, naivePeak, 1)
  const streamBar = document.getElementById('streamBar')
  const naiveBar = document.getElementById('naiveBar')
  streamBar.style.width = `${Math.round((streamPeak / max) * 100)}%`
  naiveBar.style.width = `${Math.round((naivePeak / max) * 100)}%`
  document.getElementById('streamBarLabel').textContent = `${streamPeak} MB`
  document.getElementById('naiveBarLabel').textContent = `${naivePeak} MB`
}

async function loadPipeline() {
  const days = Number(daysInput.value || 90)
  statusEl.textContent = 'Считаем pipeline…'
  const res = await fetch(`/api/demos/xlsx/pipeline?days=${days}`)
  if (!res.ok) throw new Error('pipeline failed')
  const data = await res.json()
  const streamPeak = renderStages('streamStages', 'streamPeak', data.stream)
  const naivePeak = renderStages('naiveStages', 'naivePeak', data.naive)
  renderBars(streamPeak, naivePeak)
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
      const stages = JSON.parse(pipelineHeader)
      const streamPeak = renderStages('streamStages', 'streamPeak', stages)
      const naivePeakEl = document.getElementById('naivePeak')
      const naiveMatch = /(\d+)/.exec(naivePeakEl?.textContent || '')
      renderBars(streamPeak, Number(naiveMatch?.[1] || streamPeak))
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
