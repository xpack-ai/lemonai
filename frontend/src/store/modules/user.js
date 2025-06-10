import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {}
  }),
  actions: {
    setUser(user) {
      console.log('setUser', user);
      this.user = user;
    }
  },
  persist: true,
})
