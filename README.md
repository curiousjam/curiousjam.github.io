[jezamancenido.com](https://www.jezamancenido.com/)

## Optional analytics

To measure the portfolio, copy `.env.example` to `.env.local` and replace the placeholder with a Google Analytics 4 measurement ID:

```sh
cp .env.example .env.local
```

The portfolio then records page views and labeled interactions such as role-pill selections, timeline navigation, résumé requests, and external-link clicks. Without `VITE_GA_MEASUREMENT_ID`, no analytics script loads and no data is sent.
