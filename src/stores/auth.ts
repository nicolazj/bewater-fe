import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { isBrowser } from '@/constants';
import { UserProfile } from '@/services/types';

interface State {
  token: string;
  expireAt: number;
  user?: UserProfile;
  walletAddress: string;
}

interface Actions {
  isAuthed: () => boolean;
  setState: (state: Partial<State>) => void;
  clear: () => void;
}

const dummyStorage = {
  getItem: (name: string) => {
    return '{}';
  },
  setItem: (name: string, value: string) => {
    // eslint-disable-next-line
    console.log('set', name, value);
  },
  removeItem: (name: string) => {
    // eslint-disable-next-line
    console.log('remove', name);
  },
};
const init = {
  token: '',
  user: undefined,
  expireAt: 0,
  walletAddress: '',
};
export const useAuthStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...init,
      isAuthed: () => {
        return !!get().token && get().expireAt > Date.now();
      },
      setState: (state) => {
        set(state);
        if (state.token) {
          const decodedToken = jwt.decode(state.token) as JwtPayload;
          set({ expireAt: (decodedToken.exp ?? 0) * 1000 });
        }
      },
      clear: () => {
        set(init);
      },
    }),
    {
      name: 'bewater', // name of item in the storage (must be unique)
      storage: createJSONStorage(() =>
        isBrowser ? localStorage : dummyStorage,
      ),
    },
  ),
);
