import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="h-16 px-4 w-full border-b border-b-border flex justify-between items-center">
      <Link className="font-black text-lg text-foreground" href="/">
        zkLC
      </Link>

      <div></div>

      <ConnectButton />
    </div>
  );
};
