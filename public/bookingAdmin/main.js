const DEMO_ID = 'bookingAdmin'

const STATUS_LABELS = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  done: 'Завершена',
  cancelled: 'Отменена'
}

const seedBookings = [
  { id: 1, name: 'Анна К.', phone: '+7 950 111-22-33', service: 'Стрижка', date: '2026-06-28', time: '11:00', status: 'new' },
  { id: 2, name: 'Мария С.', phone: '+7 913 222-33-44', service: 'Окрашивание', date: '2026-06-28', time: '14:30', status: 'confirmed' },
  { id: 3, name: 'Елена П.', phone: '+7 902 333-44-55', service: 'Маникюр', date: '2026-06-29', time: '10:00', status: 'new' },
  { id: 4, name: 'Ольга В.', phone: '+7 923 444-55-66', service: 'Уход за волосами', date: '2026-06-29', time: '16:00', status: 'done' },
  { id: 5, name: 'Ирина Л.', phone: '+7 901 555-66-77', service: 'Стрижка', date: '2026-06-30', time: '12:00', status: 'cancelled' },
  { id: 6, name: 'Дарья М.', phone: '+7 908 666-77-88', service: 'Маникюр', date: '2026-07-01', time: '15:00', status: 'confirmed' }
]

let bookings = [...seedBookings]
let searchDebounceId = null

const rowsEl = document.getElementById('rows')
const statsEl = document.getElementById('stats')
const statusFilter = document.getElementById('status-filter')
const searchInput = document.getElementById('search')

function renderStats() {
  const counts = bookings.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1
    return acc
  }, {})

  statsEl.innerHTML = [
    { label: 'Всего', value: bookings.length },
    { label: 'Новые', value: counts.new ?? 0 },
    { label: 'Подтверждены', value: counts.confirmed ?? 0 }
  ].map(item => `
    <div class="stat">
      <strong>${item.value}</strong>
      ${item.label}
    </div>
  `).join('')
}

function getFilteredBookings() {
  const status = statusFilter.value
  const query = searchInput.value.trim().toLowerCase()

  return bookings.filter(item => {
    const statusMatch = status === 'all' || item.status === status
    const searchMatch = !query
      || item.name.toLowerCase().includes(query)
      || item.phone.includes(query)
    return statusMatch && searchMatch
  })
}

function renderRows() {
  const filtered = getFilteredBookings()

  if (!filtered.length) {
    rowsEl.innerHTML = `<tr><td colspan="5" class="empty">Записей не найдено</td></tr>`
    return
  }

  rowsEl.innerHTML = filtered.map(item => `
    <tr>
      <td>
        <div>${item.name}</div>
        <div style="color:#5a6578;font-size:0.85rem">${item.phone}</div>
      </td>
      <td>${item.service}</td>
      <td>${formatDate(item.date)}</td>
      <td>${item.time}</td>
      <td>
        <select class="status-select" data-status="${item.status}" data-id="${item.id}" aria-label="Статус записи ${item.name}">
          ${Object.entries(STATUS_LABELS).map(([value, label]) => `
            <option value="${value}" ${item.status === value ? 'selected' : ''}>${label}</option>
          `).join('')}
        </select>
      </td>
    </tr>
  `).join('')

  rowsEl.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', (event) => {
      const target = event.currentTarget
      const id = Number(target.dataset.id)
      const nextStatus = target.value
      bookings = bookings.map(item => item.id === id ? { ...item, status: nextStatus } : item)
      window.trackDemoEvent?.(DEMO_ID, 'status_change', { status: nextStatus })
      renderStats()
      renderRows()
    })
  })
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

statusFilter.addEventListener('change', () => {
  window.trackDemoEvent?.(DEMO_ID, 'filter_change', {
    filter: 'status',
    value: statusFilter.value
  })
  renderRows()
})

searchInput.addEventListener('input', () => {
  if (searchDebounceId) {
    clearTimeout(searchDebounceId)
  }

  searchDebounceId = setTimeout(() => {
    if (searchInput.value.trim()) {
      window.trackDemoEvent?.(DEMO_ID, 'filter_change', { filter: 'search' })
    }
    renderRows()
  }, 600)
})

renderStats()
renderRows()
