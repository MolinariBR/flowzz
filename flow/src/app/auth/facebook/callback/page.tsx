"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFacebookAds } from '@/lib/hooks/useFacebookAds';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useFacebookAds();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setMessage(errorDescription || 'Erro na autenticação com Facebook');
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Parâmetros de autenticação inválidos');
        return;
      }

      try {
        const result = await handleCallback(code, state);
        if (result?.success) {
          setStatus('success');
          setMessage('Facebook Ads conectado com sucesso! Redirecionando...');
          // O hook já redireciona para /anuncios
        } else {
          setStatus('error');
          setMessage(result?.message || 'Erro ao conectar Facebook Ads');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erro inesperado ao processar callback');
        console.error('Facebook callback error:', error);
      }
    };

    processCallback();
  }, [searchParams, handleCallback]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Conectando Facebook Ads
              </h1>
              <p className="text-slate-600">
                Aguarde enquanto processamos sua autenticação...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Conexão Bem-Sucedida!
              </h1>
              <p className="text-slate-600 mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push('/anuncios')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir para Anúncios
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Erro na Conexão
              </h1>
              <p className="text-slate-600 mb-4">
                {message}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/anuncios')}
                  className="w-full bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Voltar para Anúncios
                </button>
                <button
                  onClick={() => window.location.href = '/anuncios'}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FacebookCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Carregando...
            </h1>
          </div>
        </div>
      </div>
    }>
      <FacebookCallbackContent />
    </Suspense>
  );
}