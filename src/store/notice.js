export default {
  namespaced: true,
  state: () => ({
    isNotice: false,
    _messages: []
  }),
  getters: {
    messages: state => {
      const messages = [...state._messages];
      while (state._messages.length)
        state._messages.shift();
      state.isNotice = false;
      return messages;
    }
  },
  mutations: {
    push(state, payload){
      state.isNotice = true;
      state._messages.push(payload);
    }
  }
}