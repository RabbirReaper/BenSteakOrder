import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import AuthLoginView from '@/views/auth/loginView.vue'
import { useRouter } from 'vue-router'
import api from '@/api'

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(),
}))

// Mock API
vi.mock('@/api', () => ({
  default: {
    auth: {
      adminLogin: vi.fn(),
      logout: vi.fn(),
    },
  },
}))

describe('loginView.vue', () => {
  let wrapper
  let router
  
  beforeEach(() => {
    router = useRouter()
    wrapper = mount(AuthLoginView)
  })
  
  it('應該正確綁定用戶輸入', async () => {
    const usernameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    
    await usernameInput.setValue('test')
    await passwordInput.setValue('123456')
    
    expect(wrapper.vm.username).toBe('test')
    expect(wrapper.vm.password).toBe('123456')
  })
  
  it('應該成功呼叫 API 並導向 admin 頁面', async () => {
    // 設置輸入值
    const usernameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    await usernameInput.setValue('test')
    await passwordInput.setValue('123456')
    
    api.default.auth.adminLogin.mockResolvedValue({
      data: { success: true, role: 'super_admin' },
    })
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(api.default.auth.adminLogin).toHaveBeenCalledWith('test', '123456')
    expect(router.push).toHaveBeenCalledWith('/admin')
  })
  
  it('登入失敗時應該顯示錯誤訊息', async () => {
    // 設置輸入值
    const usernameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    await usernameInput.setValue('test')
    await passwordInput.setValue('123456')
    
    api.default.auth.adminLogin.mockRejectedValue({
      response: { data: '錯誤的帳號或密碼' },
    })
    
    window.alert = vi.fn() // Mock alert
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(window.alert).toHaveBeenCalledWith('登入失敗: 錯誤的帳號或密碼')
  })
})