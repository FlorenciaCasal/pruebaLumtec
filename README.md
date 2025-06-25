This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.







Cambios clave:
body → min-h-screen flex flex-col
Para que ocupe toda la altura de la pantalla y distribuya sus hijos en columna.

<main> → flex-grow
Para que el contenido principal tome todo el espacio disponible entre Navbar y Footer.

Con eso, incluso si no hay mucho contenido, el Footer se queda bien abajo pegado.


Comandos prismanpx 
npx prisma generate
npx prisma db seed
npx prisma studio

Levantar ngrok desde la carpeta que lo contiene: 
./ngrok http 3000


📱 Breakpoints de Tailwind (predeterminados)
Nombre	Clase	Min-width (px)
xs (no existe por defecto en Tailwind)	—	—
sm	sm:	640px
md	md:	768px
lg	lg:	1024px
xl	xl:	1280px
2xl	2xl:	1536px