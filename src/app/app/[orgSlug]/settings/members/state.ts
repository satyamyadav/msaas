export type InviteFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const initialInviteFormState: InviteFormState = { status: "idle" };
