#!/bin/bash
echo "🚀 Iniciando serviços FlowZZ..."

# Backend
echo "Iniciando backend..."
cd backend && pnpm run dev &
BACKEND_PID=$!

# Flow App
echo "Iniciando Flow App..."
cd flow && pnpm run dev &
FLOW_PID=$!

# Admin Panel (servir build)
echo "Iniciando Admin Panel..."
cd admin && pnpm run preview &
ADMIN_PID=$!

# Landing Page (servir build)
echo "Iniciando Landing Page..."
cd landing && pnpm run preview &
LANDING_PID=$!

echo ""
echo "✅ Serviços iniciados!"
echo "📊 URLs de acesso:"
echo "  - Backend API: http://localhost:4000"
echo "  - Flow App:    http://localhost:3000"
echo "  - Admin:       http://localhost:4173"
echo "  - Landing:     http://localhost:4174"
echo ""
echo "🛑 Para parar todos os serviços: kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID"

# Aguardar interrupção
trap "echo 'Parando serviços...'; kill $BACKEND_PID $FLOW_PID $ADMIN_PID $LANDING_PID 2>/dev/null; exit" INT
wait
