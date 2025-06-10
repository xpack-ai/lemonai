import http from "@/utils/http.js";
import md5 from "md5";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();

const service = {
  async login(email, password) {
    try {
      // 对密码进行MD5加密
      const hashedPassword = md5(password);
      
      // 调用登录API
      const uri = "/api/users/login";
      const response = await http.post(uri, {
        email,
        password: hashedPassword
      });
      
      // 保存用户信息和token
      if (response.data && response.data.access_token) {
        
        localStorage.setItem('access_token', response.data.access_token);

        console.log('Login successful:', response.data);
        userStore.setUser(response.data.userInfo);
      }
      
      return response.data || {};
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async register(name, email, password) {
    try {
      // 对密码进行MD5加密
      const hashedPassword = md5(password);
      
      // 调用注册API
      const uri = "/api/users/register";
      const response = await http.post(uri, {
        name,
        email,
        password: hashedPassword
      });
      
      return response.data || {};
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  async sendEmailVerification(email) {
    try {
      const uri = "/api/users/sendEmailVerifyCode";
      const response = await http.post(uri, { email });
      return response.data || {};
    } catch (error) {
      console.error('Send email verification error:', error);
      throw error;
    }
  },
  async verifyEmailVerifyCode(email, code) {
    try {
      const uri = "/api/users/verifyEmailVerifyCode";
      const response = await http.post(uri, { email, code });
      return response.data || {};
    } catch (error) {
      console.error('Verify email verify code error:', error);
      throw error;
    }
  },
  //resetPassword
  async resetPassword(email, code, password) {
    try {
      const uri = "/api/users/resetPassword";
      const hashedPassword = md5(password);
      const response = await http.post(uri, { email, code, password: hashedPassword });
      return response.data || {};
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('lastSendTime');
    localStorage.removeItem('user');
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  //请求谷歌 校验 code
  async googleAuth(code) {
    try {
      const uri = "/api/users/google-auth";
      const response = await http.post(uri, { code });
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        userStore.setUser(response.data.userInfo);
        // localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data || {};
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  },
};

export default service;