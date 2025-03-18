
import { ColumnDef } from "@tanstack/react-table";
import { CoinMarketData } from "@/lib/api/coingecko";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

export const columns: ColumnDef<CoinMarketData>[] = [
  {
    accessorKey: "market_cap_rank",
    header: "Rank",
    cell: ({ row }) => <div className="font-medium">#{row.getValue("market_cap_rank")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img src={row.original.image} alt={row.getValue("name")} className="w-6 h-6" />
        <span className="font-medium">{row.getValue("name")}</span>
        <span className="text-muted-foreground uppercase">{row.original.symbol}</span>
      </div>
    ),
  },
  {
    accessorKey: "current_price",
    header: "Price",
    cell: ({ row }) => (
      <div className="font-medium">
        ${row.getValue<number>("current_price").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    ),
  },
  {
    accessorKey: "price_change_percentage_24h",
    header: "24h Change",
    cell: ({ row }) => {
      const change = row.getValue<number>("price_change_percentage_24h");
      return (
        <div className={`flex items-center ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
          {change >= 0 ? <ArrowUpIcon className="mr-1" /> : <ArrowDownIcon className="mr-1" />}
          {Math.abs(change).toFixed(2)}%
        </div>
      );
    },
  },
  {
    accessorKey: "market_cap",
    header: "Market Cap",
    cell: ({ row }) => (
      <div className="font-medium">
        ${row.getValue<number>("market_cap").toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
    ),
  },
  {
    accessorKey: "total_volume",
    header: "Volume (24h)",
    cell: ({ row }) => (
      <div className="font-medium">
        ${row.getValue<number>("total_volume").toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
    ),
  },
];
