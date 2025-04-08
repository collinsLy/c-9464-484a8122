
import Marquee from 'react-fast-marquee';

const partners = [
  {
    name: "Binance",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/Binance_logo.svg"
  },
  {
    name: "Biget",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/Logo_Biget.svg"
  },
  {
    name: "Bybit",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/Bybit_Logo.svg"
  },
  {
    name: "Coinbase",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg"
  },
  {
    name: "KuCoin",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/39/KUCOIN.svg"
  },
  {
    name: "Huobi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Huobi-logo.png"
  },
  {
    name: "OKX",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/OKX_Logo.svg"
  },
  {
    name: "CoinGecko",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/CoinGecko_logo.png"
  }
];

const Partners = () => {
  return (
    <div className="py-12 bg-[#0F1115] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-white mb-8">Our Partners</h2>
        <Marquee
          speed={50}
          gradient={false}
          pauseOnHover
          loop={0}
          autoFill={true}
        >
          {partners.map((partner) => (
            <div key={partner.name} className="mx-12">
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default Partners;
