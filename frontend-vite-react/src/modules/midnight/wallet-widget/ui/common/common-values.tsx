import { JSX } from "react";
import IconLace from "./icons/icon-lace";

export const walletsListFormat: {
    [key: string]: { key: string; displayName: string; icon: JSX.Element };
  } = {
    lace: { key: "mnLace", displayName: "LACE", icon: <IconLace /> },
  };

export enum networkID {
  UNDEPLOYED = "undeployed",
  PREVIEW = "preview", 
  PREPROD = "preprod",
  MAINNET = "mainnet"
}