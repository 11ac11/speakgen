# Speakgen FCE
https://speakgen.vercel.app/
*README last updated: Sept 2024*

<img width="1440" alt="image" src="https://github.com/user-attachments/assets/7c77654f-55bc-4fc6-aef3-a23cfcaed8a8">
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/3716c45c-0c7a-4cd2-9502-f6e7406728d8">

## App description
Speakgen is a generator that helps First Certificate English (FCE) students practise the speaking exam. It has example questions from all 4 parts and timers showing how long they have left to continue answering the question.

## Repo Description
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), deployed on vercel.

## Set-up

### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Production
The application is hosted on Vercel, and each push to master is pushed to production as CI/CD.

## Pages & Features
Each page contains an introduction to the question, with instructions and a 'Get Question' button. When the user clicks the button, they are randomly assigned a question from the db. Each question also has the alloted time to respond to the questions, counting down in the top right corner.
