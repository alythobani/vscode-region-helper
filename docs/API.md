# 📡 Region Helper API

Region Helper provides an API that other extensions can use to access **code regions** and **full outline symbols**.

## 🔌 Accessing the API

```ts
import * as vscode from "vscode";

async function getRegionHelperAPI() {
  const extension = vscode.extensions.getExtension("alythobani.region-helper");
  if (!extension) return undefined;
  if (!extension.isActive) await extension.activate();
  return extension.exports;
}
```

### Example: Fetching and Using Region Data

```ts
async function logRegions() {
  const regionHelperAPI = await getRegionHelperAPI();
  if (!regionHelperAPI) return;

  const regions = regionHelperAPI.getFlattenedRegions();
  console.log("Regions in current file:", regions);
}
```

## 📚 API Reference

### Regions API

| Method                  | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `getTopLevelRegions()`  | Returns a list of top-level regions in the active file. |
| `getFlattenedRegions()` | Returns all regions in a flat, ordered list.            |
| `getActiveRegion()`     | Returns the cursor's active region, if any.            |

| Event                     | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `onDidChangeRegions`      | Fires when the list of regions changes.        |
| `onDidChangeActiveRegion` | Fires when the cursor's active region changes. |

### Full Outline API

| Method                          | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `getTopLevelFullOutlineItems()` | Returns top-level items from the full outline view.         |
| `getActiveFullOutlineItem()`    | Returns the cursor's active item in the full outline view.  |

| Event                              | Description                                  |
| ---------------------------------- | -------------------------------------------- |
| `onDidChangeFullOutlineItems`      | Fires when the full outline updates.         |
| `onDidChangeActiveFullOutlineItem` | Fires when the cursor's active item changes. |

## Additional Notes

- The **API is only available when the extension is activated**.
- **Events are per-file** and will fire when the active document changes and is parsed.
- Events do not pass any arguments; they're meant to signal that the data has changed and should be re-fetched.
- The `get...` methods work in constant time, returning snapshots of the data at the time of the call.
