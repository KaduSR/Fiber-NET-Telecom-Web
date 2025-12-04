// src/services/auth.service.ts

interface LoginCredentials {
  email: string;
  pass: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  // Mantemos o prefixo /api-proxy sempre.
  // Localmente: Vite resolve.
  // Produção (Vercel): vercel.json resolve.
  const endpoint = '/api-proxy/api/auth/login';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Tenta ler a mensagem de erro da API, se houver
      const errorData = await response.text().catch(() => 'Erro desconhecido'); 
      throw new Error(`Falha ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[AuthService] Erro ao realizar login:', error);
    throw error;
  }
};