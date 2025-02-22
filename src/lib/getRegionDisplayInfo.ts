import { type Region } from "../models/Region";

export function getRegionDisplayName(region: Region): string {
  return region.name ?? "Unnamed region";
}

export function getRegionRangeText(region: Region): string {
  return `Lines ${region.startLineIdx + 1} to ${region.endLineIdx + 1}`;
}
