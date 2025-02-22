import { type Region } from "../models/Region";

export function getRegionDisplayName(region: Region): string {
  return region.name ?? "Unnamed region";
}
