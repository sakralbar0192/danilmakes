const form = document.getElementById('booking-form')
const statusEl = document.getElementById('form-status')
const burger = document.querySelector('.burger')
const nav = document.querySelector('.nav')

burger?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('nav--open')
  burger.setAttribute('aria-expanded', String(Boolean(isOpen)))
})

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('nav--open')
    burger?.setAttribute('aria-expanded', 'false')
  })
})

async function submitDemoLead(payload) {
  const response = await fetch('/api/demo-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message ?? 'Не удалось отправить заявку')
  }

  return data
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  statusEl.textContent = 'Отправляем…'
  statusEl.className = 'form__status'

  const formData = new FormData(form)
  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim() || undefined,
    website: String(formData.get('website') ?? ''),
    source: 'clinic-landing'
  }

  if (!payload.name || !payload.phone) {
    statusEl.textContent = 'Заполните имя и телефон.'
    statusEl.className = 'form__status form__status--error'
    return
  }

  try {
    const result = await submitDemoLead(payload)
    const channels = []

    if (result.delivered?.email) channels.push('почта')
    if (result.delivered?.telegram) channels.push('Telegram')

    if (result.demoMode) {
      statusEl.textContent = 'Заявка принята (демо-режим: уведомления не настроены на сервере).'
    } else if (channels.length) {
      statusEl.textContent = `Спасибо! Заявка отправлена: ${channels.join(' и ')}.`
    } else {
      statusEl.textContent = 'Заявка принята. Администратор свяжется с вами.'
    }

    statusEl.className = 'form__status form__status--success'
    form.reset()
  } catch (error) {
    statusEl.textContent = error instanceof Error ? error.message : 'Ошибка отправки.'
    statusEl.className = 'form__status form__status--error'
  }
})
