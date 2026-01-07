import axios, { AxiosInstance, AxiosError } from 'axios'

/**
 * Configuración base de la API
 */
const API_URL = import.meta.env.VITE_API_URL || 'https://tu-project.vercel.app/api'

/**
 * Cliente Axios configurado para manejar errores offline
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 15000, // 15 segundos
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Interceptor para agregar token de autenticación
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Interceptor para manejar errores de red
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Si no hay conexión, guardar para sincronización offline
        if (!navigator.onLine || error.code === 'ERR_NETWORK') {
          console.warn('Sin conexión. Los datos se guardarán localmente.')
          throw new Error('OFFLINE_MODE')
        }

        // Si el token expiró, intentar renovar
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }

        throw error
      }
    )
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  /**
   * Upload de archivos (multipart/form-data)
   */
  async uploadFile(url: string, file: File | Blob, additionalData?: Record<string, string>): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }

  /**
   * Verificar conectividad
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.client.get('/health')
      return true
    } catch {
      return false
    }
  }
}

// Exportar instancia única
export const api = new ApiClient()

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   */
  async login(email: string, password: string) {
    try {
      const response = await api.post<{
        user: any
        token: string
      }>('/auth/login', { email, password })

      // Guardar token en localStorage
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return response
    } catch (error) {
      if (error instanceof Error && error.message === 'OFFLINE_MODE') {
        throw new Error('No hay conexión. Inicia sesión con conexión primero.')
      }
      throw error
    }
  },

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * Obtener token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}
