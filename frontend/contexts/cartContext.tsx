import { createContext, useContext, useReducer, ReactNode } from "react";
import { cartReducer, cartInitialState, CART_ACTIONS_TYPE } from '../reducers/cart';
import { CartContextType } from "@/interfaces/cartContextType";
import { CartItem } from "@/interfaces/cartItem";

const CartContext = createContext<CartContextType | undefined>(undefined);

function useCartReducer() {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  const addToCart = (product: CartItem) => dispatch({
    type: CART_ACTIONS_TYPE.ADD_TO_CART,
    payload: product
  });

  const removeFromCart = (productId: string) => dispatch({
    type: CART_ACTIONS_TYPE.REMOVE_FROM_CART,
    payload: { id: productId }
  });

  const clearCart = () => dispatch({
    type: CART_ACTIONS_TYPE.CLEAR_CART
  });

  const updateQuantity = (productId: string, quantity: number) => dispatch({
    type: CART_ACTIONS_TYPE.UPDATE_QUANTITY,
    payload: { id: productId, quantity }
  });

  return {
    cart: state,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cartState = useCartReducer();
  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}