import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import logoUrl from './assets/logo.png'

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (favicon) favicon.href = import.meta.env.DEV ? '/logo.png' : logoUrl

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
