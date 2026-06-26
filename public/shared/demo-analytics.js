(function () {
  const DEMO_ANALYTICS_SOURCE = 'danilmakes-demo'

  function trackDemoEvent(demoId, event, params) {
    const message = {
      source: DEMO_ANALYTICS_SOURCE,
      demoId,
      event,
      params
    }

    if (window.parent !== window) {
      window.parent.postMessage(message, window.location.origin)
      return
    }

    window.postMessage(message, window.location.origin)
  }

  window.trackDemoEvent = trackDemoEvent

  window.trackDemoLeadSubmit = function (demoId, source, demoMode) {
    trackDemoEvent(demoId, 'lead_submit', {
      source,
      demo_mode: Boolean(demoMode)
    })
  }

  window.trackDemoLeadError = function (demoId, source, status) {
    trackDemoEvent(demoId, 'lead_error', {
      source,
      status: String(status)
    })
  }
})()
