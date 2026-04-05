import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { useCartStore } from "../stores";
import { useAuthStore } from "../store/authStore";
import {
  orderService,
  CreateOrderResponse,
  ApiErrorResponse,
} from "../services";

interface UseSubmitOrderOptions {
  onSuccess?: (order: CreateOrderResponse) => void;
  onError?: (error: string) => void;
}

interface UseSubmitOrderReturn {
  submitOrder: () => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for submitting orders to the kitchen
 */
export function useSubmitOrder(
  options: UseSubmitOrderOptions = {}
): UseSubmitOrderReturn {
  const { onSuccess, onError } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items, tableId, couverts, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getErrorMessage = useCallback((err: unknown): string => {
    if (err instanceof AxiosError) {
      // Network error (no response)
      if (!err.response) {
        return "Connexion impossible. Vérifiez votre réseau.";
      }

      const status = err.response.status;
      const data = err.response.data as ApiErrorResponse;

      // Validation error
      if (status === 422) {
        if (data.errors) {
          // Get first error message from validation errors
          const firstErrorKey = Object.keys(data.errors)[0];
          if (firstErrorKey && data.errors[firstErrorKey].length > 0) {
            return data.errors[firstErrorKey][0];
          }
        }
        return data.message || "Données invalides. Veuillez vérifier votre commande.";
      }

      // Server error
      if (status >= 500) {
        return "Erreur serveur. Réessayez.";
      }

      // Other client errors
      if (status >= 400) {
        return data.message || "Une erreur est survenue.";
      }
    }

    // Unknown error
    return "Une erreur inattendue est survenue. Réessayez.";
  }, []);

  const submitOrder = useCallback(async (): Promise<boolean> => {
    // Prevent double submission
    if (isSubmitting) {
      return false;
    }

    // Validate cart
    if (items.length === 0) {
      const errorMsg = "Le panier est vide.";
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    if (!tableId) {
      const errorMsg = "Aucune table sélectionnée.";
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        table_id: tableId,
        couverts: couverts,
        utilisateur_id: user!.id,
        lignes: items.map((item) => ({
          article_id: item.article_id,
          quantite: item.quantite,
        })),
      };

      const response = await orderService.createOrder(payload);

      // Success: clear cart and call success callback
      clearCart();
      onSuccess?.(response);

      return true;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      onError?.(errorMsg);

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    items,
    tableId,
    couverts,
    user,
    clearCart,
    onSuccess,
    onError,
    getErrorMessage,
  ]);

  return {
    submitOrder,
    isSubmitting,
    error,
    clearError,
  };
}
