
interface NetworkAddress {
  network: string;
  address: string;
}

interface CoinNetworks {
  [key: string]: NetworkAddress[];
}

export const networkAddresses: CoinNetworks = {
  BTC: [
    { network: "NATIVE", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
    { network: "BSC", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    { network: "LIGHTNING", address: "lnbc1p3xhzjhpp5..." }
  ],
  USDT: [
    { network: "ERC20", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    { network: "TRC20", address: "TRX7NB5Gku8bGxQRpwUTZPw9qBYvyVpwJD" },
    { network: "BSC", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
  ],
  BNB: [
    { network: "BSC", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    { network: "BEP2", address: "bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m" },
    { network: "ERC20", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
  ],
  WLD: [
    { network: "ERC20", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    { network: "OPTIMISM", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    { network: "POLYGON", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
  ],
  USDC: [
    { network: "ERC20", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    { network: "SOLANA", address: "7qKBhzgQQaDDYKjBPCKNkYVkppbTcpp5cpHhkqKheRtn" },
    { network: "POLYGON", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
  ],
  SOL: [
    { network: "NATIVE", address: "7qKBhzgQQaDDYKjBPCKNkYVkppbTcpp5cpHhkqKheRtn" },
    { network: "ERC20", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    { network: "BSC", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
  ]
};
