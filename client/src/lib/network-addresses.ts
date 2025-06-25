
interface NetworkAddress {
  network: string;
  address: string;
}

interface CoinNetworks {
  [key: string]: NetworkAddress[];
}

export const networkAddresses: CoinNetworks = {
  BTC: [
    { network: "NATIVE", address: "1FqZ9cjGeb86WKgMeBeRHmN4LvYfF24cg7" },
    { network: "BSC", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" },
    { network: "LIGHTNING", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" }
  ],
  USDT: [
    { network: "ERC20", address: "1FqZ9cjGeb86WKgMeBeRHmN4LvYfF24cg7" },
    { network: "TRC20", address: "TZAxJfSr7EcQHfQ76MdMZcLLPMH2YjFq2Y" },
    { network: "BSC", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" }
  ],
  BNB: [
    { network: "BSC", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" },
    { network: "BEP2", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" },
    { network: "ERC20", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" }
  ],
  WLD: [
    { network: "ERC20", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" },
    { network: "OPTIMISM", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" },
    { network: "WORLD", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" }
  ],
  USDC: [
    { network: "ERC20", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" },
    { network: "SOLANA", address: "7qKBhzgQQaDDYKjBPCKNkYVkppbTcpp5cpHhkqKheRtn" },
    { network: "BSC", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" }
  ],
  SOL: [
    { network: "NATIVE", address: "7qKBhzgQQaDDYKjBPCKNkYVkppbTcpp5cpHhkqKheRtn" },
    { network: "ERC20", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" },
    { network: "BSC", address: "0xe5819dbd958be2e2113415abda3ebadf9855ee4c" }
  ]
};
