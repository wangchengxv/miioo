import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCreationStore = create(
  persist(
    (set) => ({
      generationsByTab: { image: [], video: [], dubbing: [] },
      favorites: new Set(),

      addGeneration: (tab, generation) =>
        set((state) => ({
          generationsByTab: {
            ...state.generationsByTab,
            [tab]: [...state.generationsByTab[tab], generation],
          },
        })),

      updateCardIds: (tab, genId, cardIds) =>
        set((state) => ({
          generationsByTab: {
            ...state.generationsByTab,
            [tab]: state.generationsByTab[tab].map((gen) => {
              if (gen.id !== genId) return gen;
              return {
                ...gen,
                cards: gen.cards.map((c, i) =>
                  cardIds[i] ? { ...c, id: cardIds[i] } : c
                ),
              };
            }),
          },
        })),

      deleteCard: (tab, genId, cardIdx) =>
        set((state) => ({
          generationsByTab: {
            ...state.generationsByTab,
            [tab]: state.generationsByTab[tab]
              .map((gen) =>
                gen.id !== genId
                  ? gen
                  : { ...gen, cards: gen.cards.filter((_, i) => i !== cardIdx) }
              )
              .filter((gen) => gen.cards.length > 0),
          },
        })),

      deleteSelectedCards: (tab, selectedSet) =>
        set((state) => {
          const toDelete = {};
          selectedSet.forEach((key) => {
            const lastDash = key.lastIndexOf('-');
            const genId = key.slice(0, lastDash);
            const cardIdx = parseInt(key.slice(lastDash + 1));
            if (!toDelete[genId]) toDelete[genId] = new Set();
            toDelete[genId].add(cardIdx);
          });
          return {
            generationsByTab: {
              ...state.generationsByTab,
              [tab]: state.generationsByTab[tab]
                .map((gen) => {
                  if (!toDelete[gen.id]) return gen;
                  return {
                    ...gen,
                    cards: gen.cards.filter((_, i) => !toDelete[gen.id].has(i)),
                  };
                })
                .filter((gen) => gen.cards.length > 0),
            },
          };
        }),

      toggleFavorite: (cardKey) =>
        set((state) => {
          const next = new Set(state.favorites);
          if (next.has(cardKey)) next.delete(cardKey);
          else next.add(cardKey);
          return { favorites: next };
        }),
    }),
    {
      name: 'creation-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              favorites: new Set(parsed.state?.favorites || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              favorites: [...value.state.favorites],
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        generationsByTab: state.generationsByTab,
        favorites: state.favorites,
      }),
      version: 1,
    }
  )
);
