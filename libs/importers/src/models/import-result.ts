import { CipherView } from "@bitwarden/common/src/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/src/models/view/collection.view";
import { FolderView } from "@bitwarden/common/src/models/view/folder.view";

export class ImportResult {
  success = false;
  missingPassword = false;
  errorMessage: string;
  ciphers: CipherView[] = [];
  folders: FolderView[] = [];
  folderRelationships: [number, number][] = [];
  collections: CollectionView[] = [];
  collectionRelationships: [number, number][] = [];
}
