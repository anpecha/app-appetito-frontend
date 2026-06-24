# Frontend – Next.js

Este diretório contém a aplicação frontend desenvolvida com **Next.js** e **Tailwind CSS**.  
A aplicação consome a API do backend (`http://backend:8000`) e se comunica com os serviços de IA via variáveis de ambiente (`NEXT_PUBLIC_POTENCIALIZADOR_URL`, `NEXT_PUBLIC_ROBO_URL`).

## Como rodar

```bash
cd frontend
npm install
npm run dev   # roda em http://localhost:3000
```

## Build para produção

```bash
npm run build
npm start      # serve a aplicação em modo produção
```
