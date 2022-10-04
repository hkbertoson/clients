import { Subject } from "rxjs";

import { ProfileResponse } from "@bitwarden/common/models/response/profileResponse";


export abstract class AvatarUpdateService {
  avatarUpdated$ = new Subject<string | null>();
  abstract pushUpdate(color: string) : Promise<ProfileResponse| void>;
  abstract loadColorFromState(): Promise<string | null>;
}
