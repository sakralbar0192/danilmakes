const form = document.getElementById('demo-form')
const statusEl = document.getElementById('form-status')
const resultPanel = document.getElementById('result-panel')
const resultJson = document.getElementById('result-json')

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  statusEl.textContent = 'Отправляем…'
  statusEl.className = 'form__status'
  resultPanel.hidden = true

  const formData = new FormData(form)
  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim() || undefined,
    website: String(formData.get('website') ?? ''),
    source: 'form-integration'
  }

  if (!payload.name || !payload.phone) {
    statusEl.textContent = 'Заполните имя и телефон.'
    statusEl.className = 'form__status form__status--error'
    return
  }

  try {
    const response = await fetch('/api/demo-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message ?? 'Ошибка сервера')
    }

    resultJson.textContent = JSON.stringify(data, null, 2)
    resultPanel.hidden = false

    if (data.demoMode) {
      statusEl.textContent = 'Заявка принята в демо-режиме (каналы не настроены).'
    } else {
      const parts = []
      if (data.delivered?.email) parts.push('почта')
      if (data.delivered?.telegram) parts.push('Telegram')
      statusEl.textContent = parts.length
        ? `Доставлено: ${parts.join(', ')}.`
        : 'Заявка принята.'
    }

    statusEl.className = 'form__status form__status--success'
    form.reset()
  } catch (error) {
    statusEl.textContent = error instanceof Error ? error.message : 'Не удалось отправить.'
    statusEl.className = 'form__status form__status--error'
  }
})
