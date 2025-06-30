import { Child, Category } from '../types';

const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

// URL de base avec validation
const BASE_URL = BIN_ID ? `https://api.jsonbin.io/v3/b/${BIN_ID}` : '';

export interface StoredData {
  children: Child[];
  categories: Category[];
}

export interface JsonBinResponse<T> {
  record: T;
  metadata: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface JsonBinError {
  message: string;
  statusCode?: number;
}

/**
 * Vérifie si la configuration JSONBin est complète
 */
export const isJsonBinConfigured = (): boolean => {
  return Boolean(BIN_ID?.trim()) && Boolean(API_KEY?.trim());
};

/**
 * Valide la structure des données
 */
const validateData = (data: any): data is StoredData => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.children) &&
    Array.isArray(data.categories)
  );
};

/**
 * Gère les erreurs HTTP et retourne un message d'erreur approprié
 */
const handleHttpError = async (response: Response): Promise<never> => {
  let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
  
  try {
    const errorData = await response.json();
    if (errorData.message) {
      errorMessage = errorData.message;
    }
  } catch {
    // Ignore l'erreur de parsing JSON, utilise le message par défaut
  }

  throw new Error(errorMessage);
};

/**
 * Charge les données depuis JSONBin avec gestion d'erreur complète
 */
export const loadData = async (): Promise<StoredData> => {
  if (!isJsonBinConfigured()) {
    throw new Error(
      "Configuration JSONBin manquante. Veuillez définir JSONBIN_BIN_ID et JSONBIN_API_KEY."
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

    const response = await fetch(`${BASE_URL}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY!,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleHttpError(response);
    }

    const jsonResponse: JsonBinResponse<StoredData> = await response.json();
    
    if (!jsonResponse.record) {
      throw new Error("Aucune donnée trouvée dans la réponse JSONBin");
    }

    const data = jsonResponse.record;

    if (!validateData(data)) {
      // Si les données sont invalides, retourner une structure par défaut
      console.warn("Données invalides détectées, utilisation de la structure par défaut");
      return {
        children: [],
        categories: [],
      };
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error("Timeout lors du chargement des données");
      }
      throw error;
    }
    throw new Error("Erreur inconnue lors du chargement des données");
  }
};

/**
 * Sauvegarde les données dans JSONBin avec retry automatique
 */
export const saveData = async (data: StoredData, retries = 2): Promise<void> => {
  if (!isJsonBinConfigured()) {
    console.warn("Configuration JSONBin manquante. Sauvegarde ignorée.");
    return;
  }

  if (!validateData(data)) {
    throw new Error("Données invalides - impossible de sauvegarder");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout 15s pour la sauvegarde

      const response = await fetch(BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY!,
          'X-Bin-Versioning': 'false', // Évite la création de versions multiples
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await handleHttpError(response);
      }

      // Succès - sortir de la boucle
      return;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Erreur inconnue");
      
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error("Timeout lors de la sauvegarde");
      }

      // Si ce n'est pas le dernier essai, attendre avant de réessayer
      if (attempt < retries) {
        console.warn(`Tentative ${attempt + 1} échouée, retry dans 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Si on arrive ici, tous les essais ont échoué
  throw new Error(`Échec de la sauvegarde après ${retries + 1} tentatives: ${lastError?.message}`);
};

/**
 * Initialise le bin avec des données par défaut si vide
 */
export const initializeEmptyBin = async (): Promise<void> => {
  const defaultData: StoredData = {
    children: [],
    categories: [],
  };

  try {
    await loadData();
  } catch (error) {
    // Si le chargement échoue, initialiser avec les données par défaut
    console.log("Initialisation du bin avec des données par défaut...");
    await saveData(defaultData);
  }
};

/**
 * Utilitaire pour tester la connexion JSONBin
 */
export const testConnection = async (): Promise<boolean> => {
  if (!isJsonBinConfigured()) {
    return false;
  }

  try {
    await loadData();
    return true;
  } catch {
    return false;
  }
};

/**
 * Récupère les métadonnées du bin
 */
export const getBinMetadata = async () => {
  if (!isJsonBinConfigured()) {
    throw new Error("Configuration JSONBin manquante");
  }

  try {
    const response = await fetch(`${BASE_URL}/meta`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY!,
      },
    });

    if (!response.ok) {
      await handleHttpError(response);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des métadonnées: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};
