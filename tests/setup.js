import { vi, beforeAll, afterAll, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

// ========== 全局設定 ==========

// 設定測試超時時間
vi.setConfig({ testTimeout: 10000 })

// Vue Test Utils 全局配置
config.global.stubs = {
  // 常用 Vue 組件的存根（stubs）
  RouterLink: true,
  RouterView: true,
  transition: true,
  'router-link': true,
  'router-view': true
}

// 禁用 Vue 生產環境提示
config.global.config = {
  warnHandler: () => null
}

// ========== 全局模擬 ==========

// 模擬 Vue Router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  })),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
    path: '/',
    name: '',
    fullPath: '/',
    hash: '',
    matched: [],
    meta: {}
  })),
  createRouter: vi.fn(() => ({
    push: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    install: vi.fn()
  })),
  createWebHistory: vi.fn()
}))

// 模擬 Pinia
vi.mock('pinia', () => ({
  defineStore: vi.fn(),
  setActivePinia: vi.fn(),
  createPinia: vi.fn(() => ({
    use: vi.fn()
  }))
}))

// 模擬 localStorage
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key) => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    },
    writable: true
  })
})

// 模擬 sessionStorage
beforeAll(() => {
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn((key) => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    },
    writable: true
  })
})

// 模擬 alert、confirm 和 prompt
beforeAll(() => {
  window.alert = vi.fn()
  window.confirm = vi.fn(() => true)
  window.prompt = vi.fn(() => '')
})

// 模擬 fetch API
beforeAll(() => {
  window.fetch = vi.fn()
})

// ========== 全局輔助函數 ==========

// 等待組件更新
global.nextTick = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
}

// 等待特定時間
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ========== 測試清理 ==========

// 每個測試後重置所有 mock
afterEach(() => {
  vi.resetAllMocks()
})

// 所有測試後執行的操作
afterAll(() => {
  // 如有需要清理的全局資源可以放在這裡
})

// ========== 測試報告增強 ==========

// 自訂錯誤訊息格式化器（可選）
vi.setConfig({
  onConsoleLog(log, type) {
    if (type === 'error') {
      console.error(`[TEST ERROR]: ${log}`)
      return false // 不顯示原始錯誤
    }
    return true // 顯示其他類型的日誌
  }
})

// ========== 其他自訂工具 ==========
// 如果你有常用的測試工具，可以在這裡添加到全局對象

// 例如：用於模擬 API 調用的工具
global.mockApiResponse = (data, status = 200) => {
  return Promise.resolve({
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {}
  })
}

// 用於模擬 API 錯誤的工具
global.mockApiError = (message, status = 500) => {
  const error = new Error(message)
  error.response = {
    data: { message },
    status,
    statusText: 'Error',
    headers: {},
    config: {}
  }
  return Promise.reject(error)
}