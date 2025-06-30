
import React from 'react';

export const ConfigError: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-red-50 flex justify-center items-center p-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl text-center border-4 border-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="text-3xl font-bold text-red-700 mb-4">Configuration Requise</h1>
                <p className="text-slate-700 mb-4 text-lg">
                    L'application n'a pas pu se connecter à ses services externes (Firebase & Gemini).
                </p>
                <p className="text-slate-600 mb-6">
                    Assurez-vous que les variables d'environnement suivantes sont définies dans votre plateforme d'hébergement (ex: Vercel).
                </p>
                <div className="bg-slate-100 rounded-lg p-4 text-left font-mono text-sm text-slate-800 space-y-1">
                    <p><span className="font-semibold text-red-600">API_KEY</span>: Votre clé API pour Google Gemini.</p>
                    <p><span className="font-semibold text-red-600">FIREBASE_API_KEY</span>: Votre clé API Firebase.</p>
                    <p><span className="font-semibold text-red-600">FIREBASE_AUTH_DOMAIN</span>: Domaine d'authentification Firebase.</p>
                    <p><span className="font-semibold text-red-600">FIREBASE_PROJECT_ID</span>: Votre ID de projet Firebase.</p>
                    <p><span className="font-semibold text-red-600">FIREBASE_STORAGE_BUCKET</span>: Le bucket de stockage Firebase.</p>
                    <p><span className="font-semibold text-red-600">FIREBASE_MESSAGING_SENDER_ID</span>: L'ID d'expéditeur pour la messagerie.</p>
                    <p><span className="font-semibold text-red-600">FIREBASE_APP_ID</span>: L'ID de votre application Firebase.</p>
                </div>
                 <p className="text-slate-500 mt-6 text-sm">
                    Après avoir ajouté ces variables, vous devrez redéployer votre application pour que les changements prennent effet.
                </p>
            </div>
        </div>
    );
};