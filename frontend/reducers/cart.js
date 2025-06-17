export const cartInitialState = typeof window !== 'undefined' 
  ? JSON.parse(window.localStorage.getItem('cart')) || []
  : [];

export const CART_ACTIONS_TYPE = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY'
};

export const updateLocalStorage = (cart) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cart', JSON.stringify(cart));
  }
};

const UPDATE_STATE_CART = {
  [CART_ACTIONS_TYPE.ADD_TO_CART]: (state, action) => {
    const { id, quantity } = action.payload;
    const productIndex = state.findIndex(item => item.id === id);
    
    if (productIndex >= 0) {
      const newState = structuredClone(state);
      newState[productIndex].quantity += quantity;
      updateLocalStorage(newState);
      return newState;
    }

    const newState = [...state, { ...action.payload }];
    updateLocalStorage(newState);
    return newState;
  },

  [CART_ACTIONS_TYPE.REMOVE_FROM_CART]: (state, action) => {
    const { id } = action.payload;
    const newState = state.filter(item => item.id !== id);
    updateLocalStorage(newState);
    return newState;
  },

  [CART_ACTIONS_TYPE.CLEAR_CART]: () => {
    const newState = [];
    updateLocalStorage(newState);
    return newState;
  },

  [CART_ACTIONS_TYPE.UPDATE_QUANTITY]: (state, action) => {
    const { id, quantity } = action.payload;
    const productIndex = state.findIndex(item => item.id === id);
    
    if (productIndex >= 0) {
      const newState = structuredClone(state);
      newState[productIndex].quantity = quantity;
      updateLocalStorage(newState);
      return newState;
    }
    
    return state;
  }
};

export const cartReducer = (state, action) => {
  const { type: actionType } = action;
  const updateState = UPDATE_STATE_CART[actionType];
  return updateState ? updateState(state, action) : state;
};