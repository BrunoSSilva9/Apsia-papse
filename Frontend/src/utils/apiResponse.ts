/**
 * Desempacota a resposta da API para suportar o formato padronizado (Envelope) e
 * o formato antigo simultaneamente.
 * 
 * Formato novo: { success: boolean, data: T, message: string }
 * Formato antigo: T (ex: { token, usuario })
 */
export function unwrapApiResponse<T>(responseData: any): T {
  if (
    responseData &&
    typeof responseData === "object" &&
    "success" in responseData &&
    "data" in responseData
  ) {
    return responseData.data as T;
  }
  
  // Retorna diretamente se já for o formato antigo ou não tiver o envelope esperado
  return responseData as T;
}
