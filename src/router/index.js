import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import GeneratorPage from '../views/GeneratorPage.vue'
import AnalyzerPage from '../views/AnalyzerPage.vue'
import LibraryPage from '../views/LibraryPage.vue'
import ExportPage from '../views/ExportPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/generator',
    name: 'Generator',
    component: GeneratorPage
  },
  {
    path: '/analyzer',
    name: 'Analyzer',
    component: AnalyzerPage
  },
  {
    path: '/library',
    name: 'Library',
    component: LibraryPage
  },
  {
    path: '/export',
    name: 'Export',
    component: ExportPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router