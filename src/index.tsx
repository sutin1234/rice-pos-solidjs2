/* @refresh reload */
import { render } from '@solidjs/web'
import '@/styles/global.css'
import App from '@/App'

const root = document.getElementById('root')

render(() => <App />, root!)
