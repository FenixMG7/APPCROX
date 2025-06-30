import { Child, Category } from '../types';

const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export interface StoredData {
  children: Child[];
  categories: Category[];
}

export const isJsonBinConfigured = (): boolean => {
    return !!BIN_ID && !!API_KEY;
}

export const loadData = async (): Promise<StoredData> => {
    if (!isJsonBinConfigured()) {
        throw new Error("Configuration JSONBin manquante.");
    }

    const response = await fetch(`${BASE_URL}/latest`, {
        method: 'GET',
        headers: {
            'X-Master-Key': API_KEY,
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur de chargement des données: ${response.statusText}`);
    }

    const data = await response.json();
    // Les données de JSONBin sont nichées sous la clé 'record'
    return data.record;
};

export const saveData = async (data: StoredData): Promise<void> => {
    if (!isJsonBinConfigured()) {
        console.warn("Configuration JSONBin manquante. Sauvegarde ignorée.");
        return;
    }

    await fetch(BASE_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY,
        },
        body: JSON.stringify(data),
    });
};
