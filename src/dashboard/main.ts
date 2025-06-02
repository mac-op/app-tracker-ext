import {createApp} from 'vue'
import Dashboard from './Dashboard.vue'
import {setupApp} from '~/logic/common-setup'
import '../styles'

const app = createApp(Dashboard)
setupApp(app)
app.mount('#app')