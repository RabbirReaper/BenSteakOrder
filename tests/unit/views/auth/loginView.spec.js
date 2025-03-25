import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AuthLoginView from '@/views/auth/loginView.vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

// 模擬 API
vi.mock('@/api', () => ({
  default: {
    auth: {
      adminLogin: vi.fn()
    }
  }
}))

describe('AuthLoginView.vue', () => {
  let wrapper
  let mockRouter
  let mockRoute
  
  beforeEach(() => {
    // 清除所有模擬的調用記錄
    vi.clearAllMocks()
    
    // 使用 setup.js 中已經設置的 vue-router 模擬
    mockRouter = {
      push: vi.fn()
    }
    
    mockRoute = {
      query: {}
    }
    
    // 設置路由模擬的返回值
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(useRoute).mockReturnValue(mockRoute)
    
    // 渲染組件
    wrapper = mount(AuthLoginView)
  })
  
  afterEach(() => {
    wrapper.unmount()
  })
  
  it('應該正確顯示登入表單', () => {
    expect(wrapper.find('h2').text()).toBe('管理員登入')
    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })
  
  it('應該正確綁定用戶輸入', async () => {
    const usernameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    
    await usernameInput.setValue('testadmin')
    await passwordInput.setValue('password123')
    
    // 驗證內部響應式數據是否正確綁定
    expect(wrapper.vm.username).toBe('testadmin')
    expect(wrapper.vm.password).toBe('password123')
  })
  
  it('表單輸入應該是必填的', () => {
    const usernameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    
    // 檢查必填屬性
    expect(usernameInput.attributes('required')).toBeDefined()
    expect(passwordInput.attributes('required')).toBeDefined()
  })
  
  it('超級管理員登入成功後應該導向 /admin', async () => {
    // 設置輸入值
    await wrapper.find('input#username').setValue('admin')
    await wrapper.find('input#password').setValue('admin123')
    
    // 模擬API返回超級管理員登入成功
    api.auth.adminLogin.mockResolvedValue({
      data: { success: true, role: 'super_admin' }
    })
    
    // 提交表單
    await wrapper.find('form').trigger('submit.prevent')
    
    // 驗證API調用
    expect(api.auth.adminLogin).toHaveBeenCalledWith('admin', 'admin123')
    
    // 驗證路由導向
    await vi.waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/admin')
    })
  })
  
  it('店鋪管理員登入成功後應該導向特定店鋪頁面', async () => {
    // 設置輸入值
    await wrapper.find('input#username').setValue('storemanager')
    await wrapper.find('input#password').setValue('store123')
    
    // 模擬API返回店鋪管理員登入成功
    api.auth.adminLogin.mockResolvedValue({
      data: { success: true, role: 'store_admin', storeId: '123456' }
    })
    
    // 提交表單
    await wrapper.find('form').trigger('submit.prevent')
    
    // 驗證API調用和路由導向
    expect(api.auth.adminLogin).toHaveBeenCalledWith('storemanager', 'store123')
    
    await vi.waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/staff/123456')
    })
  })
  
  it('存在重定向路徑時應該導向該路徑', async () => {
    // 設置重定向查詢參數
    mockRoute.query = { redirect: '/admin/orders' }
    
    // 設置輸入值並提交
    await wrapper.find('input#username').setValue('admin')
    await wrapper.find('input#password').setValue('admin123')
    
    // 模擬API返回登入成功
    api.auth.adminLogin.mockResolvedValue({
      data: { success: true, role: 'super_admin' }
    })
    
    // 提交表單
    await wrapper.find('form').trigger('submit.prevent')
    
    // 驗證應該導向 redirect 路徑
    await vi.waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/orders')
    })
  })
  
  it('登入失敗時應該顯示錯誤訊息', async () => {
    // 設置輸入值
    await wrapper.find('input#username').setValue('wronguser')
    await wrapper.find('input#password').setValue('wrongpass')
    
    // 模擬API返回登入失敗
    const errorMessage = '用戶名或密碼錯誤'
    api.auth.adminLogin.mockRejectedValue({
      response: { data: { message: errorMessage } }
    })
    
    // 提交表單
    await wrapper.find('form').trigger('submit.prevent')
    
    // 驗證API調用
    expect(api.auth.adminLogin).toHaveBeenCalledWith('wronguser', 'wrongpass')
    
    // 驗證錯誤訊息顯示
    await vi.waitFor(() => {
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.find('.alert-danger').text()).toBe(errorMessage)
    })
  })
  
  it('網絡錯誤時應該顯示無法連線訊息', async () => {
    // 設置輸入值
    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#password').setValue('testpass')
  
    // 模擬 API 網絡錯誤，讓 error.request 存在
    api.auth.adminLogin.mockRejectedValue({
      request: {}, // 這行讓 error.request 存在，模擬沒有伺服器回應的情況
      message: 'Network Error'
    })
  
    // 提交表單
    await wrapper.find('form').trigger('submit.prevent')
  
    // 驗證錯誤訊息
    await vi.waitFor(() => {
      expect(wrapper.find('.alert-danger').text()).toBe('無法連線到伺服器')
    })
  })
  
  
  it('登入前應該清空錯誤訊息', async () => {
    // 首先讓一個登入失敗以顯示錯誤訊息
    await wrapper.find('input#username').setValue('wronguser')
    await wrapper.find('input#password').setValue('wrongpass')
    
    api.auth.adminLogin.mockRejectedValue({
      response: { data: { message: '用戶名或密碼錯誤' } }
    })
    
    await wrapper.find('form').trigger('submit.prevent')
    
    // 確認錯誤訊息已顯示
    await vi.waitFor(() => {
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
    })
    
    // 重設 API 模擬為成功
    api.auth.adminLogin.mockResolvedValue({
      data: { success: true, role: 'super_admin' }
    })
    
    // 再次提交表單
    await wrapper.find('form').trigger('submit.prevent')
    
    // 驗證錯誤訊息應該被清空
    await vi.waitFor(() => {
      expect(wrapper.find('.alert-danger').exists()).toBe(false)
    })
  })
})