import axios from 'axios'

class Client {
  constructor({ clientId, clientSecret, baseUrl }) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: 'application/json',
      },
      data: {
        client_id: clientId,
        client_secret: clientSecret,
      },
    })
    this.axios.interceptors.request.use(
      (config) => {
        config.data = {
          ...this.axios.defaults.data,
          ...config.data,
        }
        return config
      },
      (error) => Promise.reject(error),
    )
    this.webAuth = {
      clearSession: this.clearSession,
      authorize: this.authorize,
      axios: this.axios,
      revokeToken: this.revokeToken,
    }
    this.auth = {
      refreshToken: this.refreshToken,
      authorize: this.authorize,
      axios: this.axios,
      revokeToken: this.revokeToken,
      login: this.login,
    }
  }

  async login({ username, password }) {
    return (
      await this.axios.post('token/', {
        username,
        password,
        grant_type: 'password',
      })
    ).data
  }

  async refreshToken({ refreshToken }) {
    return (
      await this.axios.post('token/', {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      })
    ).data
  }

  async authorize({ accessTokenSocial, backend }) {
    return (
      await this.axios.post('convert-token/', {
        backend,
        token: accessTokenSocial,
        grant_type: 'convert_token',
      })
    ).data
  }

  async revokeToken({ token }) {
    return await this.axios.post('revoke-token/', {
      token,
    })
  }

  async clearSession({ token }) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.revokeToken({ token })
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }
}

export default Client
