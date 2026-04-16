# Contributing to Gallery Flow

Danke, dass du zu Gallery Flow beitragen möchtest!

## Entwicklung

```bash
git clone https://github.com/light-down/gallery-flow
cd gallery-flow
npm install
cp .env.example .env.local
# .env.local befüllen
npx prisma migrate dev
npm run dev
```

## Pull Requests

1. Fork das Repository
2. Erstelle einen Feature-Branch: `git checkout -b feature/mein-feature`
3. Committe deine Änderungen: `git commit -m 'Add: Beschreibung'`
4. Push den Branch: `git push origin feature/mein-feature`
5. Öffne einen Pull Request

## Code-Stil

- TypeScript strict mode — keine `any` Types
- Keine unnötigen Kommentare
- Komponenten in `components/`, Seiten in `app/`
- API-Routes immer mit Session-Check absichern

## Lizenz

Mit deinem Beitrag stimmst du zu, dass dieser unter der GPLv3-Lizenz veröffentlicht wird.
