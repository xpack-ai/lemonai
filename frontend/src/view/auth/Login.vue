<template>
  <div class="auth-container">
    <div class="auth-content">
      <!-- Logo -->
      <div class="logo-container">
        <div class="logo">
          <img :src="logo" alt="logo" />
        </div>
      </div>
      <!-- Title -->
      <h2 class="auth-title">{{ pageTitle }}</h2>
      <div v-if="activeKey === 'login'">
        <!-- Login Form -->
        <div class="social-buttons">
          <a-button class="social-button google" @click="handleGoogleLogin">
            <template #icon>
              <google />
            </template>
            {{ $t('auth.loginWithGoogle') }}
          </a-button>
          <!-- Apple login button hidden as requested -->
        </div>
        <div class="divider">
          <span>{{ $t('auth.or') }}</span>
        </div>
        <a-form :model="loginForm" name="login-form" @finish="handleLogin" autocomplete="off" layout="vertical">
          <a-form-item name="email" :rules="[
            { required: true, message: $t('auth.pleaseInputEmail') },
            { type: 'email', message: $t('auth.pleaseInputValidEmail') }
          ]">
            <div class="form-label">{{ $t('auth.email') }}<span class="required-mark">*</span></div>
            <a-input v-model:value="loginForm.email" :placeholder="$t('auth.pleaseInputEmail')">
            </a-input>
          </a-form-item>
          <a-form-item name="password" :rules="[{ required: true, message: $t('auth.pleaseInputPassword') }]" extra="">
            <div class="password-label-container">
              <div class="form-label">{{ $t('auth.password') }}<span class="required-mark">*</span></div>
              <a class="forgot-link" @click="activeKey = 'forgot'">{{ $t('auth.forgotPassword') }}</a>
            </div>
            <a-input-password v-model:value="loginForm.password" :placeholder="$t('auth.pleaseInputPassword')">
            </a-input-password>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" block :loading="loading" :disabled="!isLoginValid">
              {{ $t('auth.login') }}
            </a-button>
          </a-form-item>
          <div class="auth-footer">
            <span>{{ $t('auth.noAccount') }} </span>
            <a @click="activeKey = 'register'">{{ $t('auth.register') }}</a>
          </div>
        </a-form>
      </div>
      <div v-if="activeKey === 'register'">
        <!-- Register Form -->
        <div class="social-buttons">
          <a-button class="social-button google" @click="handleGoogleRegister">
            <template #icon>
              <google />
            </template>
            {{ $t('auth.registerWithGoogle') }}
          </a-button>
          <!-- Apple register button hidden as requested -->
        </div>
        <div class="divider">
          <span>{{ $t('auth.or') }}</span>
        </div>
        <a-form :model="registerForm" name="register-form" @finish="handleRegister" autocomplete="off"
          layout="vertical">
          <a-form-item name="fullname" :rules="[{ required: true, message: $t('auth.pleaseInputFullname') }]">
            <div class="form-label">{{ $t('auth.fullname') }}<span class="required-mark">*</span></div>
            <a-input v-model:value="registerForm.fullname" :placeholder="$t('auth.pleaseInputFullname')">
            </a-input>
          </a-form-item>
          <a-form-item name="email" :rules="[
            { required: true, message: $t('auth.pleaseInputEmail') },
            { type: 'email', message: $t('auth.pleaseInputValidEmail') }
          ]">
            <div class="form-label">{{ $t('auth.email') }}<span class="required-mark">*</span></div>
            <a-input v-model:value="registerForm.email" :placeholder="$t('auth.pleaseInputEmail')">
            </a-input>
          </a-form-item>
          <a-form-item name="password" :rules="[{ required: true, message: $t('auth.pleaseInputPassword') }]">
            <div class="form-label">{{ $t('auth.password') }}<span class="required-mark">*</span></div>
            <a-input-password v-model:value="registerForm.password" :placeholder="$t('auth.pleaseInputPassword')">
            </a-input-password>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" block :loading="loading" :disabled="!isRegisterValid">
              {{ $t('auth.register') }}
            </a-button>
          </a-form-item>
          <div class="auth-footer">
            <span>{{ $t('auth.haveAccount') }} </span>
            <a @click="activeKey = 'login'">{{ $t('auth.login') }}</a>
          </div>
        </a-form>
      </div>
      <div v-if="activeKey === 'forgot'">
        <!-- Forgot Password Form -->
        <a-form :model="forgotForm" name="forgot-form" @finish="handleForgotPassword" autocomplete="off"
          layout="vertical">
          <a-form-item v-if="resetPasswordStatus === 'sendCode'" name="email" :rules="[
            { required: true, message: $t('auth.pleaseInputEmail') },
            { type: 'email', message: $t('auth.pleaseInputValidEmail') }
          ]">
            <div class="form-label">{{ $t('auth.email') }}<span class="required-mark">*</span></div>
            <a-input v-model:value="forgotForm.email" :placeholder="$t('auth.pleaseInputEmail')">
            </a-input>
          </a-form-item>
          <a-form-item v-if="resetPasswordStatus === 'inputCode'" name="code"
            :rules="[{ required: true, message: $t('auth.pleaseInputVerifyCode') }]">
            <div class="form-label">{{ $t('auth.codeSentTo') }} {{ forgotForm.email }}</div>
            <a-input v-model:value="forgotForm.code" :placeholder="$t('auth.pleaseInputVerifyCode')">
            </a-input>
          </a-form-item>
          <a-form-item v-if="resetPasswordStatus === 'inputCode'" name="password"
            :rules="[{ required: true, message: $t('auth.pleaseInputNewPassword') }]">
            <div class="form-label">{{ $t('auth.password') }}<span class="required-mark">*</span></div>
            <a-input-password v-model:value="forgotForm.password" :placeholder="$t('auth.pleaseInputNewPassword')">
            </a-input-password>
          </a-form-item>
          <a-form-item v-if="resetPasswordStatus === 'inputCode'" name="confirmPassword"
            :rules="[{ required: true, message: $t('auth.pleaseConfirmPassword') }]">
            <div class="form-label">{{ $t('auth.pleaseConfirmPassword') }}<span class="required-mark">*</span></div>
            <a-input-password v-model:value="forgotForm.confirmPassword" :placeholder="$t('auth.pleaseConfirmPassword')">
            </a-input-password>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" :disabled="!isForgotValid" html-type="submit" block :loading="loading">
              {{ $t('auth.resetPasswordButton') }}
            </a-button>
          </a-form-item>
          <div class="auth-footer">
            <a @click="activeKey = 'login'">{{ $t('auth.backToLogin') }}</a>
          </div>
        </a-form>
      </div>
      <div v-if="activeKey === 'verify'">
        <!-- Email Verification Form -->
        <div class="verify-container">
          <p class="verify-text">{{ $t('auth.codeSentTo') }} {{ verifyEmail }}</p>
          <a-form :model="verifyForm" name="verify-form" @finish="handleVerify" autocomplete="off" layout="vertical">
            <a-form-item name="code" :rules="[{ required: true, message: $t('auth.pleaseInput6DigitCode') }]">
              <a-input v-model:value="verifyForm.code" :placeholder="$t('auth.pleaseInput6DigitCode')">
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" block :loading="loading" :disabled="!verifyForm.code">
                {{ $t('auth.verifyEmailButton') }}
              </a-button>
            </a-form-item>
            <div class="verify-footer">
              <p>{{ $t('auth.notReceivedCode') }} <a @click="resendCode">{{ $t('auth.resendCode') }}</a></p>
            </div>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import logo from '@/assets/image/lemon.jpg';
import google from '@/assets/svg/google.svg';
// import apple from '@/assets/svg/apple.svg';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import auth from '@/services/auth';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

// 页面状态
const activeKey = ref('login');
const loading = ref(false);

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
});
const isLoginValid = computed(() => {
  return loginForm.email && loginForm.password && loginForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});

// 注册表单
const registerForm = reactive({
  fullname: '',
  email: '',
  password: ''
});
const isRegisterValid = computed(() => {
  return registerForm.fullname && registerForm.email && registerForm.password;
});

// 忘记密码表单
const forgotForm = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
});
const isForgotValid = computed(() => {
  return forgotForm.email && forgotForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});
const resetPasswordStatus = ref('sendCode');

// 验证相关状态
const verifyEmail = ref('');
const verifyForm = reactive({
  code: ''
});

// 页面标题
const pageTitle = computed(() => {
  switch (activeKey.value) {
    case 'login':
      return t('auth.loginToLemonAI');
    case 'register':
      return t('auth.registerLemonAIAccount');
    case 'verify':
      return t('auth.verifyEmail');
    default:
      return t('auth.resetPassword');
  }
});

// 处理验证码提交
const handleVerify = async () => {
  try {
    loading.value = true;
    const res = await auth.verifyEmailVerifyCode(verifyEmail.value, verifyForm.code);
    if (res.code === 200) {
      const res = await auth.register(
        registerForm.fullname,
        registerForm.email,
        registerForm.password
      );
      if (res.code === 200) {
        message.success(t('auth.registrationSuccessful'));
        activeKey.value = 'login';
        loginForm.email = registerForm.email;
        loginForm.password = '';
      } else {
        message.error(res.message);
      }
    } else {
      message.error(res.message);
    }
  } catch (error) {
    message.error(t('auth.verificationCodeError'));
  } finally {
    loading.value = false;
  }
};

// 重新发送验证码
const resendCode = async () => {
  const now = new Date();
  const lastSendTimeString = localStorage.getItem('lastSendTime');
  if (lastSendTimeString) {
    const lastSendTime = new Date(lastSendTimeString);
    const diff = now - lastSendTime;
    if (diff < 60000) {
      message.error(t('auth.doNotSendFrequently'));
      return;
    }
  }
  localStorage.setItem('lastSendTime', now.toString());
  await auth.sendEmailVerification(verifyEmail.value);
  loading.value = true;
  verifyForm.code = '';
  message.info(t('auth.codeResent'));
};

// 处理登录
const handleLogin = async (values) => {
  try {
    loading.value = true;
    const res = await auth.login(values.email, values.password);
    if (res.code === 200) {
      message.success(t('auth.loginSuccessful'));
      router.push({ name: 'app' });
    } else {
      message.error(res.message);
    }
  } catch (error) {
    message.error(t('auth.loginFailed'));
  } finally {
    loading.value = false;
  }
};

// 处理注册
const handleRegister = async (values) => {
  try {
    loading.value = true;
    if (!values.fullname || !values.email || !values.password) {
      throw new Error(t('auth.fillCompleteInfo'));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      throw new Error(t('auth.pleaseEnterValidEmail'));
    }
    if (values.password.length < 6) {
      throw new Error(t('auth.passwordTooShort'));
    }
    activeKey.value = 'verify';
    verifyEmail.value = values.email;
    localStorage.setItem('lastSendTime', new Date().toString());
    const res = await auth.sendEmailVerification(values.email);
    if (res.code === 200) {
      message.success(t('auth.codeSent'));
    } else {
      message.error(res.message);
    }
  } catch (error) {
    message.error(error.message || t('auth.registrationFailed'));
  } finally {
    loading.value = false;
  }
};

// 处理忘记密码
const handleForgotPassword = async (values) => {
  try {
    loading.value = true;
    if (resetPasswordStatus.value === 'sendCode') {
      const res = await auth.sendEmailVerification(forgotForm.email);
      if (res.code === 200) {
        message.success(t('auth.codeSent'));
        resetPasswordStatus.value = 'inputCode';
      } else {
        message.error(res.message);
      }
    } else {
      if (!forgotForm.code) {
        message.error(t('auth.pleaseInputCode'));
        return;
      }
      if (forgotForm.password !== forgotForm.confirmPassword) {
        message.error(t('auth.passwordsDoNotMatch'));
        return;
      }
      const res = await auth.resetPassword(forgotForm.email, forgotForm.code, forgotForm.password);
      if (res.code === 200) {
        message.success(t('auth.passwordResetSuccessful'));
        activeKey.value = 'login';
        loginForm.email = forgotForm.email;
        loginForm.password = '';
      } else {
        message.error(res.message);
      }
    }
  } catch (error) {
    message.error(t('auth.passwordResetFailed'));
  } finally {
    loading.value = false;
  }
};

// 社交登录方法
const handleGoogleLogin = () => {
  try {
    loading.value = true;
    const clientId = '973572698649-hbp15ju1nhlsja1k2gbqktmrulk0hopp.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(import.meta.env.VITE_GOOGLE_BACK_URL);
    const scope = encodeURIComponent('profile email');
    const responseType = 'code';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&access_type=offline&prompt=consent`;
    window.location.href = googleAuthUrl;
  } catch (error) {
    message.error(t('auth.googleLoginFailed'));
  } finally {
    loading.value = false;
  }
};

const handleAppleLogin = async () => {
  try {
    loading.value = true;
    message.info(t('auth.appleLoginInProgress'));
  } finally {
    loading.value = false;
  }
};

const handleGoogleRegister = async () => {
  try {
    loading.value = true;
    message.info(t('auth.googleRegisterInProgress'));
  } finally {
    loading.value = false;
  }
};

const handleAppleRegister = async () => {
  try {
    loading.value = true;
    message.info(t('auth.appleRegisterInProgress'));
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f8f7;

  .auth-content {
    width: 100%;
    max-width: 420px;
    padding: 32px;

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;

      .logo {
        width: 64px;
        height: 64px;
        color: #333;

        img{
          width: 100%;
          height: 100%;
        }
      }
    }

    .auth-title {
      text-align: center;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 32px;
      color: #111827;
    }

    .social-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
      align-items: center;

      .social-button {
        width: 100%;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;



        img {
          margin-right: 6px;
        }

        &.google {
          border: none;
          background-color: white;
          color: #333;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      }



    }

    .divider {
      position: relative;
      text-align: center;
      margin: 24px 0;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background-color: #e5e7eb;
        z-index: 0;
      }

      span {
        position: relative;
        background-color: transparent;
        padding: 0 12px;
        color: #6b7280;
        font-size: 14px;
        z-index: 1;
      }
    }

    .password-label-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;

      .form-label {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
      }

      .forgot-link {
        font-size: 14px;
        color: #4f46e5;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    :deep(.ant-form-item-control-input-content) {
      width: 360px;
    }

    :deep(.ant-form-item) {
      width: 100%;
      margin-bottom: 20px;
      display: flex;
      justify-content: center;

      .ant-form-item-control {
        width: 100%;
      }

      .ant-form-item-label>label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .form-label {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
        margin-bottom: 4px;

        .required-mark {
          color: #ff4d4f;
          margin-left: 2px;
        }
      }

      .ant-input {
        width: 100%;
        height: 40px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background-color: #ffffff;

        &:hover,
        &:focus {
          border-color: #4f46e5;
        }
      }

      .ant-input-affix-wrapper {
        width: 100%;
        height: 40px !important;
        border-radius: 8px !important;
        border: 1px solid #d1d5db !important;
        background-color: #ffffff !important;
        box-shadow: none !important;
        padding: 0 11px !important;

        &:hover,
        &:focus,
        &-focused {
          border-color: #4f46e5 !important;
        }



        .ant-input {
          width: 100% !important;
          height: 38px !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          background-color: #ffffff !important;

          &:focus {
            box-shadow: none !important;
          }
        }

        .ant-input-suffix {
          margin-left: 0 !important;
        }
      }

      .ant-btn {
        width: 100%;
        height: 40px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        background-color: #4f46e5;
        border-color: #4f46e5;

        &:hover {
          background-color: #4338ca;
          border-color: #4338ca;
        }

        &[disabled] {
          background-color: #d1d5db;
          border-color: #d1d5db;
          color: white;
          cursor: not-allowed;

          &:hover {
            background-color: #d1d5db;
            border-color: #d1d5db;
          }
        }
      }
    }

    .auth-footer {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: #6b7280;

      a {
        color: #4f46e5;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.verify-container {
  text-align: center;
  padding: 24px;

  .verify-icon {
    margin-bottom: 24px;

    svg {
      color: #4f46e5;
    }
  }

  .verify-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #111827;
  }

  .verify-text {
    font-size: 16px;
    color: #6b7280;
    margin-bottom: 32px;
  }

  .verify-footer {
    margin-top: 24px;
    font-size: 14px;
    color: #6b7280;

    p {
      margin-bottom: 12px;
    }

    a {
      color: #4f46e5;
      font-weight: 500;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  :deep(.ant-form-item) {
    max-width: 100%;
    margin: 0 auto;

    .ant-input {
      text-align: center;
      letter-spacing: 8px;
      font-size: 18px;
    }
  }
}
</style>