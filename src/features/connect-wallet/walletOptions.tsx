import clsx from 'clsx';
import { useEffect } from 'react';
import { useLocalStorage, useToggle } from 'react-use';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSignMessage,
} from 'wagmi';

import { Loading } from '@/components/loading';
import { Logo } from '@/components/logos';
import { isAuthed, useAuthContext } from '@/hooks/useAuth';
import useNavigator from '@/hooks/useNavigator';
import {
  submitGetLoginMessage,
  submitVerifySignedMessage,
} from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';

import type { UserLocalStorage } from '@/models/user';
import type { Connector } from 'wagmi';

interface Props {
  onError?: (text?: string) => void;
}

export function WalletOptions({ onError }: Props) {
  const [startLogin, setStartLogin] = useToggle(false);
  const [isLogining, setIsLogining] = useToggle(false);
  const [_token, setToken] = useLocalStorage<string>('authToken');
  const [_user, setUser] = useLocalStorage<UserLocalStorage>('user');
  const { isConnected, connector: activeConnector, address } = useAccount();
  const { disconnect } = useDisconnect();
  const navigator = useNavigator();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const open = useModalStore((s) => s.open);
  const { connect, connectors, isLoading } = useConnect({
    onError(error, variables) {
      if (error.name === 'ConnectorNotFoundError') {
        if (variables.connector.id === 'metaMask') {
          open('metamask');
        }
      }
    },
  });
  const authToken = useAuthContext();

  useEffect(() => {
    const asyncAuth = async () => {
      try {
        setIsLogining(true);
        if (address && chain?.id) {
          const messageParams = {
            walletAddress: address,
            chain: `${chain?.id}`,
            network: 'evm',
          };
          const { message } = await submitGetLoginMessage(messageParams);
          const signature = await signMessageAsync({ message });
          const { token, userId, userProfile } =
            await submitVerifySignedMessage({
              message,
              signature,
            });

          useAuthStore.setState({
            token,
            user: { userId, walletAddress: address, isNewUser: !userProfile },
          });

          if (!userProfile) {
            navigator.goToWelcome();
          } else {
            navigator.goToUserSettings();
          }
        }
      } catch (error) {
        console.error('asyncAuth::', error);
        onError && onError('Connect Wallet Failed. Please try again.');
        // TODO: logger
      } finally {
        setIsLogining(false);
        setStartLogin(false);
        disconnect();
      }
    };

    if (isAuthed(authToken) && _user) {
      if (_user.isNewUser) {
        navigator.goToWelcome();
      } else {
        navigator.goToUserSettings();
      }
    } else if (
      startLogin &&
      !isLogining &&
      !isLoading &&
      isConnected &&
      !isAuthed(authToken)
    ) {
      void asyncAuth();
    }
  }, [
    isConnected,
    activeConnector,
    navigator,
    authToken,
    address,
    chain,
    startLogin,
    isLogining,
    isLoading,
    _user,
    setIsLogining,
    setStartLogin,
    setToken,
    setUser,
    signMessageAsync,
    disconnect,
    onError,
  ]);

  const onClick = (connector: Connector) => {
    setStartLogin(true);
    if (!isConnected || activeConnector?.id !== connector.id) {
      connect({ connector });
    }
  };

  return (
    <>
      <div className="w-[320px]">
        {connectors.map((connector, i) => (
          <button
            className={clsx(
              'w-full h-12 border-t border-l border-r border-solid border-[#E4E4E4] flex flex-row items-center px-4 gap-x-4',
              'hover:bg-[#E4E4E4]',
              {
                'rounded-t-md': i === 0,
                'rounded-b-md border-b': i === connectors.length - 1,
              },
            )}
            // disabled={!connector.ready}
            key={connector.id}
            onClick={() => onClick(connector)}
          >
            <Logo code={connector.name} />
            <span>{connector.name}</span>
            {/* {!connector.ready && ' (unsupported)'} */}
          </button>
        ))}
      </div>
      {isLoading || isLogining ? <Loading /> : null}
    </>
  );
}